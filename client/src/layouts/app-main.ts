import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { Router } from "@vaadin/router";
import { provide } from "@lit/context";
import { Wallet } from "@solana/wallet-adapter-react";
import { createContext } from "@lit/context";
import { AnchorClient } from "../lib/anchor/anchorClient";

// Providers
export const walletContext = createContext<Wallet | null>(Symbol("wallet"));
export const anchorClientContext = createContext<AnchorClient | null>(
  Symbol("anchor-client")
);

// App Main
@customElement("app-main")
export class AppMain extends LitElement {
  // Wallet provider
  @provide({ context: walletContext })
  @state()
  wallet: Wallet | null = null;

  // AnchorClient provider
  @provide({ context: anchorClientContext })
  @state()
  anchorClient: AnchorClient | null = null;

  // Setup router
  firstUpdated() {
    const router = new Router(this.shadowRoot?.querySelector("#page-route"));
    router.setRoutes([
      { path: "/mint", component: "app-mint" },
      { path: "/coupons", component: "app-coupons" },
      { path: "(.*)", component: "app-coupons" },
    ]);
  }

  onConnectWallet(e: CustomEvent) {
    this.wallet = e.detail.wallet;
    if (e.detail.wallet) {
      this.anchorClient = new AnchorClient({ wallet: e.detail.wallet.adapter });
      console.log(this.anchorClient);
    }
  }
  onDisconnectWallet(e: CustomEvent) {
    this.wallet = null;
    this.anchorClient = null;
  }

  render() {
    return html`
      <!-- Header -->
      <app-header-layout>
        <app-header slot="header">
          <app-toolbar>
            <div main-title>App name</div>
            <!-- Wallet -->
            <solana-wallet
              @on-connect-wallet=${this.onConnectWallet}
              @on-disconnect-wallet=${this.onDisconnectWallet}
            >
            </solana-wallet>
          </app-toolbar>
        </app-header>
      </app-header-layout>

      <!-- Content -->
      <div id="page-route"></div>

      <!-- Footer -->
      <app-footer>
        <a href="/coupons" slot="left"><sl-menu-item>Coupons</sl-menu-item></a>
        <a href="/mint" slot="right"><sl-menu-item>Mint</sl-menu-item></a>
      </app-footer>
    `;
  }
}