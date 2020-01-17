<template>
  <div id="app" class="container-fluid">
    <div class="row">
      <div class="col">
        <select name id class="form-control" @input="onChangeSchema($event)">
          <option value="/json/files.json">Files</option>
          <option value="/json/selects.json">Selects</option>
          <option value="/json/datetime.json">Datetime</option>
          <option value="/json/inputs.json">Inputs</option>
          <option value="/json/checkboxes.json">Checkboxes</option>
          <option value="/json/others.json">Others</option>
          <option value="/json/arrays.json">Arrays</option>
        </select>
      </div>
    </div>
    <div class="row">
      <div class="col-4">
        <prism-editor
          v-model="schemaless"
          language="json"
          :lineNumbers="true"
        />
      </div>
      <div class="col-4">
        <form
          ref="form"
          action="http://localhost:8090/"
          method="post"
          enctype="multipart/form-data"
        >
          <vuec-form :schema="schema" :value="model" @change="onChange">
            <button type="submit" class="btn btn-primary">Enviar</button>
          </vuec-form>
        </form>
      </div>
      <div class="col-4">
        <pre>{{ $data.model }}</pre>
      </div>
    </div>
  </div>
</template>

<script>
import "bootstrap/dist/css/bootstrap.min.css";
import "prismjs/themes/prism.css";
import "vue-prism-editor/dist/VuePrismEditor.css";

import "prismjs";
import PrismEditor from "vue-prism-editor";

import axios from "axios";

export default {
  name: "app",
  components: {
    PrismEditor
  },
  data() {
    return {
      model: {},
      schema: {}
    };
  },
  methods: {
    onChangeSchema(event) {
      axios.get(event.target.value).then(response => {
        this.schema = response.data;
      });
    },
    onChange: data => {
      console.log(data);
    }
  },
  computed: {
    schemaless: {
      get() {
        return JSON.stringify(this.schema, null, 2);
      },
      set(newVal) {
        this.schema = JSON.parse(newVal);
      }
    }
  },
  created() {
    axios.get("/json/archiving.json").then(response => {
      this.schema = response.data;
    });
  }
};
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
.row {
  padding: 20px;
}
.col-4 {
  padding: 10px;
  border: 1px solid #ccc;
}
.vuec-input {
  padding: 10px 0px;
  border-bottom: 1px solid lightgray;
}
</style>
