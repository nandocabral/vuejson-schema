<template>
  <div :id="`kly-${key}`" class="kly-select">
    <label class="kly-select-label" :for="key" v-if="labelable">
      {{ schema.title }}
    </label>
    <select
      ref="select"
      :id="key"
      :name="key"
      v-model="localValue"
      v-bind="widgetProps"
    >
      <option v-if="!this.isMultiple()" value disabled>...</option>
      <option v-for="option in getItems()" :key="option">
        {{ option }}
      </option>
    </select>
    <span class="kly-select-help" v-if="helpable">
      {{ schema.description }}
    </span>
  </div>
</template>

<script>
import { get } from "lodash";

export default {
  name: "klySelect",
  props: {
    schema: {
      type: Object,
      default: () => ({})
    },
    value: {
      type: [String, Array]
      // default: ''
    }
  },
  methods: {
    get(path, defaultValue = undefined) {
      return get(this, `schema.${path}`, defaultValue);
    },
    isMultiple() {
      return this.schema.type == "array";
    },
    getItems() {
      return this.get("enum", this.get("items.enum"));
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
        return this.value || (this.isMultiple() ? [] : "");
      },
      set(newValue) {
        this.$emit("update", newValue);
      }
    }
  },
  created() {
    if (!this.value) {
      this.$emit("created", this.localValue);
    }
  }
};
</script>
