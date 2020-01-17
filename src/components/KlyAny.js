export default {
  name: "kly-any",
  props: {
    schema: {
      type: Object,
      default: () => {},
      required: true
    },
    value: {
      type: Object,
      default: () => {}
    }
  },
  inheritAttrs: false,
  render(createElement) {
    return createElement(this.schema.widget.type);
  }
};
