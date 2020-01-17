import Vue from "vue";
import App from "./App.vue";
import VuecComponents from "../src/main.js";

Vue.use(VuecComponents);

Vue.config.productionTip = false;

new Vue({
  render: h => h(App)
}).$mount("#app");
