<template>
  <div :id="`kly-object-array-${key}`" class="kly-object-array">
    <label class="kly-array-label" v-if="labelable">{{ schema.title }}</label>
    <div class="kly-object-array__header">
      <div
        v-for="(el, schemaKey) in schema.items.properties"
        :key="schemaKey"
        class="kly-object-array--item"
      >
        <component
          :key="schemaKey"
          :is="getFieldType(el)"
          :value="model[el]"
          @created="onCreated(schemaKey, $event)"
          @update="onUpdate(schemaKey, $event)"
          :schema="el"
        />
      </div>
      <div>
        <button type="button" @click="addItem">
          &plus;
        </button>
      </div>
    </div>
    <div class="kly-object-array__body">
      <table class="kly-object-array--table">
        <thead class="kly-object-array--table-head">
          <tr>
            <th
              v-for="(head, headKey) in schema.items.properties"
              :key="`th_${headKey}`"
            >
              {{ head.title }}
            </th>
            <th></th>
          </tr>
        </thead>
        <tbody class="kly-object-array--table-head">
          <tr v-for="(value, valueKey) in localValue" :key="`tr_${valueKey}`">
            <td
              v-for="(obj, key, i) in schema.items.properties"
              :key="`value_${i}_${key}`"
            >
              {{ value[key] }}
            </td>
            <td>
              <button type="button" @click="removeItem(valueKey)">
                &times;
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { get } from "lodash";

export default {
  name: "KlyObjectArray",
  props: {
    schema: {
      type: Object,
      default: () => {},
      required: true
    },
    value: {
      type: Array
    }
  },
  data() {
    return {
      model: {},
      memoizeValue: []
    };
  },
  methods: {
    get(path, defaultValue = undefined) {
      return get(this, `schema.${path}`, defaultValue);
    },
    onCreated(name, newValue) {
      this.$set(this.model, name, newValue);
      this.$emit("created", this.memoizeValue);
    },
    onUpdate(name, newValue) {
      this.$set(this.model, name, newValue);
    },
    getFieldType(schema) {
      if (schema.type === "object" || schema.type === "array") {
        return `kly-${schema.type}`;
      }
      let type = get(schema, "widget.type");
      if (type) {
        return type.startsWith("kly") ? type : "kly-any";
      }
      return "kly-input";
    },
    addItem() {
      this.localValue.push(Object.assign({}, this.model));
    },
    removeItem(index) {
      this.localValue.splice(index, 1);
    },
    isMultipleable() {
      return this.schema.items.constructor === Object;
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
        return this.value || [];
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
