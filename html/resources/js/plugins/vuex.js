import Vue from "vue";
import Vuex from "vuex";

// Register Vuex plugin with Vue.
Vue.use(Vuex);

const appModule = {
  state: {
    displayDataDrawer: false,
    selectedEventType: "",
    selectedYear: 1950,
  },
  mutations: {
    decrementSelectedYear(state) {
      state.selectedYear--;
    },
    incrementSelectedYear(state) {
      state.selectedYear++;
    },
    setSelectedEventType(state, eventType) {
      state.selectedEventType = eventType;
    },
    setSelectedYear(state, year) {
      state.selectedYear = year;
    },
    toggleDataDrawer(state) {
      state.displayDataDrawer = !state.displayDataDrawer;
    },
  },
};

const leafletModule = {
  state: {
    map: null,
    parcelFeatureGroup: null,
  },
  getters: {
    parcelCount(state) {
      return state.parcelFeatureGroup.getLayers().length;
    },
  },
  mutations: {
    setMap(state, map) {
      state.map = map;
    },
    setParcelFeatureGroup(state, geoJSON) {
      state.parcelFeatureGroup = geoJSON;
    },
  },
};

export default new Vuex.Store({
  modules: {
    app: appModule,
    leaflet: leafletModule,
  },
});
