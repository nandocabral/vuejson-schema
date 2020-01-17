<template>
  <div>
    <label class="kly-field-label" style="display:block;" v-if="labelable">
      {{ schema.title }}
    </label>
    <label class="kly-toggle-switch kly-checkbox-label" :for="key">
      <input
        type="checkbox"
        :id="key"
        :name="key"
        class="kly-toggle-switch__input"
        v-model="localValue"
        v-bind="widgetProps"
      />
      {{ schema.description }}
      <span class="kly-toggle-switch__slider kly-toggle-switch__round" />
    </label>
  </div>
</template>

<script>
import { get } from "lodash";

export default {
  name: "klyToggleCheckbox",
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
        return this.getBooleanValue(this.value);
      },
      set(newValue) {
        newValue = this.getCustomValue(newValue);
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

<style scoped>
.kly-toggle-switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
}
.kly-toggle-switch__input {
  opacity: 0;
  width: 0;
  height: 0;
}
.kly-toggle-switch__slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  -webkit-transition: 0.4s;
  transition: 0.4s;
}
.kly-toggle-switch__slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  -webkit-transition: 0.4s;
  transition: 0.4s;
}
.kly-toggle-switch__input:checked + .kly-toggle-switch__slider {
  background-color: #2196f3;
}
.kly-toggle-switch__input:focus + .kly-toggle-switch__slider {
  box-shadow: 0 0 1px #2196f3;
}
.kly-toggle-switch__input:checked + .kly-toggle-switch__slider:before {
  -webkit-transform: translateX(26px);
  -ms-transform: translateX(26px);
  transform: translateX(26px);
}
.kly-toggle-switch__slider.kly-toggle-switch__round {
  border-radius: 34px;
}
.kly-toggle-switch__slider.kly-toggle-switch__round:before {
  border-radius: 50%;
}
</style>
