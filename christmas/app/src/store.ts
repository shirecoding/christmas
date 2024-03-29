import type { Account, Coupon, Store } from "$lib/anchorClient/types";
import type { Grid } from "$lib/crossover/world";
import type {
    CouponMetadataSchema,
    StoreMetadataSchema,
} from "$lib/server/community/router";
import type { Player } from "$lib/server/crossover/redis/entities";
import type { UserMetadataSchema } from "$lib/server/crossover/router";
import { UserDeviceClient } from "$lib/userDeviceClient";
import { writable } from "svelte/store";
import { z } from "zod";

// Community
export let token = writable<string | null>(null); // jwt access token (cookies fallback, null if logged out)
export let userDeviceClient = writable<UserDeviceClient | null>(null);
export let marketCoupons = writable<[Account<Coupon>, number][]>([]);
export let claimedCoupons = writable<[Account<Coupon>, number][]>([]);
export let redeemedCoupons = writable<Record<string, string>>({});
export let stores = writable<Account<Store>[]>([]);
export let storesMetadata = writable<
    Record<string, z.infer<typeof StoreMetadataSchema>>
>({});
export let mintedCoupons = writable<
    Record<string, [Account<Coupon>, number, number][]>
>({});
export let couponsMetadata = writable<
    Record<string, z.infer<typeof CouponMetadataSchema>>
>({});
export let userMetadata = writable<
    Record<string, z.infer<typeof UserMetadataSchema>>
>({});

// Crossver
export let player = writable<Player | null>(null);
export let grid = writable<Grid>({});
