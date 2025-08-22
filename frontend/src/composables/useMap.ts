import { getPoints } from "@/services/pointsService";
import * as polygonService from "@/services/polygonService";
import * as turf from "@turf/turf";
import * as L from "leaflet";
import "leaflet-draw";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet/dist/leaflet.css";
import { ref, watch } from "vue";

import * as geoService from "@/services/geoService";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

export interface AnalysisResult {
  totalPoints: number;
  sum: number;
  mean: number;
  median: number;
}

export interface DataFilter {
  min_value: number | null;
}

export function useMap(mapContainerId: string) {
  // --- estado ---
  const allPointsData = ref<any[]>([]);
  const analysisResult = ref<AnalysisResult | null>(null);
  const interactionMode = ref<"navigate" | "draw">("navigate");
  const filter = ref<DataFilter>({ min_value: null });
  const mapType = ref<"roadmap" | "satellite" | "hybrid">("roadmap");
  const showPoints = ref(true);

  let map: L.Map;
  let pointsLayer: L.MarkerClusterGroup;
  let customLayer: L.LayerGroup;
  let savedPolygonsLayer: L.FeatureGroup;
  let drawnItems: L.FeatureGroup;
  let drawControl: L.Control.Draw;
  let tileLayer: L.TileLayer;

  const setInteractionMode = (mode: "navigate" | "draw") => {
    interactionMode.value = mode;
    if (!map) return;
    if (mode === "draw") {
      map.dragging.disable();
    } else {
      map.dragging.enable();
    }
  };

  const updatePointsLayer = () => {
    if (!pointsLayer) return;
    pointsLayer.clearLayers();
    const filteredData = allPointsData.value.filter((feature) => {
      const properties = feature.properties || {};
      if (
        filter.value.min_value !== null &&
        properties.value < filter.value.min_value
      ) {
        return false;
      }
      return true;
    });

    const markers = filteredData.map((feature: any) => {
      const [lng, lat] = feature.geometry.coordinates;
      const popupContent = Object.entries(feature.properties)
        .map(([key, value]) => `<strong>${key}:</strong> ${value}`)
        .join("<br>");
      return L.marker([lat, lng]).bindPopup(popupContent);
    });
    pointsLayer.addLayers(markers);
  };

  watch(filter, updatePointsLayer, { deep: true });

  const fetchAllPoints = async ({ page = 1, limit = 1000 } = {}) => {
    try {
      const data = await getPoints(page, limit);
      if (data?.features) {
        allPointsData.value = data.features;
        updatePointsLayer();

        const latlngs = allPointsData.value.map(
          (f: any) =>
            [
              f.geometry.coordinates[1],
              f.geometry.coordinates[0],
            ] as L.LatLngExpression
        );

        if (latlngs.length) {
          map.fitBounds(L.latLngBounds(latlngs), { padding: [50, 50] });
        }
      }
    } catch (err) {
      console.error("Erro ao carregar pontos de análise:", err);
    }
  };

  const loadPersistedPoints = async () => {
    try {
      const persistedPoints = await geoService.listGeoPoints();
      if (persistedPoints && Array.isArray(persistedPoints)) {
        persistedPoints.forEach((point: any) => {
          const lat = parseFloat(point.lat);
          const lon = parseFloat(point.lon);
          const popupContent =
            point.info?.display_name || `Lat: ${lat}, Lon: ${lon}`;
          L.marker([lat, lon]).bindPopup(popupContent).addTo(customLayer);
        });
      }
    } catch (error) {
      console.error("Erro ao carregar pontos persistidos:", error);
    }
  };

  const loadSavedPolygons = async () => {
    try {
      const polygons = await polygonService.listPolygons();

      if (polygons && Array.isArray(polygons)) {
        polygons.forEach((polygon: any) => {
          const latlngs: L.LatLngTuple[] = JSON.parse(polygon.coordinates).map(
            (coord: number[]) => [coord[0], coord[1]] as L.LatLngTuple
          );

          const polygonLayer = L.polygon(latlngs, {
            color: "#3388ff",
          }).bindPopup(
            `<b>${polygon.name}</b><br>Contém ${
              polygon.pointsInside?.length || "N/A"
            } pontos.`
          );

          savedPolygonsLayer.addLayer(polygonLayer);
        });
      }
    } catch (error) {
      console.error("Erro ao carregar polígonos salvos:", error);
    }
  };

  const analyzePolygon = (polygonLayer: L.Polygon) => {
    const polygonGeoJSON = polygonLayer.toGeoJSON();
    const pointsGeoJSON = turf.featureCollection(
      allPointsData.value.map((p) =>
        turf.point(p.geometry.coordinates, p.properties)
      )
    );

    const ptsWithin = turf.pointsWithinPolygon(pointsGeoJSON, polygonGeoJSON);
    const values = ptsWithin.features
      .map((f: any) => f.properties.value)
      .filter((v): v is number => typeof v === "number");

    if (values.length === 0) {
      const result = { totalPoints: 0, sum: 0, mean: 0, median: 0 };
      analysisResult.value = result;
      return { pointsInside: [], analysis: result };
    }

    const sum = values.reduce((acc, val) => acc + val, 0);
    const mean = sum / values.length;
    values.sort((a, b) => a - b);
    const mid = Math.floor(values.length / 2);
    const median =
      values.length % 2 !== 0
        ? values[mid]
        : (values[mid - 1] + values[mid]) / 2;

    analysisResult.value = {
      totalPoints: values.length,
      sum: parseFloat(sum.toFixed(2)),
      mean: parseFloat(mean.toFixed(2)),
      median: parseFloat(median.toFixed(2)),
    };
    const pointIdsInside = ptsWithin.features.map((f: any) => f.properties.id);
    return { pointsInside: pointIdsInside, analysis: analysisResult.value };
  };

  const setMapType = (type: "roadmap" | "satellite" | "hybrid") => {
    mapType.value = type;
    const urls = {
      roadmap: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      satellite:
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      hybrid: "https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}",
    };
    const attributions = {
      roadmap:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      satellite:
        "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
      hybrid: "&copy; Google",
    };
    if (tileLayer) {
      tileLayer.setUrl(urls[type]);
      tileLayer.options.attribution = attributions[type];
      tileLayer.redraw();
    }
  };

  const clearAnalysis = () => {
    drawnItems.clearLayers();
    analysisResult.value = null;
  };

  const initializeMap = () => {
    map = L.map(mapContainerId, {
      minZoom: 4,
      maxZoom: 18,
    }).setView([-23.55052, -46.63331], 5);
    tileLayer = L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        subdomains: ["a", "b", "c"],
      }
    ).addTo(map);

    pointsLayer = L.markerClusterGroup();
    customLayer = L.layerGroup();
    savedPolygonsLayer = new L.FeatureGroup();
    drawnItems = new L.FeatureGroup().addTo(map);

    const overlayLayers = {
      "Meus Pins": customLayer,
      "Pontos de Análise": pointsLayer,
      "Áreas Salvas": savedPolygonsLayer,
    };
    L.control
      .layers(undefined, overlayLayers, { position: "topright" })
      .addTo(map);

    map.addLayer(customLayer);
    map.addLayer(savedPolygonsLayer);
    if (showPoints.value) {
      map.addLayer(pointsLayer);
    }

    map.on("overlayadd", (e: L.LayersControlEvent) => {
      if (e.layer === pointsLayer) {
        showPoints.value = true;
      }
    });

    map.on("overlayremove", (e: L.LayersControlEvent) => {
      if (e.layer === pointsLayer) {
        showPoints.value = false;
      }
    });

    drawControl = new L.Control.Draw({
      edit: { featureGroup: drawnItems },
      draw: {
        polygon: {
          shapeOptions: { color: "#f06eaa" },
          allowIntersection: false,
        },
        polyline: false,
        rectangle: false,
        circle: false,
        marker: false,
        circlemarker: false,
      },
    });
    map.addControl(drawControl);

    map.on("click", async (event: L.LeafletMouseEvent) => {
      if (interactionMode.value === "navigate") {
        const { lat, lng } = event.latlng;
        try {
          await geoService.createGeoPoint({ lat, lon: lng });
          const geoData = await geoService.reverseGeo(lat, lng);
          const popupContent = geoData.display_name || JSON.stringify(geoData);
          L.marker([lat, lng])
            .bindPopup(popupContent)
            .addTo(customLayer)
            .openPopup();
        } catch (err) {
          console.error("Erro ao adicionar novo pino:", err);
          L.marker([lat, lng])
            .bindPopup("Erro ao salvar ou buscar informações.")
            .addTo(customLayer)
            .openPopup();
        }
      }
    });

    map.on(L.Draw.Event.CREATED, async (event) => {
      const layer = (event as L.DrawEvents.Created).layer as L.Polygon;
      drawnItems.addLayer(layer);
      const { pointsInside, analysis } = analyzePolygon(layer);
      layer
        .bindPopup(
          `<h4>Análise da Área</h4>
           <strong>Total de Pontos:</strong> ${analysis.totalPoints}<br>
           <strong>Soma:</strong> ${analysis.sum}<br>
           <strong>Média:</strong> ${analysis.mean}<br>
           <strong>Mediana:</strong> ${analysis.median}`
        )
        .openPopup();

      const name = prompt(
        "Digite um nome para este polígono:",
        "Nova Área de Análise"
      );
      if (name) {
        try {
          const latlngs = layer.getLatLngs()[0] as L.LatLng[];
          const coordinates = latlngs.map((latlng) => [latlng.lat, latlng.lng]);

          await polygonService.createPolygon({
            name,
            coordinates,
            pointsInside,
          });

          const newPolygon = L.polygon(layer.getLatLngs(), {
            color: "#3388ff",
          }).bindPopup(`<b>${name}</b>`);
          savedPolygonsLayer.addLayer(newPolygon);

          clearAnalysis();
        } catch (error) {
          console.error("Falha ao salvar polígono:", error);
          alert("Erro ao salvar polígono.");
        }
      }
    });

    map.on("draw:drawstart", () => {
      clearAnalysis();
    });
  };

  const togglePoints = () => {
    if (!map) return;
    if (map.hasLayer(pointsLayer)) {
      map.removeLayer(pointsLayer);
    } else {
      map.addLayer(pointsLayer);
    }
  };

  const init = async () => {
    initializeMap();
    await fetchAllPoints();
    await loadPersistedPoints();
    await loadSavedPolygons();
  };

  return {
    analysisResult,
    init,
    interactionMode,
    setInteractionMode,
    filter,
    mapType,
    setMapType,
    clearAnalysis,
    showPoints,
    togglePoints,
  };
}
