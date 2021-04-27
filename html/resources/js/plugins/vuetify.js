import Vue from "vue";
import Vuetify from "vuetify/lib";
import "vuetify/dist/vuetify.min.css";

// Register Vuetify plugin with Vue.
Vue.use(Vuetify);

// Set Vuetify configuration options.
const options = {
  icons: {
    iconfont: "mdiSvg",
  },
};

// Instantiate and return Vuetify plugin instance.
export default new Vuetify(options);
