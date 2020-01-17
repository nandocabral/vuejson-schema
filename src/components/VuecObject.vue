<template>
  <fieldset>
    <legend>{{ schema.title }}</legend>
    <component
      v-for="(subSchema, subSchemaKey) in localSchema"
      :key="subSchemaKey"
      :is="getFieldType(subSchema)"
      :value="localValue[subSchemaKey]"
      @created="onCreated(subSchemaKey, $event)"
      @update="onUpdate(subSchemaKey, $event)"
      :schema="subSchema"
    />
  </fieldset>
</template>

<script>
import { get } from "lodash";

export default {
  name: "vuecObject",
  props: {
    schema: {
      type: Object,
      default: () => ({})
    },
    value: {
      type: Object
    }
  },
  data() {
    return {
      memoizeValue: {}
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
    key() {
      return this.$vnode.data.key;
    },
    localSchema() {
      return this.schema.properties;
    },
    localValue: {
      get() {
        return this.value || {};
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
