<script lang="ts">
    import { fetchCouponMetadata, fetchStoreMetadata } from "$lib/community";
    import type { Coupon } from "$lib/community/types";
    import QrCode from "$lib/components/common/QRCode.svelte";
    import { Button } from "$lib/components/ui/button";
    import * as Dialog from "$lib/components/ui/dialog";
    import { Separator } from "$lib/components/ui/separator";
    import { calculateDistance } from "$lib/utils";
    import { Dialog as BitsDialog } from "bits-ui";
    import { redeemedCoupons, userDeviceClient } from "../../../store";
    import BaseCouponCard from "./BaseCouponCard.svelte";
    import LoadingCoupon from "./LoadingCoupon.svelte";

    export let coupon: Coupon;
    export let balance: number;
    export let onRedeemCoupon: (redeemCouponParams: {
        numTokens: number;
        coupon: Coupon;
    }) => void;

    let redeemCouponOpen: boolean = false;

    async function fetchMetadata() {
        const couponMetadata = await fetchCouponMetadata(coupon);
        const storeMetadata = await fetchStoreMetadata(coupon.store);
        const distance = calculateDistance(
            storeMetadata.latitude,
            storeMetadata.longitude,
            $userDeviceClient!.location!.geolocationCoordinates!.latitude!,
            $userDeviceClient!.location!.geolocationCoordinates!.longitude!,
        );

        return { couponMetadata, storeMetadata, distance };
    }

    let fetchMetadataAsync = fetchMetadata();

    async function onClick() {
        await onRedeemCoupon({
            numTokens: 1,
            coupon,
        });
    }
</script>

{#await fetchMetadataAsync}
    <LoadingCoupon />
{:then { couponMetadata, storeMetadata, distance }}
    <Dialog.Root bind:open={redeemCouponOpen}>
        <Dialog.Trigger>
            <BaseCouponCard
                couponName={coupon.name}
                couponNameSuffix={`by ${storeMetadata.name}`}
                couponImageUrl={couponMetadata.image}
                {distance}
                expiry={coupon.validTo}
                redemptionQRCodeURL={$redeemedCoupons[coupon.coupon]}
            ></BaseCouponCard>
        </Dialog.Trigger>
        <Dialog.Content class="sm:max-w-[425px]">
            <Dialog.Header>
                <Dialog.Title>
                    {#if balance < 1}
                        This coupon has been used
                    {:else if $redeemedCoupons[coupon.coupon]}
                        <QrCode
                            data={$redeemedCoupons[coupon.coupon]}
                            height={300}
                            width={300}
                            class="p-6 justify-center"
                        ></QrCode>
                    {:else}
                        {`Redeem ${coupon.name}?`}
                    {/if}
                </Dialog.Title>
            </Dialog.Header>
            <Separator />

            {#if balance > 0 && !$redeemedCoupons[coupon.coupon]}
                <BaseCouponCard
                    couponName={coupon.name}
                    couponDescription={couponMetadata.description}
                    couponImageUrl={couponMetadata.image}
                    storeName={storeMetadata.name}
                    storeAddress={storeMetadata.address}
                    storeImageUrl={storeMetadata.image}
                    {distance}
                    remaining={balance}
                    expiry={coupon.validTo}
                    redemptionQRCodeURL={$redeemedCoupons[coupon.coupon]}
                ></BaseCouponCard>
            {/if}

            <section class="p-4">
                <p>
                    This coupon will only be valid for <span
                        class="text-success-400 font-bold">15mins</span
                    >. Make sure you are at the location before
                    <span class="underline font-bold">using</span> it.
                </p>
            </section>

            <Dialog.Footer class="flex flex-row justify-end gap-4">
                <BitsDialog.Close>
                    {#if $redeemedCoupons[coupon.coupon]}
                        <Button>Ok it's verified</Button>
                    {:else}
                        <Button>Save it for later</Button>
                    {/if}
                </BitsDialog.Close>
                {#if !$redeemedCoupons[coupon.coupon]}
                    <Button on:click={onClick}>Use it now</Button>
                {/if}
            </Dialog.Footer>
        </Dialog.Content>
    </Dialog.Root>
{/await}
