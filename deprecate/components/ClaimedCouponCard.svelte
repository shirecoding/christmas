<script lang="ts">
    import { fetchCouponMetadata, fetchStoreMetadata } from "$lib/community";

    import { calculateDistance, timeStampToDate } from "$lib/utils";
    import BaseCouponCard from "./BaseCouponCard.svelte";
    import { userDeviceClient, redeemedCoupons } from "../store";
    import type { ModalSettings } from "@skeletonlabs/skeleton";
    import { getModalStore } from "@skeletonlabs/skeleton";
    import RedeemCouponForm from "./RedeemCouponForm.svelte";
    import type { CouponMetadata, StoreMetadata } from "$lib/community/types";
    import type { Account, Coupon } from "$lib/anchorClient/types";

    export let coupon: Account<Coupon>;
    export let balance: number;

    const modalStore = getModalStore();
    const couponKey = coupon.publicKey.toString();

    let fetchMetadataAsync = fetchMetadata();
    async function fetchMetadata() {
        const couponMetadata = await fetchCouponMetadata(coupon);
        const storeMetadata = await fetchStoreMetadata(coupon.account.store);
        const distance = calculateDistance(
            storeMetadata.latitude,
            storeMetadata.longitude,
            $userDeviceClient!.location!.geolocationCoordinates!.latitude!,
            $userDeviceClient!.location!.geolocationCoordinates!.longitude!,
        );
        return { couponMetadata, storeMetadata, distance };
    }

    function redeemCouponModal({
        couponMetadata,
        storeMetadata,
        distance,
    }: {
        couponMetadata: CouponMetadata;
        storeMetadata: StoreMetadata;
        distance: number;
    }) {
        new Promise<string>((resolve) => {
            const modal: ModalSettings = {
                type: "component",
                component: { ref: RedeemCouponForm },
                meta: {
                    coupon,
                    couponMetadata,
                    storeMetadata,
                    distance,
                    balance,
                    redemptionQRCodeURL: $redeemedCoupons[couponKey],
                },
                response: async (modalRedemptionQRCodeURL) => {
                    resolve(modalRedemptionQRCodeURL);
                },
            };
            // Open modal
            modalStore.trigger(modal);
        }).then((modalRedemptionQRCodeURL) => {
            // Will also be called when the modal is closed then `modalRedemptionQRCodeURL=undefined`
            if (modalRedemptionQRCodeURL) {
                redeemedCoupons.update((r) => {
                    // Set `redeemedCoupons` store
                    r[coupon.publicKey.toString()] = modalRedemptionQRCodeURL;
                    return r;
                });
            }
        });
    }
</script>

{#await fetchMetadataAsync then { couponMetadata, storeMetadata, distance }}
    <a
        href={null}
        on:click={async () =>
            await redeemCouponModal({
                couponMetadata,
                storeMetadata,
                distance,
            })}
    >
        <BaseCouponCard
            couponName={coupon.account.name}
            couponImageUrl={couponMetadata.image}
            {distance}
            expiry={timeStampToDate(coupon.account.validTo)}
            redemptionQRCodeURL={$redeemedCoupons[couponKey]}
            ><p class="text-xs italic px-3 text-surface-400">
                {storeMetadata.name}
            </p></BaseCouponCard
        >
    </a>
{/await}
