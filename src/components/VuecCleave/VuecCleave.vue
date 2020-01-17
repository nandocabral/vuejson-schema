<template>
  <div :id="`vuec-${key}`" class="vuec-input">
    <label class="vuec-input-label" :for="key" v-if="labelable">{{
      schema.title
    }}</label>
    <input
      type="text"
      ref="input"
      :id="key"
      :name="key"
      v-model="localValue"
      v-bind="widgetProps"
      autocomplete="off"
    />
    <span class="vuec-input-help" v-if="helpable">{{
      schema.description
    }}</span>
  </div>
</template>

<script>
// Basado en https://github.com/ankurk91/vue-cleave-component

import Cleave from "cleave.js";
import { get, assign } from "lodash";
import defaults from "./options.js";

export default {
  name: "vuecCleave",
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
  data() {
    return {
      // cleave.js instance
      cleave: null
    };
  },
  methods: {
    get(path, defaultValue = undefined) {
      return get(this, `schema.${path}`, defaultValue);
    },
    getOptions() {
      return assign({}, defaults, this.widgetProps, {
        onValueChanged: event => {
          this.localValue = event.target;
        }
      });
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
        if (this.cleave != null) {
          return this.cleave.getFormattedValue();
        }
        return this.value;
      },
      set(newValue) {
        let options = this.getOptions();

        let value = options.raw ? newValue.rawValue : newValue.value;

        if (!this.cleave || value == undefined) return;

        // when v-model is not masked (raw)
        if (options.raw && newValue === this.cleave.getRawValue()) return;

        //  when v-model is masked (NOT raw)
        if (!options.raw && newValue === this.$refs.input.value) return;

        if (options.raw && options.numeral) {
          value = parseFloat(value === "" ? 0 : value);
        }

        this.$emit("update", value);
      }
    }
  },
  created() {
    if (!this.value) {
      this.$emit("created", this.localValue);
    }
  },
  mounted() {
    if (this.cleave) return;

    this.cleave = new Cleave(this.$refs.input, this.getOptions());
    this.cleave.setRawValue(this.localValue);
  },
  beforeDestroy() {
    /* istanbul ignore if */
    if (!this.cleave) return;

    this.cleave.destroy();
    this.cleave = null;
  }
};
</script>
