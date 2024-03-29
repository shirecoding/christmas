<script lang="ts">
    import type { SvelteComponent } from "svelte";
    import { getModalStore } from "@skeletonlabs/skeleton";
    import BaseCouponCard from "./BaseCouponCard.svelte";
    import type { Account, Coupon } from "$lib/anchorClient/types";
    import { generateURL, timeStampToDate } from "$lib/utils";
    import QrCode from "./QRCode.svelte";
    import { redeemCoupon } from "$lib/community";
    import type { CouponMetadata, StoreMetadata } from "$lib/community/types";

    export let parent: SvelteComponent;

    const modalStore = getModalStore();

    let coupon: Account<Coupon> = $modalStore[0].meta.coupon;
    let couponMetadata: CouponMetadata = $modalStore[0].meta.couponMetadata;
    let storeMetadata: StoreMetadata = $modalStore[0].meta.storeMetadata;
    let distance: number = $modalStore[0].meta.distance;
    let balance: number = $modalStore[0].meta.balance;
    let redemptionQRCodeURL: string | null =
        $modalStore[0].meta.redemptionQRCodeURL;

    async function onRedeemCoupon() {
        if ($modalStore[0].response) {
            const numTokens = 1;
            const transactionResult = await redeemCoupon({ numTokens, coupon });

            // Generate redemptionQRCodeURL
            redemptionQRCodeURL = generateURL({
                signature: transactionResult.signature,
                wallet: (window as any).solana.publicKey.toString(),
                mint: coupon.account.mint.toString(),
                numTokens: String(numTokens),
            });

            $modalStore[0].response(redemptionQRCodeURL);
        }
    }
</script>

{#if $modalStore[0]}
    <div class="card shadow-xl flex flex-col">
        <header class="card-header mx-auto">
            {#if balance < 1}
                <!-- Will never reach this  -->
                <p>This coupon has been used</p>
            {:else if redemptionQRCodeURL}
                <QrCode data={redemptionQRCodeURL} height={300} width={300}
                ></QrCode>
            {:else}
                <BaseCouponCard
                    couponName={coupon.account.name}
                    couponDescription={couponMetadata.description}
                    couponImageUrl={couponMetadata.image}
                    storeName={storeMetadata.name}
                    storeAddress={storeMetadata.address}
                    storeImageUrl={storeMetadata.image}
                    {distance}
                    remaining={balance}
                    expiry={timeStampToDate(coupon.account.validTo)}
                    {redemptionQRCodeURL}
                ></BaseCouponCard>
            {/if}
        </header>

        <section class="p-4">
            <p>
                This coupon will be only be valid for <span
                    class="text-success-400 font-bold">15mins</span
                >. Make sure you are at the location before
                <span class="underline font-bold">using</span> it.
            </p>
        </section>

        <footer class="card-footer {parent.regionFooter}">
            {#if redemptionQRCodeURL}
                <button
                    class="btn {parent.buttonNeutral}"
                    on:click={parent.onClose}>Ok it's verified</button
                >
            {:else}
                <button
                    class="btn {parent.buttonNeutral}"
                    on:click={parent.onClose}>Save it for later</button
                >
                <button
                    class="btn {parent.buttonPositive}"
                    on:click={onRedeemCoupon}>Use it now</button
                >
            {/if}
        </footer>
    </div>
{/if}
