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
      autocomplete="off"
    />
    <span class="kly-input-help" v-if="helpable">
      {{ schema.description }}
    </span>
  </div>
</template>

<script>
/**
 *
 * Basado en https://github.com/gravitano/vue-date-range-picker
 *
 * Options:
 * http://www.daterangepicker.com/#options
 *
 */

import { get } from "lodash";
import defaults from "./options.js";
import "daterangepicker/daterangepicker";
import "daterangepicker/daterangepicker.css";
import $ from "jquery";

export default {
  name: "KlyDateRangePicker",
  props: {
    schema: {
      required: true,
      type: Object,
      default: () => ({})
    },
    value: {
      type: [String, Array]
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
        if (this.value !== undefined && this.value.length > 0) {
          let value = "";
          if (this.isSingleDatePicker) {
            value = this.value;
          } else {
            value = [
              this.value[0],
              this.options.locale.separator,
              this.value[1]
            ].join("");
          }
          return value;
        }
      },
      set(newValue) {
        this.$emit("update", newValue);
      }
    },
    options() {
      let customDefaults = { ...defaults };

      if (this.widgetProps.enablePredefinedRanges !== true) {
        delete customDefaults.ranges;
      }

      return {
        ...customDefaults,
        ...this.widgetProps
      };
    },
    isSingleDatePicker() {
      return this.options.singleDatePicker;
    },
    formatOut() {
      return this.options.locale.formatOut || this.options.locale.format;
    }
  },
  created() {
    if (!this.value) {
      this.$emit("created", this.isSingleDatePicker ? "" : []);
    }
  },
  mounted() {
    this.$nextTick(() => {
      const el = $(this.$refs.input);
      el.daterangepicker(this.options);
      el.on("apply.daterangepicker", (event, picker) => {
        const startDate = picker.startDate.format(this.formatOut);
        const endDate = picker.endDate.format(this.formatOut);
        if (this.isSingleDatePicker) {
          this.localValue = startDate;
        } else {
          this.localValue = [startDate, endDate];
        }
      });
      // el.on('cancel.daterangepicker', () => {
      // if (this.isSingleDatePicker) {
      //   this.localValue = '';
      // } else {
      //   this.localValue = [];
      // }
      // });
    });
  },
  beforeDestroy() {
    $(this.$refs.input)
      .daterangepicker("hide")
      .daterangepicker("destroy");
  }
};
</script>
