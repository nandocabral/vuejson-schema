<template>
  <div :id="`vuec-${key}`" class="vuec-array">
    <label class="vuec-array__label" v-if="labelable">{{ schema.title }}</label>
    <div
      v-for="(value, valueKey) in localValue"
      :key="valueKey"
      class="vuec-array__item"
    >
      <component
        v-for="(schema, schemaKey) in getFieldItem(localSchema, valueKey)"
        :key="key + '-' + schemaKey"
        :is="getFieldType(schema)"
        :value="value"
        @created="onCreated(valueKey, $event)"
        @update="onUpdate(valueKey, $event)"
        :schema="schema"
      />
      <div v-if="isMultipleable() || isAdditionalItem(valueKey)">
        <button
          type="button"
          class="vuec-array--btn-up"
          v-if="!isFirstItem(valueKey)"
          @click="moveUpItem(valueKey)"
        >
          &uarr;
        </button>
        <button
          type="button"
          class="vuec-array--btn-down"
          v-if="!isLastItem(valueKey)"
          @click="moveDownItem(valueKey)"
        >
          &darr;
        </button>
        <button
          type="button"
          class="vuec-array--btn-delete"
          @click="removeItem(valueKey)"
        >
          &times;
        </button>
      </div>
      <hr />
    </div>
    <div>
      <button type="button" class="vuec-array__btn-new" @click="addItem">
        &plus;
      </button>
    </div>
  </div>
</template>

<script>
import { get } from "lodash";

export default {
  name: "vuecArray",
  props: {
    schema: {
      type: Object,
      default: () => ({})
    },
    value: {
      type: Array
    }
  },
  data() {
    return {
      memoizeValue: []
    };
  },
  methods: {
    get(path, defaultValue = undefined) {
      return get(this, `schema.${path}`, defaultValue);
    },
    onCreated(name, newValue) {
      this.$set(this.memoizeValue, name, newValue);
      this.$emit("created", this.memoizeValue);
    },
    onUpdate(name, newValue) {
      this.$set(this.memoizeValue, name, newValue);
      this.localValue = this.memoizeValue;
    },
    getFieldType(schema) {
      if (schema.type === "object" || schema.type === "array") {
        return `vuec-${schema.type}`;
      }
      let type = get(schema, "widget.type");
      if (type) {
        return type.startsWith("vuec") ? type : "vuec-any";
      }
      return "vuec-input";
    },
    addItem() {
      this.localValue.push(null);
    },
    removeItem(index) {
      this.localValue.splice(index, 1);
    },
    moveUpItem(index) {
      let item = this.localValue.splice(index, 1);
      this.localValue.splice(index - 1, 0, item[0]);
    },
    moveDownItem(index) {
      let item = this.localValue.splice(index, 1);
      this.localValue.splice(index + 1, 0, item[0]);
    },
    isMultipleable() {
      return this.schema.items.constructor === Object;
    },
    isFirstItem(index) {
      if (this.isAdditionalItem(index)) {
        return index == this.localSchema.length;
      }
      return index === 0;
    },
    isLastItem(index) {
      return index === this.localValue.length - 1;
    },
    getAdditionalItems() {
      return this.schema.additionalItems;
    },
    hasAdditionalItems() {
      return this.getAdditionalItems() !== undefined;
    },
    isAdditionalItem(index) {
      if (this.isMultipleable()) {
        return false;
      }
      return index >= this.localSchema.length;
    },
    getFieldItem(schema, index) {
      if (!this.isMultipleable()) {
        schema = schema.slice(index, index + 1);
        if (schema.length === 0 && this.hasAdditionalItems()) {
          return [this.getAdditionalItems()];
        }
      }
      return schema;
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
    localSchema() {
      let items = this.schema.items;
      if (items) {
        return this.isMultipleable() ? [items] : items;
      }
      return [];
    },
    localValue: {
      get() {
        if (!this.schema.items || !this.value) {
          return [];
        }
        return this.isMultipleable() || this.hasAdditionalItems()
          ? this.value
          : this.value.slice(0, this.schema.items.length);
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
