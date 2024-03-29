import * as anchor from "@coral-xyz/anchor";
import { BN, web3 } from "@coral-xyz/anchor";
import { getMint } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import { assert, expect } from "chai";
import { PROGRAM_ID } from "../app/src/lib/anchorClient/defs";
import { COUNTRY_DETAILS } from "../app/src/lib/userDeviceClient/defs";
import {
    cleanString,
    extractQueryParams,
    generateURL,
    stringToUint8Array,
} from "../app/src/lib/utils";
import { getRandomAnchorClient, getRandomDate, getRandomRegion } from "./utils";

describe("Test client", () => {
    // locations
    const geohash = Array.from(stringToUint8Array("gbsuv7"));
    const region = getRandomRegion();

    // store
    let storeId: BN;
    let storePda: PublicKey;
    const storeName = "My store";
    const storeUri = "https://example.com";

    // coupon
    const couponName = "coupon1";
    const couponUri = "www.example.com";

    // validity period (randomize)
    const validFrom = getRandomDate(2024, 2300);
    const validTo = new Date(validFrom.getTime());
    validTo.setMonth(validTo.getMonth() + 4);
    const today = new Date(validFrom.getTime());
    today.setMonth(today.getMonth() + 2);

    console.log(`

        region: ${region}
        validFrom: ${validFrom}
        validTo: ${validTo}
        today: ${today}
    
    `);

    // users
    const [sellerKeypair, sellerClient] = getRandomAnchorClient();
    const [buyerKeypair, buyerClient] = getRandomAnchorClient();

    it("Initialize AnchorClients", async () => {
        expect(sellerClient.cluster).to.equal("http://127.0.0.1:8899");
        assert.ok(sellerClient.programId.equals(new PublicKey(PROGRAM_ID)));
        assert.ok(
            sellerClient.provider.publicKey?.equals(sellerKeypair.publicKey)
        );

        // airdrop wallets for transactions
        await sellerClient.requestAirdrop(100e9);
        await buyerClient.requestAirdrop(100e9);
    });

    it("Initialize Program", async () => {
        await sellerClient.initializeProgram();

        const [programStatePda, _] = web3.PublicKey.findProgramAddressSync(
            [anchor.utils.bytes.utf8.encode("state")],
            sellerClient.programId
        );

        const programState =
            await sellerClient.program.account.programState.fetch(
                programStatePda
            );

        // check initialized
        assert.ok(programState.isInitialized);
    });

    it("Create Users", async () => {
        await sellerClient.createUser({ region, uri: "" });
        await buyerClient.createUser({ region, uri: "" });

        const seller = await sellerClient.getUser();
        expect(seller.region).to.eql(region);
        const buyer = await buyerClient.getUser();
        expect(buyer.region).to.eql(region);
    });

    it("Update User", async () => {
        const updatedRegionIdx = Math.floor(
            Math.random() * Object.values(COUNTRY_DETAILS).length
        );
        const updatedRegionCode =
            Object.values(COUNTRY_DETAILS)[updatedRegionIdx][0];

        const updatedUri = "https://updated.com";

        const updatedRegion = Array.from(stringToUint8Array(updatedRegionCode));
        await buyerClient.updateUser({
            region: updatedRegion,
            uri: updatedUri,
        });

        const buyer = await buyerClient.getUser();
        expect(buyer.region).to.eql(updatedRegion);
        expect(cleanString(buyer.uri)).to.eql(updatedUri);
    });

    it("Create Store", async () => {
        storeId = await sellerClient.getAvailableStoreId();

        await sellerClient.createStore({
            name: storeName,
            uri: storeUri,
            region,
            geohash,
        });

        // test next store_counter
        assert.ok(storeId.addn(1).eq(await sellerClient.getAvailableStoreId()));

        let store = await sellerClient.getStore(storeId);
        assert.equal(cleanString(store.name), storeName);
        expect(store.region).to.eql(region);
        assert.equal(cleanString(store.uri), storeUri);
        expect(store.geohash).to.eql(geohash);
        assert.ok(store.id.eq(storeId));
        assert.ok(store.owner.equals(sellerClient.wallet.publicKey));

        // get store by owner
        store = await sellerClient.getStore(
            storeId,
            sellerClient.wallet.publicKey
        );
        assert.equal(cleanString(store.name), storeName);
        expect(store.region).to.eql(region);
        assert.equal(cleanString(store.uri), storeUri);
        expect(store.geohash).to.eql(geohash);
        assert.ok(store.id.eq(storeId));
        assert.ok(store.owner.equals(sellerClient.wallet.publicKey));
    });

    it("Create Coupon", async () => {
        // get store
        storePda = (await sellerClient.getStorePda(storeId))[0];

        // create coupon (within validity period)
        assert.isNull(
            (
                await sellerClient.createCoupon({
                    geohash,
                    region,
                    store: storePda,
                    name: couponName,
                    uri: couponUri,
                    validFrom,
                    validTo,
                })
            ).result.err
        );

        // check if coupon is created
        const coupons = await sellerClient.getMintedCoupons({
            store: storePda,
        });
        assert.ok(coupons.length === 1);
        const [coupon, supply, balance] = coupons[0];

        expect(coupon.account.geohash).to.eql(geohash);
        expect(coupon.account.region).to.eql(region);
        assert.equal(cleanString(coupon.account.uri), couponUri);
        assert.equal(cleanString(coupon.account.name), couponName);
        assert.ok(
            coupon.account.updateAuthority.equals(sellerClient.wallet.publicKey)
        );
        assert.ok(coupon.account.store.equals(storePda));
    });

    it("Mint coupon", async () => {
        const numTokens = 10;

        // check mint supply before
        const coupons = await sellerClient.getMintedCoupons({
            store: storePda,
        });
        assert.ok(coupons.length === 1);
        const [coupon, supply, _balance] = coupons[0]; // mint the first coupon
        assert.equal(supply, 0);

        // mint coupon to region market
        assert.isNull(
            (
                await sellerClient.mintToMarket({
                    mint: coupon.account.mint,
                    region: coupon.account.region,
                    coupon: coupon.publicKey,
                    numTokens,
                })
            ).result.err
        );

        // check regionMarket created
        const [regionMarketPda, regionMarketTokenAccountPda] =
            await sellerClient.getRegionMarketPdasFromMint(coupon.account.mint);
        let regionMarket =
            await sellerClient.program.account.regionMarket.fetch(
                regionMarketPda
            );
        expect(regionMarket.region).to.eql(coupon.account.region);

        // check regionMarketTokenAccountPda balance
        const balance = await sellerClient.connection.getTokenAccountBalance(
            regionMarketTokenAccountPda
        );
        assert.equal(balance.value.amount, `${numTokens}`);

        // check mint supply after
        assert.equal(
            (await getMint(sellerClient.connection, coupon.account.mint))
                .supply,
            BigInt(numTokens)
        );
    });

    it("Get coupons efficiently", async () => {
        // get coupons
        const coupons = await sellerClient.getCouponsEfficiently({
            region,
            geohash,
            date: today,
        });

        assert.ok(coupons.length === 1);
        const coupon = coupons[0];
        expect(coupon.account.geohash).to.eql(geohash);
        expect(coupon.account.region).to.eql(region);
        assert.equal(cleanString(coupon.account.uri), couponUri);
        assert.equal(cleanString(coupon.account.name), couponName);
    });

    it("Get coupons", async () => {
        // get coupons
        const coupons = await sellerClient.getCoupons({
            region,
            geohash,
            date: today,
        });
        console.log("coupons.length", coupons.length);
        assert.ok(coupons.length === 1);
        const [coupon, _] = coupons[0];

        expect(coupon.account.geohash).to.eql(geohash);
        expect(coupon.account.region).to.eql(region);
        assert.equal(cleanString(coupon.account.uri), couponUri);
        assert.equal(cleanString(coupon.account.name), couponName);
    });

    it("Claim from market", async () => {
        // get coupon from seller
        const coupons = await sellerClient.getMintedCoupons({
            store: storePda,
        });
        assert.ok(coupons.length === 1);
        const [coupon, supply, balance] = coupons[0];

        // userTokenAccount not created at this point
        const userTokenAccount = await buyerClient.getUserTokenAccount(
            coupon.account.mint
        );

        // claim 1 token
        await buyerClient.claimFromMarket({
            mint: coupon.account.mint,
            numTokens: 1,
        });

        // check balance after
        const balanceAfter =
            await buyerClient.connection.getTokenAccountBalance(
                userTokenAccount
            );
        assert.equal(balanceAfter.value.amount, `1`);
    });

    it("Get claimed coupons", async () => {
        const couponsBalance = await buyerClient.getClaimedCoupons();

        assert.equal(couponsBalance.length, 1);

        const [coupon, balance] = couponsBalance[0];

        assert.equal(balance, 1);
        expect(coupon.account.geohash).to.eql(geohash);
        expect(coupon.account.region).to.eql(region);
        assert.equal(cleanString(coupon.account.uri), couponUri);
        assert.equal(cleanString(coupon.account.name), couponName);
    });

    it("Redeem coupon", async () => {
        // get coupon
        const coupons = await sellerClient.getMintedCoupons({
            store: storePda,
        });
        assert.ok(coupons.length === 1);
        const [coupon, supply, balance] = coupons[0];

        const userTokenAccount = await buyerClient.getUserTokenAccount(
            coupon.account.mint
        );

        // check balance before
        const balanceBefore =
            await buyerClient.connection.getTokenAccountBalance(
                userTokenAccount
            );
        assert.equal(balanceBefore.value.amount, `1`);

        // redeem token
        const couponPda = buyerClient.getCouponPda(coupon.account.mint)[0];
        const transactionResult = await buyerClient.redeemCoupon({
            coupon: couponPda,
            mint: coupon.account.mint,
            numTokens: 1,
        });

        // check balance after
        const balanceAfter =
            await buyerClient.connection.getTokenAccountBalance(
                userTokenAccount
            );
        assert.equal(balanceAfter.value.amount, `0`);

        // test redemption QR code
        const redemptionQRCodeURL = generateURL({
            signature: transactionResult.signature,
            wallet: buyerClient.wallet.publicKey.toString(),
            mint: coupon.account.mint.toString(),
            numTokens: String(1),
        });

        // compare 2 urls

        assert.equal(
            redemptionQRCodeURL,
            `https://\${origin}/?mint=${
                coupon.account.mint
            }&numTokens=${1}&signature=${
                transactionResult.signature
            }&wallet=${buyerClient.wallet.publicKey.toString()}`
        );

        // test extract redemption parameters
        const redemptionParams = extractQueryParams(redemptionQRCodeURL);
        expect(redemptionParams).to.deep.equal({
            signature: String(transactionResult.signature),
            wallet: buyerClient.wallet.publicKey.toString(),
            mint: String(coupon.account.mint),
            numTokens: String(1),
        });

        // test verify redemption
        const result = await sellerClient.verifyRedemption({
            signature: redemptionParams.signature,
            wallet: new web3.PublicKey(redemptionParams.wallet),
            mint: new web3.PublicKey(redemptionParams.mint),
            numTokens: parseInt(redemptionParams.numTokens),
        });
        assert.equal(result.isVerified, true);

        // TODO: add tests for failed verification (possible make this a separate test)
    });
});
