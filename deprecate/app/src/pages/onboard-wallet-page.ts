import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";

@customElement("onboard-wallet-page")
export class OnboardWalletPage extends LitElement {
    render() {
        return html`
            <h1>You need to connect a wallet to use this service</h1>
            <solana-wallet></solana-wallet>
        `;
    }
}
