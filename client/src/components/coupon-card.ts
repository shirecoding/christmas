import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { Coupon, CouponMetadata } from "../lib/anchor/anchorClient";
import { getCouponMetadata } from "../lib/utils";

@customElement("coupon-card")
export class CouponCard extends LitElement {
  @property({ attribute: false })
  accessor coupon!: Coupon;

  @state()
  accessor couponMetadata: CouponMetadata = {
    name: "",
    description: "",
    image: "",
  };

  static styles = css`
    .card-overview {
      max-width: 300px;
    }

    .card-overview small {
      color: var(--sl-color-neutral-500);
    }

    .card-overview [slot="footer"] {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  `;

  async connectedCallback() {
    this.couponMetadata = await getCouponMetadata(this.coupon);
  }

  render() {
    return html`
      <sl-card class="card-overview">
        <img slot="image" src="${this.couponMetadata.image}" />

        <strong>${this.coupon.account.name}</strong><br />
        ${this.couponMetadata.description}<br />
        <small>${this.coupon.account.geo}</small>

        <div slot="footer">
          <sl-button variant="primary" pill>More Info</sl-button>
          <sl-rating></sl-rating>
        </div>
      </sl-card>
    `;
  }
}