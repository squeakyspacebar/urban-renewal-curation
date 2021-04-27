import to from "await-to-js";
import axios from "axios";
import {
  Chart,
  BarElement,
  BarController,
  CategoryScale,
  LinearScale,
} from "chart.js";
// Chart.js documentation is terrible. When using ES modules, helper functions
// are made accessible by importing as below from chart.js/helpers.
import { fontString } from "chart.js/helpers";

Chart.register(BarElement, BarController, CategoryScale, LinearScale);

export default {
  computed: {
    selectedYear() {
      return this.$store.state.app.selectedYear;
    },
  },
  data() {
    return {
      chart: null,
      chartOptions: {
        type: "bar",
        data: {},
        options: {
          animation: false,
          responsive: true,
          scales: {
            x: {
              ticks: {
                autoSkip: false,
              },
            },
            y: {
              ticks: {
                beginAtZero: true,
                precision: 0,
              },
              title: {
                display: true,
                text: "Parcels Counted",
              },
            },
          },
          update: {
            mode: "none",
          },
        },
      },
    };
  },
  methods: {
    createChartDataObject(labels, datasetData) {
      return {
        labels: labels,
        datasets: [
          {
            backgroundColor: [
              "rgba(158, 202, 225, 0.7)", // Appraisal
              "rgba(66, 146, 198, 0.7)", // Award
              "rgba(199, 233, 192, 0.7)", // Decision
              "rgba(8, 88, 158, 0.7)", // End of Case
              "rgba(35, 139, 69, 0.7)", // Final Transfer of Deed
              "rgba(255, 255, 204, 0.7)", // Offer Made
              "rgba(116, 196, 118, 0.7)", // Tenant Moved
              "rgba(35, 139, 69, 0.7)", // Previous Transfer of Deed
            ],
            barPercentage: 0.75,
            borderColor: [
              "rgba(158, 202, 225, 1.0)", // Appraisal
              "rgba(66, 146, 198, 1.0)", // Award
              "rgba(199, 233, 192, 1.0)", // Decision
              "rgba(8, 88, 158, 1.0)", // End of Case
              "rgba(35, 139, 69, 1.0)", // Final Transfer of Deed
              "rgba(255, 255, 204, 1.0)", // Offer Made
              "rgba(116, 196, 118, 1.0)", // Tenant Moved
              "rgba(35, 139, 69, 1.0)", // Previous Transfer of Deed
            ],
            borderWidth: 2,
            categoryPercentage: 1.0,
            data: datasetData,
            hoverBackgroundColor: [
              "rgba(158, 202, 225, 1.0)", // Appraisal
              "rgba(66, 146, 198, 1.0)", // Award
              "rgba(199, 233, 192, 1.0)", // Decision
              "rgba(8, 88, 158, 1.0)", // End of Case
              "rgba(35, 139, 69, 1.0)", // Final Transfer of Deed
              "rgba(255, 255, 204, 1.0)", // Offer Made
              "rgba(116, 196, 118, 1.0)", // Tenant Moved
              "rgba(35, 139, 69, 1.0)", // Previous Transfer of Deed
            ],
            hoverBorderColor: [
              "rgba(158, 202, 225, 1.0)", // Appraisal
              "rgba(66, 146, 198, 1.0)", // Award
              "rgba(199, 233, 192, 1.0)", // Decision
              "rgba(8, 88, 158, 1.0)", // End of Case
              "rgba(35, 139, 69, 1.0)", // Final Transfer of Deed
              "rgba(255, 255, 204, 1.0)", // Offer Made
              "rgba(116, 196, 118, 1.0)", // Tenant Moved
              "rgba(35, 139, 69, 1.0)", // Previous Transfer of Deed
            ],
            hoverBorderWidth: 2,
          },
        ],
      };
    },
    async getChartData(year) {
      const [err, response] = await to(
        axios({
          method: "get",
          url: "/api/all-event-type-occurrences",
          params: {
            year: year,
          },
          responseType: "json",
        })
      );
      if (err) throw new Error(err);

      return response.data;
    },
  },
  async mounted() {
    // Retrieve canvas rendering context for drawing chart.
    const container = this.$el;
    const ctx = container.getContext("2d");

    const [getDataErr, chartData] = await to(
      this.getChartData(this.selectedYear)
    );
    if (getDataErr) throw new Error(getDataErr);

    const labels = chartData.map((eventType) => {
      return eventType.label;
    });

    const datasetData = chartData.map((eventType) => {
      return eventType.count;
    });

    const data = this.createChartDataObject(labels, datasetData);
    // Set data to be rendered by chart.
    // Don't need to trigger data update detection, so Vue.set() skipped.
    this.chartOptions.data = data;

    this.chart = new Chart(ctx, this.chartOptions);
  },
  watch: {
    async selectedYear() {
      const [getDataErr, chartData] = await to(
        this.getChartData(this.selectedYear)
      );
      if (getDataErr) throw new Error(getDataErr);

      const datasetData = chartData.map((eventType) => {
        return eventType.count;
      });

      this.chart.data.datasets.forEach((dataset) => {
        dataset.data = datasetData;
      });
      this.chart.update();
    },
  },
};
