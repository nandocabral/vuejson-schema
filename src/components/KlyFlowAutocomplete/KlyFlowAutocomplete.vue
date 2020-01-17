<template>
  <div :id="`kly-${key}`" class="kly-select">
    <label class="kly-select-label" :for="key" v-if="labelable">
      {{ schema.title }}
    </label>
    <select
      ref="select"
      :id="key"
      :name="key"
      v-model="inputValue"
      v-bind="widgetProps"
    />
    <span class="kly-select-help" v-if="helpable">
      {{ schema.description }}
    </span>
  </div>
</template>

<script>
import { get } from "lodash";
import defaults from "./options.js";
import { whereStruct, whereInStruct } from "./utils.js";
import "select2";
import "select2/dist/css/select2.css";
import "select2-theme-bootstrap4/dist/select2-bootstrap.css";
import $ from "jquery";

export default {
  name: "KlyFlowAutocomplete",
  props: {
    schema: {
      type: Object,
      default: () => ({})
    },
    value: {
      type: [Object, Array]
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
    isEmpty(arrayOrObject) {
      return (
        (this.isMultiple() ? arrayOrObject : Object.keys(arrayOrObject))
          .length === 0
      );
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
        headers: {
          Authorization: archiving.authorization || ""
        },
        data: data
      });
    },
    async doRequest() {
      let wherein = (this.isMultiple()
        ? this.localValue
        : [this.localValue]
      ).reduce(
        (acc, item) => {
          acc.folio.push(item.folio);
          acc.serie.push(item.serie);
          return acc;
        },
        { folio: [], serie: [] }
      );

      return await this.getXhr({
        filter: {
          wherein: whereInStruct(wherein)
        }
      });
    },
    processResultsItems(response) {
      if (response.status === "success") {
        return response.data.map(item => {
          item.id = `${item.folio}:${item.serie}`;
          return item;
        });
      }
      return [];
    },
    getOptions() {
      let widgetProps = {
        ...this.widgetProps,
        ...{
          multiple: this.isMultiple(),
          ajax: {
            delay: 250,
            transport: (params, success) => {
              this.getXhr(params.data).then(response => {
                success(response);
              });
            },
            data: params => {
              let limit = this.get("widget.props.archiving.limit", 10),
                filter = {};

              if (params.term !== "") {
                let fields = this.get(
                  "widget.props.archiving.fields",
                  []
                ).reduce((acc, field) => {
                  acc[field.value] = "%" + params.term + "%";
                  return acc;
                }, {});

                filter = {
                  filter: {
                    orwhere: whereStruct(fields, "like", "utf8mb4_general_ci")
                  }
                };
              }

              return {
                ...filter,
                ...{
                  limit: limit,
                  page: params.page || 1
                }
              };
            },
            processResults: (response, params) => {
              let limit = this.get("widget.props.archiving.limit", 10),
                items = [];

              items = this.processResultsItems(response);

              return {
                results: items,
                pagination: {
                  more:
                    (params.page || 1) * limit <
                    ((response.paginate || {}).total || 0)
                }
              };
            }
          },
          templateResult: item => {
            if (item.loading) {
              return item.text;
            }

            let fields = this.get("widget.props.archiving.fields", []).map(
              field => {
                return {
                  title: field.title,
                  value: get(item, field.value.replace(/->/g, "."), "")
                };
              }
            );

            return $(`<div class="select2-result-meta">
                <p class="select2-result-serie-folio">Folio: ${
                  item.folio
                }, Serie: ${item.serie}</p>
                <p class="select2-result-information">
                ${fields
                  .map(field =>
                    `
                  ${field.title}: ${field.value}`.trim()
                  )
                  .join(", ")}
                </p>
            </div>`);
          },
          templateSelection: item => {
            // Item empty, fallback
            if (!item.serie && !item.folio) {
              return item.text;
            }
            return `${item.serie}${item.folio}`;
          }
        }
      };

      delete widgetProps.archiving;

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
        return this.value || (this.isMultiple() ? [] : {});
      },
      set(newValue) {
        this.$emit("update", newValue);
      }
    },
    inputValue: {
      get() {
        if (this.isEmpty(this.localValue)) {
          return "";
        }

        if (this.isMultiple()) {
          return this.localValue.map(item => `${item.folio}:${item.serie}`);
        }

        return `${this.localValue.folio}:${this.localValue.serie}`;
      },
      set(newValue) {
        newValue = (Array.isArray(newValue) ? newValue : [newValue]).map(
          item => {
            item = item.split(":");
            return {
              folio: item[0],
              serie: item[1]
            };
          }
        );

        this.localValue = this.isMultiple() ? newValue : newValue[0];
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
        this.inputValue = select.val() || "";
      });
      select.val(this.inputValue).trigger("change.select2");

      if (this.widgetProps.archiving && !this.isEmpty(this.value)) {
        select.prop("disabled", true);
        this.doRequest().then(response => {
          options.data = this.processResultsItems(response);
          select.select2(options);
          select.val(this.inputValue).trigger("change.select2");
          select.prop("disabled", false);
        });
      }
    });
  },
  beforeDestroy() {
    $(this.$refs.select)
      .off()
      .select2("destroy");
  }
};
</script>

<style>
.select2-result-serie-folio {
  margin: 0px;
}
.select2-result-information {
  margin: 0px;
  color: #808080;
  font-size: 13px;
}
.select2-results__option--highlighted .select2-result-information {
  color: #fff;
  font-size: 13px;
}
</style>
