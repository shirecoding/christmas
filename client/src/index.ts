// shoelace
import "@shoelace-style/shoelace/dist/themes/light.css";
import "@shoelace-style/shoelace/dist/components/button/button.js";
import "@shoelace-style/shoelace/dist/components/icon/icon.js";
import "@shoelace-style/shoelace/dist/components/input/input.js";
import "@shoelace-style/shoelace/dist/components/rating/rating.js";
import "@shoelace-style/shoelace/dist/components/card/card.js";

import { setBasePath } from "@shoelace-style/shoelace/dist/utilities/base-path.js";
setBasePath("shoelace");

// app-layout
import "@polymer/app-layout/app-layout.js";

// custom
import "./components/solana-wallet";
import "./layouts/app-main";
import "./layouts/app-footer";
import "./pages/coupons-page";
import "./pages/mint-page";