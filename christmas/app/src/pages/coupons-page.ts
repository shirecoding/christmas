import { LitElement, html, css, PropertyValues, PropertyValueMap } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { consume } from "@lit/context";
import { anchorClientContext } from "../layouts/app-main";
import { AnchorClient, Coupon } from "../../../lib/anchor-client/anchorClient";
import { ClaimCouponDetail } from "../components/claim-coupon-dialog";
import { RedeemCouponDetail } from "../components/redeem-coupon-dialog";
import {
    locationContext,
    Location,
} from "../providers/userDeviceClientProvider";

@customElement("coupons-page")
export class CouponsPage extends LitElement {
    @consume({ context: anchorClientContext, subscribe: true })
    @state()
    accessor anchorClient: AnchorClient | null = null;

    @consume({ context: locationContext, subscribe: true })
    @state()
    accessor location: Location | null = null;

    @state()
    accessor coupons: Coupon[] = [];

    @state()
    accessor claimedCoupons: [Coupon, number][] = [];

    async onClaimCoupon(e: CustomEvent<ClaimCouponDetail>) {
        const { coupon, numTokens } = e.detail;
        if (this.anchorClient && this.location) {
            // Claim from market, also creates a `User` using `region` and `geo`
            await this.anchorClient.claimFromMarket(
                coupon.account.mint,
                numTokens,
                this.location.country.code,
                this.location.geohash
            );
            // TODO: handle error

            // Refetch claimed coupons
            await this.fetchClaimedCoupons();
        }
    }

    onRedeemCoupon(e: CustomEvent<RedeemCouponDetail>) {
        const { numTokens, coupon } = e.detail;
    }

    async fetchCoupons() {
        // Only fetch if `anchorClient` and `location` exists
        if (this.anchorClient && this.location) {
            this.coupons = await this.anchorClient.getCoupons(
                this.location.country.code
            );
        }
    }

    async fetchClaimedCoupons() {
        // Only fetch if `anchorClient`
        if (this.anchorClient) {
            this.claimedCoupons = await this.anchorClient.getClaimedCoupons();
        }
    }

    async firstUpdated() {
        await this.fetchCoupons();
        await this.fetchClaimedCoupons();
    }

    async willUpdate(changedProperties: PropertyValues<this>) {
        if (
            (changedProperties.has("anchorClient") && this.anchorClient) ||
            (changedProperties.has("location") && this.location)
        ) {
            console.log(`CHANGED: ${changedProperties}`);
            await this.fetchCoupons();
            await this.fetchClaimedCoupons();
        }
    }

    static styles = css`
        sl-spinner {
            font-size: 3rem;
            --indicator-color: deeppink;
            --track-color: pink;
        }
        sl-carousel::part(scroll-container) {
            height: 210px;
        }
        .app-grid {
            height: 400px;
        }
        .loader {
            margin: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
        }
        coupon-card::part(card-overview) {
            margin: 10px;
        }
    `;

    getLoading() {
        return html`
            <div class="loader">
                <sl-spinner> </sl-spinner>
            </div>
        `;
    }

    getPage() {
        return html`
            <!-- Claimed coupons -->
            <sl-tab-group>
                <sl-tab slot="nav" panel="claimed">My Coupons (All)</sl-tab>
                <sl-tab slot="nav" panel="food">Food</sl-tab>
                <sl-tab slot="nav" panel="others">Others</sl-tab>
                <sl-tab-panel
                    name="claimed"
                    style="--padding: 0px; height: 250px; padding-top: 10px"
                >
                    <sl-carousel
                        class="scroll-hint"
                        style="--aspect-ratio: 1/1;"
                        slides-per-page="2"
                        pagination
                    >
                        ${this.claimedCoupons.map(([coupon, balance]) => {
                            return html`
                                <sl-carousel-item>
                                    <claimed-coupon-card
                                        class="item"
                                        .coupon=${coupon}
                                        balance=${balance}
                                    ></claimed-coupon-card>
                                </sl-carousel-item>
                            `;
                        })}
                    </sl-carousel>
                </sl-tab-panel>
            </sl-tab-group>
            <br />
            <!-- Market coupons -->
            <sl-tab-group>
                <sl-tab slot="nav" panel="market">Market (All)</sl-tab>
                <sl-tab slot="nav" panel="food">Food</sl-tab>
                <sl-tab slot="nav" panel="others">Others</sl-tab>
                <sl-tab-panel name="market">
                    <div class="app-grid">
                        ${this.coupons.map((coupon) => {
                            return html`
                                <coupon-card
                                    class="item"
                                    .coupon=${coupon}
                                    @on-claim=${this.onClaimCoupon}
                                ></coupon-card>
                            `;
                        })}
                    </div>
                </sl-tab-panel>
            </sl-tab-group>
        `;
    }

    render() {
        if (this.anchorClient && this.location) {
            return this.getPage();
        } else {
            return this.getLoading();
        }
    }
}