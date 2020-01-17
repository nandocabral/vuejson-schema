<template>
  <div :id="`vuec-${key}`" class="vuec-input">
    <label class="vuec-input-label" :for="key" v-if="labelable">
      {{ schema.title }}
    </label>
    <input
      ref="input"
      :id="key"
      :name="key"
      v-model="localValue"
      v-bind="widgetProps"
      autocomplete="off"
    />
    <p v-if="widgetProps.showpass === true" class="vuec-password__current">
      <small>
        {{ localValue }}
      </small>
    </p>
    <span class="vuec-input-help" v-if="helpable">
      {{ schema.description }}
    </span>
  </div>
</template>

<script>
import { get } from "lodash";

export default {
  name: "vuecInput",
  props: {
    schema: {
      type: Object,
      default: () => ({})
    },
    value: {
      type: [String, Number]
      // default: ''
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
    encodingToBase64() {
      return this.get("contentEncoding") === "base64";
    },
    isInputFile() {
      return this.get("widget.props.type") === "file";
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
        if (this.isInputFile) {
          return "";
        }
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
