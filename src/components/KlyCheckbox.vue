<template>
  <div :id="`kly-${key}`" class="kly-field">
    <template v-if="schema.enum">
      <label class="kly-field-label" v-if="labelable">{{ schema.title }}</label>
      <div class="kly-checkbox" v-for="option in schema.enum" :key="option">
        <label class="kly-checkbox-label" :for="`${key}-${option}`">
          <input
            type="checkbox"
            :id="`${key}-${option}`"
            :name="key + '[]'"
            v-model="localValue"
            :value="option"
            v-bind="widgetProps"
          />
          {{ option }}
        </label>
      </div>
      <span class="kly-field-help" v-if="helpable">{{
        schema.description
      }}</span>
    </template>
    <template v-else>
      <label class="kly-field-label" v-if="labelable">{{ schema.title }}</label>
      <div class="kly-checkbox">
        <label class="kly-checkbox-label" :for="key">
          <input
            type="checkbox"
            :id="key"
            :name="key"
            v-model="localValue"
            v-bind="widgetProps"
          />
          {{ schema.description }}
        </label>
      </div>
    </template>
  </div>
</template>

<script>
// Array, Boolean, Function, Number, Object, String, Symbol

import { get } from "lodash";

export default {
  name: "klyCheckbox",
  props: {
    schema: {
      type: Object,
      default: () => ({})
    },
    value: {
      type: [Array, Boolean, Number, String]
    }
  },
  methods: {
    get(path, defaultValue = undefined) {
      return get(this, `schema.${path}`, defaultValue);
    },
    hasEnum() {
      return this.get("enum");
    },
    getCustomValue(booleanValue) {
      return booleanValue
        ? this.widgetProps["true-value"] || booleanValue
        : this.widgetProps["false-value"] || booleanValue;
    },
    getBooleanValue(customValue) {
      if (customValue && this.widgetProps["true-value"] === customValue) {
        return true;
      }
      return false;
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
        if (!this.hasEnum()) {
          return this.getBooleanValue(this.value);
        }
        return this.value || [];
      },
      set(newValue) {
        if (!this.hasEnum()) {
          newValue = this.getCustomValue(newValue);
        }
        this.$emit("update", newValue);
      }
    }
  },
  created() {
    if (!this.value) {
      this.$emit("created", this.getCustomValue(this.localValue));
    }
  }
};
</script>
