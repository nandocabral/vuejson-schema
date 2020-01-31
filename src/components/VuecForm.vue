<template>
  <div>
    <legend>{{ schema.title }}</legend>
    <component
      v-for="(subSchema, subSchemaKey) in localSchema"
      :key="subSchemaKey"
      :is="getFieldType(subSchema)"
      :value="localValue[subSchemaKey]"
      @created="onCreated(subSchemaKey, $event)"
      @update="onUpdate(subSchemaKey, $event)"
      @inputChange="internalModelChange"
      :schema="subSchema"
    />
    <slot />
  </div>
</template>

<script>
import { cloneDeep, get } from "lodash";

export default {
  name: "vuec-form",
  props: {
    schema: {
      type: Object,
      default: () => ({})
    },
    value: {
      type: Object
    }
  },
  methods: {
    get(path, defaultValue = undefined) {
      return get(this, `schema.${path}`, defaultValue);
    },
    onCreated(name, newValue) {
      this.$set(this.value, name, newValue);
    },
    onUpdate(name, newValue) {
      this.$set(this.value, name, newValue);

      this.localValue = cloneDeep(this.value);
    },
    internalModelChange(value) {
      this.$emit("modelChange", value);
    },
    getFieldType(schema) {
      let type = get(schema, "widget.type");
      if ((schema.type === "object" || schema.type === "array") && !type) {
        return `vuec-${schema.type}`;
      }
      if (type) {
        return type.startsWith("vuec") ? type : "vuec-any";
      }
      return "vuec-input";
    }
  },
  computed: {
    localSchema() {
      return this.schema.properties;
    },
    localValue: {
      get() {
        return this.value || {};
      },
      set(newValue) {
        this.$emit("change", newValue);
      }
    }
  },
  created() {
    this.$emit("ready");
  },
  mounted() {
    this.$emit("mounted");
  }
};
</script>
