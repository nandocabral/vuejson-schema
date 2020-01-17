import Vue from "vue";
import App from "./App.vue";
import KlayComponents from "../src/main.js";

Vue.use(KlayComponents);

Vue.config.productionTip = false;

new Vue({
  render: h => h(App)
}).$mount("#app");
