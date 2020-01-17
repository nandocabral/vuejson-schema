<template>
  <div :id="`kly-${key}`" class="kly-single-image">
    <label class="kly-dropzone-label" :for="key" v-if="labelable">
      {{ schema.title }}
    </label>
    <p class="kly-dropzone-help" v-if="helpable">
      {{ schema.description }}
    </p>
    <div class="kly-single-image__container">
      <div class="kly-single-image__box">
        <div
          class="kly-single-image__elcontainer"
          :style="{ 'background-image': `url(${imageData})` }"
          @click="chooseImage"
        >
          <div
            v-if="imageName.includes('.pdf')"
            class="kly-single-image__placeholder"
          >
            <svg
              width="24"
              height="24"
              xmlns="http://www.w3.org/2000/svg"
              fill-rule="evenodd"
              clip-rule="evenodd"
            >
              <path
                d="M22 24h-20v-24h14l6 6v18zm-7-23h-12v22h18v-16h-6v-6zm3 15v1h-12v-1h12zm0-3v1h-12v-1h12zm0-3v1h-12v-1h12zm-2-4h4.586l-4.586-4.586v4.586z"
              />
            </svg>
            Documento
          </div>
          <span v-if="!imageData" class="kly-single-image__placeholder">
            Click para seleccionar y/o reemplazar el elemento
          </span>
          <input
            ref="fileInput"
            class="kly-single-image__input"
            type="file"
            :id="key"
            :name="key"
            @input="onSelectFile"
          />
          <button
            v-if="imageData"
            type="button"
            class="kly-single-image__closebutton"
            @click="clearImage"
          >
            <svg
              class="kly-single-image__closeicon"
              role="button"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <title>Quitar</title>
              <path
                d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"
              />
            </svg>
          </button>
        </div>
        <p v-if="imageName" class="kly-single-image__name">
          {{ imageName }}
        </p>
      </div>
      <div v-if="urlImage" class="kly-single-image__box">
        <div
          v-if="imageName.includes('.pdf')"
          class="kly-single-image__elcontainer"
        >
          <svg
            width="24"
            height="24"
            xmlns="http://www.w3.org/2000/svg"
            fill-rule="evenodd"
            clip-rule="evenodd"
          >
            <path
              d="M22 24h-20v-24h14l6 6v18zm-7-23h-12v22h18v-16h-6v-6zm3 15v1h-12v-1h12zm0-3v1h-12v-1h12zm0-3v1h-12v-1h12zm-2-4h4.586l-4.586-4.586v4.586z"
            />
          </svg>
        </div>
        <div
          v-else
          class="kly-single-image__elcontainer"
          :style="{ 'background-image': `url(${urlGet}${urlImage})` }"
        >
          <p style="text-align: center;">
            Actual
          </p>
        </div>
      </div>
    </div>
    <p class="kly-single-image__helptext">
      <small>Formato(s) válido(s): {{ typeFiles }}</small>
    </p>
  </div>
</template>

<script>
import get from "lodash/get";

export default {
  name: "KlySingleImage",
  props: {
    schema: {
      type: Object,
      default: () => {},
      required: true
    },
    value: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      imageData: null,
      imageName: "",
      urlImage: null
    };
  },
  watch: {
    schema: {
      deep: true,
      immediate: true,
      handler(edit) {
        this.urlImage = edit.widget.props.archiving.urlImage;
        return edit;
      }
    }
  },
  methods: {
    get(path, defaultValue = undefined) {
      return get(this, `schema.${path}`, defaultValue);
    },
    chooseImage() {
      this.$refs.fileInput.click();
    },
    clearImage() {
      this.$refs.fileInput.value = "";
      this.imageData = null;
      this.imageName = "";
      this.$emit("update", false);
    },
    toBase64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
      });
    },
    async onSelectFile() {
      const input = this.$refs.fileInput;
      const files = input.files;
      if (files.length) {
        const format = files[0].name.slice(files[0].name.indexOf(".") + 1);
        if (!this.validateTypeFiles(format)) {
          this.imageData = null;
          this.imageName = "";
          this.$refs.fileInput.value = "";
        } else {
          const file = await this.toBase64(files[0]);
          this.imageName = files[0].name;
          this.imageData = file;
          this.$emit("update", file);
        }
      }
    },
    validateTypeFiles(filename) {
      return this.typeFiles.some(el => el === filename);
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
    typeFiles() {
      return this.get("widget.props.archiving.typesFiles");
    },
    urlGet() {
      return this.get("widget.props.archiving.getFileUrl");
    }
  }
};
</script>
<style scoped>
.kly-single-image__container {
  display: flex;
  display: -webkit-box;
  flex-direction: row;
  -ms-flex-direction: row;
  align-items: center;
  justify-content: center;
}
.kly-single-image__box {
  -webkit-box-flex: 1 1 0%;
  -moz-box-flex: 1 1 0%;
  flex: 1 1 0%;
}
.kly-single-image__name {
  margin-top: 0.8rem;
  font-size: 0.8rem;
  font-style: italic;
}
.kly-single-image__closeicon {
  height: 1.3rem;
  width: 1.3rem;
  fill: #ffffff;
  margin: 0 auto;
}
.kly-single-image__closebutton {
  position: absolute;
  top: -0.8rem;
  right: -0.8rem;
  background: #ce6169;
  border-radius: 50%;
  border: none;
  height: 3rem;
  width: 3rem;
}
.kly-single-image__elcontainer {
  display: block;
  width: 150px;
  height: 150px;
  cursor: pointer;
  word-break: break-word;
  font-size: 0.78rem;
  border-radius: 15px;
  position: relative;
  background-size: cover;
  background-position: center center;
  background-repeat: no-repeat;
}
.kly-single-image__input {
  display: none;
}
.help-text {
  text-align: center;
}
.kly-single-image__placeholder {
  background: #f0f0f0;
  width: 100%;
  height: 100%;
  display: flex;
  padding: 2em;
  text-align: center;
  justify-content: center;
  align-items: center;
  color: #333;
}
.kly-single-image__placeholder:hover {
  background: #e0e0e0;
}
</style>
