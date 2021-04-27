import to from "await-to-js";
import axios from "axios";
import {
  Chart,
  LineElement,
  PointElement,
  LineController,
  CategoryScale,
  LinearScale,
  Tooltip,
} from "chart.js";

Chart.register(
  LineElement,
  PointElement,
  LineController,
  CategoryScale,
  LinearScale,
  Tooltip
);

export default {
  computed: {
    selectedEventType() {
      return this.$store.state.app.selectedEventType;
    },
    selectedYear() {
      return this.$store.state.app.selectedYear;
    },
  },
  data() {
    return {
      chart: null,
      chartOptions: {
        type: "line",
        data: {},
        options: {
          animation: false,
          legend: false,
          responsive: true,
          scales: {
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
        },
        plugins: [
          {
            afterDraw: (chart) => {
              let dataToDisplay = false;

              for (const dataset of chart.data.datasets) {
                if (dataset.data.length > 0) {
                  dataToDisplay = true;
                  break;
                }
              }

              if (!dataToDisplay) {
                // No data is present
                const ctx = chart.ctx;
                const width = chart.width;
                const height = chart.height;
                chart.clear();

                ctx.save();
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                //ctx.font = "16px 'Helvetica Nueue'";
                ctx.fillText("No data to display", width / 2, height / 2);
                ctx.restore();
              }
            },
          },
        ],
      },
    };
  },
  methods: {
    createChartDataObject(labels, datasetData) {
      return {
        labels: labels,
        datasets: [
          {
            backgroundColor: ["rgba(82, 219, 255, 0.5)"],
            data: datasetData,
          },
        ],
      };
    },
    async getDataset(year, type) {
      const [getDataErr, chartData] = await to(this.getChartData(year, type));
      if (getDataErr) throw new Error(getDataErr);

      const labels = chartData.map((yearCount) => {
        return yearCount.year;
      });

      let totalEventCount = 0;
      for (const yearCount of chartData) {
        totalEventCount += yearCount.count;
      }

      let cumulativeEventCount = 0;
      const data = chartData.map((yearCount) => {
        cumulativeEventCount += parseInt(yearCount.count);
        return cumulativeEventCount;
      });

      return {
        labels,
        data,
      };
    },
    async getChartData(year, type) {
      const [err, response] = await to(
        axios({
          method: "get",
          url: "/api/event-type-occurrences-by-year",
          params: {
            year: year,
            type: type,
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

    const [parseErr, dataset] = await to(
      this.getDataset(this.selectedYear, this.selectedEventType)
    );
    if (parseErr) throw new Error(parseErr);

    // Set data to be rendered by chart.
    this.chartOptions.data = this.createChartDataObject(
      dataset.labels,
      dataset.data
    );

    this.chart = new Chart(ctx, this.chartOptions);
  },
  watch: {
    async selectedEventType() {
      const [parseErr, dataset] = await to(
        this.getDataset(this.selectedYear, this.selectedEventType)
      );
      if (parseErr) throw new Error(parseErr);

      this.chart.data = this.createChartDataObject(
        dataset.labels,
        dataset.data
      );
      this.chart.update();
    },
    async selectedYear() {
      const [parseErr, dataset] = await to(
        this.getDataset(this.selectedYear, this.selectedEventType)
      );
      if (parseErr) throw new Error(parseErr);

      this.chart.data = this.createChartDataObject(
        dataset.labels,
        dataset.data
      );
      this.chart.update();
    },
  },
};
