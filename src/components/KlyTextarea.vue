<template>
  <div :id="`kly-${key}`" class="kly-field">
    <label class="kly-field-label" :for="key" v-if="labelable">
      {{ schema.title }}
    </label>
    <textarea :id="key" :name="key" v-model="localValue" v-bind="widgetProps" />
    <span class="kly-field-help" v-if="helpable">{{ schema.description }}</span>
  </div>
</template>

<script>
import { get } from "lodash";

export default {
  name: "KlyTextarea",
  props: {
    schema: {
      type: Object,
      default: () => ({})
    },
    value: {
      type: String
    }
  },
  methods: {
    get(path, defaultValue = undefined) {
      return get(this, `schema.${path}`, defaultValue);
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
        return this.value || "";
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
