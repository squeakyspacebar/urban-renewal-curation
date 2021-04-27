import DataDrawer from "js/components/data-drawer/data-drawer.vue";
import ParcelMap from "js/components/parcel-map/parcel-map.vue";
import SearchBar from "js/components/search-bar/search-bar.vue";

export default {
  components: {
    DataDrawer,
    ParcelMap,
    SearchBar,
  },
  computed: {
    mapLoaded() {
      return Boolean(this.$store.state.leaflet.map);
    },
  },
  data() {
    return {
      displayDrawer: false,
    };
  },
  methods: {
    toggleDrawerHandler() {
      this.displayDrawer = !this.displayDrawer;
    },
  },
};
