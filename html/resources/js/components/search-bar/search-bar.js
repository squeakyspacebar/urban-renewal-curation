import to from "await-to-js";
import axios from "axios";
import {
  mdiArrowCollapseLeft,
  mdiArrowExpandRight,
  mdiChartTree,
} from "@mdi/js";
import debounce from "js/utils/debounce.js";

export default {
  computed: {
    // Format results for autocomplete dropdown items.
    items() {
      return this.entries.map((entry) => {
        return {
          label: `${entry["street_number"]} ${entry["street_name"]}`,
          value: entry,
        };
      });
    },
  },
  data() {
    return {
      collapsed: false,
      entries: [],
      isLoading: false,
      mdiArrowCollapseLeft,
      mdiArrowExpandRight,
      mdiChartTree,
      searchQuery: "",
      selectedParcel: {},
      parcelStyles: {
        highlight: {
          fillColor: "#f6931f",
          color: "#d94801",
          weight: 1,
          fillOpacity: 1,
        },
      },
    };
  },
  methods: {
    toggleDrawer() {
      this.$store.commit("toggleDataDrawer");
    },
    toggleSearch() {
      this.collapsed = !this.collapsed;
    },
  },
  watch: {
    // Debounce search input to prevent querying on every change.
    searchQuery: debounce(async function (value) {
      if (!value || this.isLoading) return;

      this.isLoading = true;

      const [err, response] = await to(
        axios({
          method: "get",
          url: "/api/search",
          params: {
            q: value,
          },
          responseType: "json",
        })
      );
      if (err) throw new Error(err);

      this.entries = response.data;
      this.isLoading = false;
    }, 500),
    selectedParcel(selection) {
      const blockNumber = selection.value.block_no;
      const parcelNumber = selection.value.parcel_no;
      const map = this.$store.state.leaflet.map;
      const parcelFeatureGroup = this.$store.state.leaflet.parcelFeatureGroup;

      // Find the polygon associated with the selected search result.
      const layers = parcelFeatureGroup.getLayers();
      const targetParcel = layers.find((layer) => {
        return (
          layer.feature.properties.block === blockNumber &&
          layer.feature.properties.parcel === parcelNumber
        );
      });

      targetParcel.setStyle(this.parcelStyles.highlight);

      map.fitBounds(targetParcel.getBounds());
    },
  },
};
