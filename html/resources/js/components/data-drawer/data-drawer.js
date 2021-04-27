import to from "await-to-js";
import axios from "axios";
import EventChart from "js/components/event-chart/event-chart.vue";
import EventProgressChart from "js/components/event-progress-chart/event-progress-chart.vue";

export default {
  components: {
    EventChart,
    EventProgressChart,
  },
  computed: {
    displayDrawer() {
      return this.$store.state.app.displayDataDrawer;
    },
  },
  data() {
    return {
      eventTypes: [],
      // Default value set after options are returned.
      select: "",
    };
  },
  methods: {
    async getEventTypes() {
      const [err, response] = await to(
        axios({
          method: "get",
          url: "/api/event-types",
          responseType: "json",
        })
      );
      if (err) throw new Error(err);

      return response.data;
    },
  },
  async mounted() {
    // Get list of event types for select menu options.
    const [getEventTypesErr, eventTypes] = await to(this.getEventTypes());
    if (getEventTypesErr) throw new Error(getEventTypesErr);

    const values = eventTypes.map((eventType) => {
      return eventType.type;
    });

    this.eventTypes = values;
  },
  watch: {
    select(newValue) {
      this.$store.commit("setSelectedEventType", newValue);
    },
  },
};
