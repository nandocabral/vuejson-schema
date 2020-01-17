<template>
  <div :id="`vuec-${key}`" class="vuec-field">
    <label class="vuec-field-label" v-if="labelable">{{ schema.title }}</label>
    <div class="vuec-radio" v-for="option in schema.enum" :key="option">
      <label class="vuec-radio-label" :for="`${key}-${option}`">
        <input
          type="radio"
          :id="`${key}-${option}`"
          :name="key"
          v-model="localValue"
          :value="option"
          v-bind="widgetProps"
        />
        {{ option }}
      </label>
    </div>
    <span class="vuec-field-help" v-if="helpable">{{
      schema.description
    }}</span>
  </div>
</template>

<script>
import { get } from "lodash";

export default {
  name: "vuecRadio",
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
