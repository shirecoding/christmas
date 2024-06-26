import {
    claimCoupon,
    createCoupon,
    createStore,
    fetchClaimedCoupons,
    fetchCouponMetadata,
    fetchMarketCoupons,
    fetchMintedCouponSupplyBalance,
    fetchStores,
    fetchUser,
    mintCoupon,
    redeemCoupon,
    verifyRedemption,
} from "$lib/community";
import { stringToUint8Array } from "$lib/utils";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import { Keypair } from "@solana/web3.js";
import { BN } from "bn.js";
import ngeohash from "ngeohash";
import { expect, test } from "vitest";
import {
    getCookiesFromResponse,
    getRandomRegion,
    login,
    readImageAsBuffer,
    readImageAsDataUrl,
} from "../utils";

test("Test Coupon", async () => {
    const user = Keypair.generate();
    const userWallet = new NodeWallet(user);

    // Login
    let response = await login(user);
    const cookies = getCookiesFromResponse(response);

    // Read image from ../static/demo/assets/coupon_cat.jpeg
    const imagePath = "../static/demo/assets/coupon_cat.jpeg";
    const imageDataUrl = await readImageAsDataUrl(imagePath);
    const imageBlob = new Blob([readImageAsBuffer(imagePath)], {
        type: "image/jpeg",
    });

    // Dates
    const today = new Date();
    const afterToday = new Date(today);
    afterToday.setMonth(afterToday.getMonth() + 3);
    const beforeToday = new Date(today);
    beforeToday.setMonth(beforeToday.getMonth() - 3);

    // Locations
    const geohash = "gbsuv7";
    const { latitude, longitude } = ngeohash.decode(geohash);
    const region = getRandomRegion();

    // Create store
    let tx = await createStore(
        {
            name: "store",
            description: user.publicKey.toBase58(),
            address: user.publicKey.toBase58(),
            region,
            latitude,
            longitude,
            geohash: Array.from(stringToUint8Array(geohash)),
            image: imageDataUrl,
        },
        {
            headers: { Cookie: cookies },
            wallet: userWallet,
        },
    );
    expect(tx.result.err).toBeNull();

    // Fetch store
    const stores = await fetchStores({ Cookie: cookies });
    expect(stores.length).toBe(1);
    expect(stores[0].account).toMatchObject({
        name: "store",
        region,
        geohash: Array.from(stringToUint8Array(geohash)),
        owner: user.publicKey.toBase58(),
    });

    // Create coupon
    tx = await createCoupon(
        {
            image: imageDataUrl,
            name: "coupon",
            description: user.publicKey.toBase58(),
            validFrom: beforeToday,
            validTo: afterToday,
            store: stores[0],
        },
        {
            headers: { Cookie: cookies },
            wallet: userWallet,
        },
    );
    expect(tx.result.err).toBeNull();

    // Fetch coupon
    let coupons = await fetchMintedCouponSupplyBalance(stores[0].publicKey, {
        Cookie: cookies,
    });
    expect(coupons.length).toBe(1);
    let [coupon, supply, balance] = coupons[0];
    expect(supply).toBe(0);
    expect(balance).toBe(0);
    expect(coupon.account).toMatchObject({
        name: "coupon",
        updateAuthority: user.publicKey.toBase58(),
        store: stores[0].publicKey.toString(),
        region,
        geohash: Array.from(stringToUint8Array(geohash)),
        validFrom: new BN(beforeToday.getTime()),
        validTo: new BN(afterToday.getTime()),
    });

    // Fetch coupon metadata
    const metadata = await fetchCouponMetadata(coupon, {
        Cookie: cookies,
    });
    expect(metadata).toMatchObject({
        name: "coupon",
        description: user.publicKey.toBase58(),
    });

    // Fetch Image
    response = await fetch(metadata.image);
    await expect(response.blob()).resolves.toEqual(imageBlob);

    // Fetch coupon image
    const blob = await (await fetch(metadata.image)).blob();
    expect(blob).toMatchObject(imageBlob);

    // Mint coupon
    tx = await mintCoupon(
        {
            coupon: coupon,
            numTokens: 2,
        },
        {
            headers: { Cookie: cookies },
            wallet: userWallet,
        },
    );
    expect(tx.result.err).toBeNull();

    // Fetch Market Coupons
    const marketCoupons = await fetchMarketCoupons(
        {
            region,
            geohash: Array.from(stringToUint8Array(geohash)),
        },
        { Cookie: cookies },
    );
    expect(marketCoupons.length).greaterThanOrEqual(1);

    // get the last coupon in marketCoupons
    [coupon, supply] = marketCoupons[0];
    expect(supply).toBe(2);
    expect(coupon.account).toMatchObject({
        name: "coupon",
        updateAuthority: user.publicKey.toString(),
        store: stores[0].publicKey.toString(),
        region,
        geohash: Array.from(stringToUint8Array(geohash)),
        validFrom: new BN(beforeToday.getTime()),
        validTo: new BN(afterToday.getTime()),
    });

    // Fetch coupon supply balance
    coupons = await fetchMintedCouponSupplyBalance(stores[0].publicKey, {
        Cookie: cookies,
    });
    expect(coupons.length).toBe(1);
    [coupon, supply, balance] = coupons[0];
    expect(supply).toBe(2);
    expect(balance).toBe(2);

    // Claim coupon (to UserSession's UserAccount)
    tx = await claimCoupon(
        {
            coupon,
            numTokens: 1,
        },
        {
            headers: { Cookie: cookies },
            wallet: userWallet,
        },
    );

    // Check UserSession's UserAccount created
    const createdUser = await fetchUser({ Cookie: cookies });
    expect(createdUser).toMatchObject({
        region,
    });

    // Check coupon supply balance
    coupons = await fetchMintedCouponSupplyBalance(stores[0].publicKey, {
        Cookie: cookies,
    });
    expect(coupons.length).toBe(1);
    [coupon, supply, balance] = coupons[0];
    expect(supply).toBe(2);
    expect(balance).toBe(1);

    // Check claimed coupons
    let claimedCoupons = await fetchClaimedCoupons({ Cookie: cookies });
    expect(claimedCoupons.length).toBe(1);
    [coupon, balance] = claimedCoupons[0];
    expect(balance).toBe(1);
    expect(coupon.account.name).toBe("coupon");

    // Redeem coupon
    tx = await redeemCoupon(
        {
            coupon,
            numTokens: 1,
        },
        {
            headers: { Cookie: cookies },
            wallet: userWallet,
        },
    );
    expect(tx.result.err).toBeNull();

    // Verify redemption
    const { isVerified, err } = await verifyRedemption(
        {
            signature: tx.signature,
            mint: coupon.account.mint.toString(),
            numTokens: 1,
            wallet: userWallet.publicKey.toString(),
        },
        { Cookie: cookies },
    );
    expect(isVerified).toBe(true);
    expect(err).toBeFalsy();

    // Check claimed coupons after redeeming
    claimedCoupons = await fetchClaimedCoupons({ Cookie: cookies });
    expect(claimedCoupons.length).toBe(0);
});
