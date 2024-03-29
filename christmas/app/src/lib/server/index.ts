import jwt, { type JwtPayload } from "jsonwebtoken";
import type {
    SolanaSignInInput,
    SolanaSignInOutput,
} from "@solana/wallet-standard-features";
import { verifySignIn } from "@solana/wallet-standard-util";
import { ENVIRONMENT } from "$env/static/private";
import {
    PUBLIC_FEE_PAYER_PUBKEY,
    PUBLIC_HOST,
    PUBLIC_RPC_ENDPOINT,
} from "$env/static/public";
import { FEE_PAYER_PRIVATE_KEY as FEE_PAYER_PRIVATE_KEY_JSON } from "$env/static/private";
import base58 from "bs58";
import { getRandomValues, createHash } from "crypto";
import { AnchorClient } from "$lib/anchorClient";
import {
    PublicKey,
    Keypair,
    Transaction,
    TransactionInstruction,
    Connection,
    type Signer,
} from "@solana/web3.js";
import { PROGRAM_ID } from "$lib/anchorClient/defs";
import { error, type RequestEvent } from "@sveltejs/kit";

// Exports
export {
    FEE_PAYER_PUBKEY,
    feePayerKeypair,
    serverAnchorClient,
    verifySIWS,
    createSignInDataForSIWS,
    signJWT,
    verifyJWT,
    requireLogin,
    hashObject,
    createSerializedTransaction,
};

// Load fee payer keypair
const FEE_PAYER_PUBKEY = new PublicKey(PUBLIC_FEE_PAYER_PUBKEY);
const FEE_PAYER_PRIVATE_KEY = new Uint8Array(
    JSON.parse(FEE_PAYER_PRIVATE_KEY_JSON),
);
const feePayerKeypair = Keypair.fromSecretKey(FEE_PAYER_PRIVATE_KEY);

// Create server anchor client
const serverAnchorClientKeypair = Keypair.generate();
const serverAnchorClient = new AnchorClient({
    programId: new PublicKey(PROGRAM_ID),
    keypair: serverAnchorClientKeypair,
    cluster: PUBLIC_RPC_ENDPOINT,
});

async function signJWT(
    payload: object,
    expiresIn: number,
    key: string,
): Promise<string> {
    return new Promise((resolve, reject) => {
        jwt.sign(payload, key, { expiresIn }, (err, token) => {
            if (err) {
                reject(err);
            } else {
                resolve(token!);
            }
        });
    });
}

async function verifyJWT(
    token: string,
    key: string,
): Promise<string | JwtPayload> {
    return new Promise((resolve, reject) => {
        jwt.verify(token, key, (err, decoded) => {
            if (err) {
                reject(err);
            } else {
                resolve(decoded!);
            }
        });
    });
}

async function createSignInDataForSIWS(): Promise<SolanaSignInInput> {
    const now: Date = new Date();
    const currentUrl = new URL(PUBLIC_HOST);
    const domain = currentUrl.host;
    const currentDateTime = now.toISOString();

    let chainId = "localnet";
    if (ENVIRONMENT === "production") {
        chainId = "mainnet";
    } else if (ENVIRONMENT === "staging") {
        chainId = "devnet";
    }

    // generate random nonce (min 8 chars) TODO: Who checks the nonce????
    const nonce = base58.encode(getRandomValues(new Uint8Array(8)));

    const signInData: SolanaSignInInput = {
        domain,
        statement:
            "Clicking Sign or Approve only means you have proved this wallet is owned by you. This request will not trigger any blockchain transaction or cost any gas fee.",
        version: "1",
        nonce: nonce,
        issuedAt: currentDateTime,
        resources: ["https://phantom.app/"],
        chainId,
    };

    return signInData;
}

function verifySIWS(input: SolanaSignInInput, output: any): boolean {
    // Get chains based on environment
    let chains: `${string}:${string}`[] = ["solana:localnet"];
    if (ENVIRONMENT === "production") {
        chains = ["solana:mainnet"];
    } else if (ENVIRONMENT === "staging") {
        chains = ["solana:devnet"];
    }

    // Deserialize output
    const serialisedOutput: SolanaSignInOutput = {
        // Patch for missing account in solanaSignInOutput
        account: {
            address: output.address,
            publicKey: base58.decode(output.address),
            chains: chains,
            features: ["solana:signIn"],
        },
        signature: new Uint8Array(output.signature.data),
        signedMessage: new Uint8Array(output.signedMessage.data),
    };
    return verifySignIn(input, serialisedOutput);
}

function requireLogin(request: RequestEvent): App.UserSession {
    if (!request.locals.user) {
        error(401, "Unauthorized");
    }
    return request.locals.user;
}

function hashObject(obj: any): string {
    const str = sortedStringify(obj);
    const hash = createHash("sha256");
    hash.update(str);
    return hash.digest("hex");
}

function sortedStringify(obj: any): string {
    if (typeof obj !== "object" || obj === null || Array.isArray(obj)) {
        return JSON.stringify(obj);
    }
    const keys = Object.keys(obj).sort();
    const sortedObj = keys
        .map((key) => `${JSON.stringify(key)}:${sortedStringify(obj[key])}`)
        .join(",");
    return `{${sortedObj}}`;
}

async function createSerializedTransaction(
    ix: TransactionInstruction,
    signers?: Array<Signer>,
) {
    // Set up connection and signer
    const connection = new Connection(PUBLIC_RPC_ENDPOINT, "processed");

    // Get latest blockchash and block height
    let latestBlockHash = await connection.getLatestBlockhash();

    // Create tx with recent blockhash and splTransferIx
    let tx = new Transaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        feePayer: FEE_PAYER_PUBKEY, // pay for transaction fee
    });

    // Add procedure instruction
    tx.add(ix);

    // Partially sign to take on fees
    tx.partialSign(feePayerKeypair);

    // additional signers if required
    if (signers) {
        tx.partialSign(...signers);
    }

    // Serialize partially signed transaction (serialize verification done on client side).
    const serializedTransaction = tx.serialize({
        verifySignatures: false,
        requireAllSignatures: false,
    });
    const base64Transaction = serializedTransaction.toString("base64");

    return base64Transaction;
}
