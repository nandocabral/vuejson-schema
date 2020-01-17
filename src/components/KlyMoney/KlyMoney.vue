<template>
  <div :id="`kly-${key}`" class="kly-input">
    <label class="kly-input-label" :for="key" v-if="labelable">
      {{ schema.title }}
    </label>
    <input
      type="text"
      ref="input"
      :id="key"
      :name="key"
      v-model="localValue"
      v-bind="widgetProps"
      @focus="onfocus"
      autocomplete="off"
    />
    <span class="kly-input-help" v-if="helpable">
      {{ schema.description }}
    </span>
  </div>
</template>

<script>
// Basado en https://github.com/vuejs-tips/v-money

import { get, assign } from "lodash";
import defaults from "./options.js";
import { format, unformat, setCursor } from "./utils.js";

export default {
  name: "KlyMoney",
  props: {
    schema: {
      required: true,
      type: Object,
      default: () => ({})
    },
    value: {
      type: [Number, String],
      default: ""
    }
  },
  methods: {
    get(path, defaultValue = undefined) {
      return get(this, `schema.${path}`, defaultValue);
    },
    onfocus(e) {
      let options = assign({}, defaults, this.widgetProps);
      setCursor(e.target, e.target.value.length - options.suffix.length);
    }
  },
  computed: {
    key() {
      return this.$vnode.data.key;
    },
    labelable() {
      return (
        this.get("widget.props.labelable", true) &&
        this.get("title") !== undefined
      );
    },
    helpable() {
      return (
        this.get("widget.props.helpable", true) &&
        this.get("description") !== undefined
      );
    },
    widgetProps() {
      return this.get("widget.props", {});
    },
    localValue: {
      get() {
        let options = assign({}, defaults, this.widgetProps);
        let formatted = format(this.value, options);
        return formatted !== this.value ? formatted : this.value;
      },
      set(newValue) {
        let el = this.$refs.input;
        let positionFromEnd = el.value.length - el.selectionEnd;
        let options = assign({}, defaults, this.widgetProps);

        el.value = format(newValue, options);
        positionFromEnd = Math.max(positionFromEnd, options.suffix.length); // right
        positionFromEnd = el.value.length - positionFromEnd;
        positionFromEnd = Math.max(positionFromEnd, options.prefix.length + 1); // left
        setCursor(el, positionFromEnd);

        this.$emit(
          "update",
          options.masked ? el.value : unformat(el.value, options.precision)
        );
      }
    }
  },
  created() {
    let options = assign({}, defaults, this.widgetProps);
    if (!this.value) {
      this.$emit(
        "created",
        options.masked
          ? this.localValue
          : unformat(this.localValue, options.precision)
      );
    }
  }
};
</script>
