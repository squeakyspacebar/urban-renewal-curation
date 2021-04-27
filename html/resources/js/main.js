import Vue from "vue";
import App from "js/components/app/app.vue";
import vuetify from "js/plugins/vuetify";
import store from "js/plugins/vuex";
import "leaflet/dist/leaflet.css";
import "styles/style.scss";

(function () {
  new Vue({
    store,
    vuetify,
    components: {
      App,
    },
    el: ".app",
    render: function (createElement) {
      return createElement(App);
    },
  });
})();
