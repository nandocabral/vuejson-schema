import * as components from "./components";

const KlayComponents = {
  install(Vue = {}) {
    for (const componentName in components) {
      const component = components[componentName];
      Vue.component(component.name, component);
    }
  }
};

export default KlayComponents;

if (typeof window !== "undefined" && window.Vue) {
  window.Vue.use(KlayComponents);
}
