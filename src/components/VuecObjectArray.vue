<template>
  <div :id="`vuec-object-array-${key}`" class="vuec-object-array">
    <label class="vuec-array-label" v-if="labelable">{{ schema.title }}</label>
    <div class="vuec-object-array__header">
      <div
        v-for="(el, schemaKey) in schema.items.properties"
        :key="schemaKey"
        class="vuec-object-array--item"
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
      <div class="vuec-object-array--actionbutton">
        <button type="button" @click="addItem">
          &plus;
        </button>
      </div>
    </div>
    <div class="vuec-object-array__body">
      <table class="vuec-object-array--table">
        <thead class="vuec-object-array--table-head">
          <tr>
            <th v-for="(head, headKey) in tableHeaders" :key="`th_${headKey}`">
              {{ head.text }}
            </th>
            <th></th>
          </tr>
        </thead>
        <tbody class="vuec-object-array--table-head">
          <tr v-for="(value, valueKey) in localValue" :key="`tr_${valueKey}`">
            <td v-for="(obj, key) in tableHeaders" :key="`value_${key}`">
              {{ value[obj.key] }}
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
  name: "vuecObjectArray",
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
      this.$emit("inputChange", { name, value: newValue });
      this.$set(this.model, name, newValue);
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
        this.$emit("inputChange", newValue);
        this.$emit("update", newValue);
      }
    },
    tableHeaders() {
      return (
        this.schema.items.headers ||
        Object.keys(this.schema.items.properties).map(key => {
          return {
            key,
            text: key.charAt(0).toUpperCase() + key.slice(1)
          };
        })
      );
    }
  },
  created() {
    if (!this.value) {
      this.$emit("created", this.localValue);
    }
  }
};
</script>
