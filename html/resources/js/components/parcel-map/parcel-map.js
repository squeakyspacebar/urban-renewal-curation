import to from "await-to-js";
import axios from "axios";
import { mdiMinus, mdiPlus } from "@mdi/js";
import L from "leaflet";
import debounce from "js/utils/debounce.js";

export default {
  data() {
    return {
      parcelFeatures: [],
      geoJsonPath: "data/parcels.json",
      isLoading: true,
      maxYear: 1980,
      mdiMinus,
      mdiPlus,
      minYear: 1950,
      // Polygon styles for use with Leaflet.
      parcelStyles: {
        appraisal: {
          fillColor: "#9ecae1",
          color: "black",
          weight: 1,
          fillOpacity: 0.7,
        },
        award: {
          fillColor: "#4292c6",
          color: "black",
          weight: 1,
          fillOpacity: 0.7,
        },
        decision: {
          fillColor: "#c7e9c0",
          color: "black",
          weight: 1,
          fillOpacity: 0.7,
        },
        default: {
          fillColor: "#dadaeb",
          color: "black",
          weight: 1,
          fillOpacity: 0.7,
        },
        end: {
          fillColor: "#08589e",
          color: "black",
          weight: 1,
          fillOpacity: 0.7,
        },
        hover: {
          fillColor: "#feebe2",
          color: "#ff69b4",
          weight: 4,
        },
        offer: {
          fillColor: "#ffffcc",
          color: "black",
          weight: 1,
          fillOpacity: 0.7,
        },
        moved: {
          fillColor: "#74c476",
          color: "black",
          weight: 1,
          fillOpacity: 0.7,
        },
        transfer: {
          fillColor: "#238b45",
          color: "black",
          weight: 1,
          fillOpacity: 0.7,
        },
      },
      selectedYear: 1950,
    };
  },
  methods: {
    async styleParcelsByEventType(events) {
      const parcelFeatureGroup = this.$store.state.leaflet.parcelFeatureGroup;
      parcelFeatureGroup.eachLayer((layer) => {
        const parcel = layer.feature;

        const mostRecentEvent = events.find((event) => {
          return (
            event.parcel_no === parcel.properties.parcel &&
            event.block_no === parcel.properties.block
          );
        });

        let eventStyle = this.parcelStyles.default;

        // As there can be multiple events on a given date, this conditional
        // block should resolve in order of importance to be highlighted.
        if (mostRecentEvent) {
          if (mostRecentEvent.types.includes("End")) {
            eventStyle = this.parcelStyles.end;
          } else if (mostRecentEvent.types.includes("Tenant")) {
            eventStyle = this.parcelStyles.tenant;
          } else if (mostRecentEvent.types.includes("Decision")) {
            eventStyle = this.parcelStyles.decision;
          } else if (
            ["Previous", "Final"].some((i) => mostRecentEvent.types.includes(i))
          ) {
            eventStyle = this.parcelStyles.transfer;
          } else if (mostRecentEvent.types.includes("Offer")) {
            eventStyle = this.parcelStyles.offer;
          } else if (mostRecentEvent.types.includes("Appraisal")) {
            eventStyle = this.parcelStyles.appraisal;
          } else if (mostRecentEvent.types.includes("Award")) {
            eventStyle = this.parcelStyles.award;
          }
        }

        // Record event style for reverting hover style changes.
        // This is due to Leaflet's limited layer styling capabilities.
        layer._parcelEventStyle = eventStyle;

        layer.setStyle(eventStyle);
      });
    },
    decrementYear() {
      if (this.selectedYear > this.minYear) {
        this.selectedYear--;
      }
    },
    incrementYear() {
      if (this.selectedYear < this.maxYear) {
        this.selectedYear++;
      }
    },
    initMap() {
      // Bounds to prevent attempted loading of nonexistent tiles.
      const nBound = 35.5925;
      const eBound = -82.5505;
      const sBound = 35.5725;
      const wBound = -82.5665;

      const ashevilleBounds = L.latLngBounds([
        [sBound, wBound],
        [nBound, eBound],
      ]);

      // Bounds visualization polygon for debugging.
      const polygon = L.polygon([
        [nBound, wBound],
        [nBound, eBound],
        [sBound, eBound],
        [sBound, wBound],
      ]);

      // Create base tile layer.
      const baseLayer = L.tileLayer("http://{s}.tile.osm.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="http://osm.orgc/opyright">OpenStreetMap</a> contributors',
      });

      // Create historical Asheville tile layer.
      const ashevilleLayer = L.tileLayer(
        "img/tiles/asheville/{z}/{x}/{y}.png",
        {
          bounds: ashevilleBounds,
          tms: true,
          opacity: 0.8,
        }
      );

      // Create layer groups for easier management.
      const tileLayerGroup = L.layerGroup([baseLayer, ashevilleLayer]);

      // Create GeoJSON (FeatureGroup) from feature collection.
      const parcelFeatureGroup = L.geoJSON(this.parcelFeatures, {
        style: this.parcelStyles.default,
        onEachFeature: this.onEachFeature,
      });

      const map = L.map(this.$el, {
        zoomControl: false,
        maxZoom: 18,
        minZoom: 15,
      });

      map.setView([35.5825, -82.56], 16);

      tileLayerGroup.addTo(map);
      parcelFeatureGroup.addTo(map);

      L.Control.YearSlider = L.Control.extend({
        options: {
          position: "bottomright",
        },
        onAdd: () => {
          // Retrieve the control DOM element.
          const el = this.$refs["year-control-bar"].$el;

          // Disable click event handling
          L.DomEvent.disableClickPropagation(el);

          return el;
        },
      });

      L.control.yearSlider = (options) => {
        return new L.Control.YearSlider(options);
      };

      map.addControl(
        L.control.yearSlider({
          position: "bottomleft",
        })
      );

      map.addControl(
        L.control.zoom({
          position: "bottomleft",
        })
      );

      // Commit references to Vuex store for global access.
      this.$store.commit("setSelectedYear", this.selectedYear);
      this.$store.commit("setMap", map);
      this.$store.commit("setParcelFeatureGroup", parcelFeatureGroup);
    },
    async getParcelFeatures() {
      const [err, response] = await to(
        axios({
          method: "get",
          url: this.geoJsonPath,
          responseType: "json",
        })
      );
      if (err) throw new Error(err);

      return response.data;
    },
    async getParcelEvents(block, parcel) {
      const [err, response] = await to(
        axios({
          method: "get",
          url: "/api/parcel-events",
          params: {
            block: block,
            parcel: parcel,
          },
          responseType: "json",
        })
      );
      if (err) throw new Error(err);

      return response.data;
    },
    async getParcelImages(block, parcel) {
      const [err, response] = await to(
        axios({
          method: "get",
          url: "/api/parcel-images",
          params: {
            block: block,
            parcel: parcel,
          },
          responseType: "json",
        })
      );
      if (err) throw new Error(err);

      return response.data;
    },
    async getParcelPeople(block, parcel) {
      const [err, response] = await to(
        axios({
          method: "get",
          url: "/api/parcel-people",
          params: {
            block: block,
            parcel: parcel,
          },
          responseType: "json",
        })
      );

      if (err) throw new Error(err);

      return response.data;
    },
    async getMostRecentEvents(year) {
      const [err, response] = await to(
        axios({
          method: "get",
          url: "/api/most-recent-events",
          params: {
            year,
          },
          responseType: "json",
        })
      );
      if (err) throw new Error(err);

      return response.data;
    },
    onEachFeature(feature, layer) {
      const parcel = feature.properties.parcel;
      const block = feature.properties.block;

      const container = document.createElement("article");
      container.id = `parcel-b${block}-p${parcel}`;

      layer.on("click", async (event) => {
        let popupContent = "";
        let circles = "";

        const [getImagesErr, parcelImages] = await to(
          this.getParcelImages(block, parcel)
        );
        if (getImagesErr) {
          console.error(getImagesErr);
        }

        const [getEventsErr, parcelEvents] = await to(
          this.getParcelEvents(block, parcel)
        );
        if (getEventsErr) {
          console.error(getEventsErr);
        }

        const [getPeopleErr, parcelPeople] = await to(
          this.getParcelPeople(block, parcel)
        );
        if (getPeopleErr) {
          console.error(getPeopleErr);
        }

        const propertyImgBasePath = "/img/properties/";
        const featuredImgPath =
          parcelImages && parcelImages?.image_paths.length > 0
            ? `${propertyImgBasePath}B${block}_P${parcel}/` +
              parcelImages.image_paths[0]
            : "img/default_image.jpg";

        var address =
          (feature.properties.st_num == null ? "" : feature.properties.st_num) +
          " " +
          (feature.properties.st_name == null
            ? ""
            : feature.properties.st_name);

        if (parcelEvents.length === 0) {
          popupContent = "<p>No data</p>";
        } else {
          for (const parcelEvent of parcelEvents) {
            let node = "";

            if (parcelEvent.type.includes("Transfer of Deed")) {
              node =
                "<div class='parcel-event-node' style='background-color:#238b45;'></div>";
            } else if (parcelEvent.type === "Offer Made") {
              node =
                "<div class='parcel-event-node' style='background-color:#ffffcc;'></div>";
            } else if (parcelEvent.type === "Appraisal") {
              node =
                "<div class='parcel-event-node' style='background-color:#9ecae1;'></div>";
            } else if (parcelEvent.type === "Decision (Accept/Reject)") {
              node =
                "<div class='parcel-event-node' style='background-color:#c7e9c0;'></div>";
            } else if (parcelEvent.type === "Tenant Moved") {
              node =
                "<div class='parcel-event-node' style='background-color:#74c476;'></div>";
            } else if (parcelEvent.type === "Award") {
              node =
                "<div class='parcel-event-node' style='background-color:#4292c6;'></div>";
            } else if (parcelEvent.type === "End of Case") {
              node =
                "<div class='parcel-event-node' style='background-color:08589e;'></div>";
            }

            if (!node) continue;

            //circles += circle;

            popupContent +=
              "<li class='parcel-event'>" +
              node +
              `<span class='parcel-event-data'>${parcelEvent.type}: ` +
              (parcelEvent.date ?? "No date") +
              "</span></li>";
          }
        }

        let customPopup =
          `<h1 class='parcel-card-title'>${address}</h1>` +
          "<div class='parcel-card-content'>" +
          "<section class='parcel-featured-image-section'>" +
          "<img class='parcel-featured-image' src='" +
          featuredImgPath +
          "' />" +
          "</section>" +
          "<section class='parcel-events-section'>" +
          "<h2 class='section-heading'>Event Timeline</h2>" +
          "<ul class='parcel-events-list'>" +
          popupContent +
          "</ul>" +
          "</section>" +
          "<section class='parcel-people-section'>" +
          "<h2 class='section-heading'>Associated People</h2>";

        if (parcelPeople?.length > 0) {
          let names = "";
          let role = "";

          for (const person of parcelPeople) {
            if (person.name === null || person.role === null) continue;
            if (person.name.trim() === "Redevelopment Commission of the City")
              continue;

            if (role != person.role) {
              names += `<h3 class='person-role'>${person.role}</h3>`;
              role = person.role;
            }

            names += `<div class='person-name'>${person.name}</div>`;
          }

          customPopup += `${names}`;
        }

        customPopup += "</section></div><div class='thumb-images'>";

        if (
          Array.isArray(parcelImages?.image_paths) &&
          parcelImages.image_paths.length > 0
        ) {
          for (let i = 0; i < parcelImages.image_paths.length; ++i) {
            customPopup +=
              "<img class='img-click' src='" +
              `${propertyImgBasePath}B${block}_P${parcel}/` +
              parcelImages.image_paths[i] +
              "'/>";
          }
        }

        customPopup += "</div></div>";

        // Attach event handler for image selection.
        container.onclick = (event) => {
          if (event.target.matches(".img-click")) {
            const el = container.querySelector(".parcel-featured-image");
            el.setAttribute("src", event.target.currentSrc);
          }
        };

        container.innerHTML = customPopup;
      });

      layer.on({
        mouseover: (event) => {
          const layer = event.target;
          layer.setStyle(this.parcelStyles.hover);
        },
        mouseout: (event) => {
          const layer = event.target;
          layer.setStyle(layer?._parcelEventStyle ?? this.parcelStyles.default);
        },
      });

      layer.bindPopup(container, {
        maxWidth: "auto",
        className: "map-pop-up",
      });
    },
  },
  async mounted() {
    // Get parcel data.
    const [getFeaturesErr, features] = await to(this.getParcelFeatures());
    if (getFeaturesErr) throw new Error(getFeaturesErr);

    this.parcelFeatures = features;

    // Create Leaflet map.
    this.initMap();

    // Get list of most recent events by parcel.
    const [getEventsErr, events] = await to(
      this.getMostRecentEvents(this.selectedYear)
    );
    if (getEventsErr) throw new Error(getEventsErr);

    // Refresh polygon styles by most recent event type.
    this.styleParcelsByEventType(events);

    this.isLoading = false;
  },
  watch: {
    selectedYear: debounce(async function (newValue) {
      this.$store.commit("setSelectedYear", newValue);

      const [getEventsErr, events] = await to(
        this.getMostRecentEvents(newValue)
      );
      if (getEventsErr) throw new Error(getEventsErr);

      this.styleParcelsByEventType(events);
    }, 200),
  },
};
