<template>
  <div :id="`kly-${key}`" class="kly-select">
    <label class="kly-select-label" :for="key" v-if="labelable">
      {{ schema.title }}
    </label>
    <select
      ref="select"
      :id="key"
      :name="key"
      v-model="localValue"
      v-bind="widgetProps"
    />
    <span class="kly-select-help" v-if="helpable">
      {{ schema.description }}
    </span>
  </div>
</template>

<script>
import { get } from "lodash";
import concat from "lodash/concat";
import defaults from "./options.js";
import { whereStruct, whereInStruct } from "./utils.js";
import "select2";
import $ from "jquery";

export default {
  name: "klyAutocomplete",
  props: {
    schema: {
      type: Object,
      default: () => ({})
    },
    value: {
      type: [String, Array, Number]
      // default: ''
    }
  },
  methods: {
    get(path, defaultValue = undefined) {
      return get(this, `schema.${path}`, defaultValue);
    },
    isMultiple() {
      return this.schema.type == "array";
    },
    getItems() {
      return this.get("enum", this.get("items.enum", [])).map(item => {
        return {
          id: item.id || item,
          text: item.text || item
        };
      });
    },
    getXhr(data) {
      let archiving = this.get("widget.props.archiving", {});

      data = {
        ...{ schema: archiving.schema || "null" },
        ...data
      };
      return $.ajax({
        type: "POST",
        url: archiving.url || "/",
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        headers: {
          Authorization: archiving.authorization || ""
        },
        data: JSON.stringify(data)
      });
    },
    async doRequest() {
      let key = this.get("widget.props.archiving.key", "id");
      return await this.getXhr({
        filter: {
          wherein: whereInStruct({
            [key]: this.isMultiple() ? this.localValue : [this.localValue]
          })
        }
      });
    },
    processResultsItems(response) {
      let key = this.get("widget.props.archiving.key", "id");
      let field = this.get("widget.props.archiving.value", "unvalue").replace(
        "->",
        "."
      );
      if (response.status === "success") {
        return response.data.map(item => {
          return {
            id: get(item, key),
            text: get(item, field),
            overall: item
          };
        });
      }
      return [];
    },
    getOptions() {
      let widgetProps = {
        ...this.widgetProps,
        ...{
          data: this.getItems(),
          multiple: this.isMultiple()
        }
      };

      if (widgetProps.archiving) {
        widgetProps.ajax = {
          delay: 250,
          // params: {
          //   contentType: "application/json; charset=utf-8",
          // },
          transport: (params, success) => {
            this.getXhr(params.data).then(response => {
              success(response);
            });
          },
          data: params => {
            let field = this.get("widget.props.archiving.value", "unvalue");
            let limit = this.get("widget.props.archiving.limit", 10);
            let customFilters = this.get("widget.props.archiving.filter", []);
            let filters = concat(
              customFilters,
              whereStruct(
                { [field]: "%" + params.term + "%" },
                "like",
                "utf8mb4_general_ci"
              )
            ).map(obj => {
              if (obj.hasOwnProperty("collate")) {
                return obj;
              } else if (
                !obj.hasOwnProperty("collate") &&
                Number.isNaN(Number(obj.value))
              ) {
                return obj;
              } else {
                let o = Object.assign({}, obj);
                o.value = Number(obj.value);
                return o;
              }
            });
            return {
              filter: {
                where: filters
              },
              limit: limit,
              page: params.page || 1
            };
          },
          processResults: (response, params) => {
            let limit = this.get("widget.props.archiving.limit", 10),
              items = [];
            items = this.processResultsItems(response);
            return {
              results: items,
              pagination: {
                more: (params.page || 1) * limit < response.paginate.total
              }
            };
          }
        };
        delete widgetProps.archiving;
      }

      return {
        ...defaults,
        ...widgetProps
      };
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
        return this.value || (this.isMultiple() ? [] : "");
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
  },
  mounted() {
    const select = $(this.$refs.select);

    let options = this.getOptions();

    this.$nextTick(() => {
      select.select2(options);
      select.on("change", () => {
        // Null cuando se deselecciona
        this.localValue = select.val() || "";
      });
      select.val(this.localValue).trigger("change.select2");

      if (
        this.widgetProps.archiving &&
        ((Array.isArray(this.value) && this.value.length > 0) ||
          (!Array.isArray(this.value) && this.value))
      ) {
        select.prop("disabled", true);
        this.doRequest().then(response => {
          options.data = this.processResultsItems(response);
          select.select2(options);
          select.val(this.localValue).trigger("change.select2");
          if (!this.widgetProps.readonly) {
            select.prop("disabled", false);
          }
        });
      }
    });
  }
};
</script>
