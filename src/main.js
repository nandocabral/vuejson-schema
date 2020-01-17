import * as components from "./components";

const VuecComponents = {
  install(Vue = {}) {
    for (const componentName in components) {
      const component = components[componentName];
      Vue.component(component.name, component);
    }
  }
};

export default VuecComponents;

if (typeof window !== "undefined" && window.Vue) {
  window.Vue.use(VuecComponents);
}
