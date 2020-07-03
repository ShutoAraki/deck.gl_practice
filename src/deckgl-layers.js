import { ScatterplotLayer, HexagonLayer, PolygonLayer } from 'deck.gl';

// in RGB

const HEATMAP_COLORS = [
  [255, 255, 204],
  [199, 233, 180],
  [127, 205, 187],
  [65, 182, 196],
  [44, 127, 184],
  [37, 52, 148]
];

const LIGHT_SETTINGS = {
  lightsPosition: [-73.8, 40.5, 8000, -74.2, 40.9, 8000],
  ambientRatio: 0.4,
  diffuseRatio: 0.6,
  specularRatio: 0.2,
  lightsStrength: [0.8, 0.0, 0.8, 0.0],
  numberOfLights: 2
};

const elevationRange = [0, 1000];

const PICKUP_COLOR = [114, 19, 108];
const DROPOFF_COLOR = [243, 185, 72];

// TODO: Data loading on-demand
function _loadData(settings) {
}

function _getLayers(settings) {
}

export function renderLayers(props) {
  const { data, onHover, settings } = props;
  const points = data.points;
  const geoms = data.geometry;
  return [
    settings.showScatterplot &&
      new ScatterplotLayer({
        id: 'scatterplot',
        data: points,
        getPosition: d => d.position,
        getColor: d => (d.pickup ? PICKUP_COLOR : DROPOFF_COLOR),
        getRadius: d => 5,
        opacity: 0.5,
        pickable: true,
        radiusMinPixels: 0.25,
        radiusMaxPixels: 30,
        onHover,
        ...settings
      }),
    settings.showHexagon &&
      new HexagonLayer({
        id: 'heatmap',
        data: points,
        colorRange: HEATMAP_COLORS,
        elevationRange,
        elevationScale: 5,
        extruded: false,
        getPosition: d => d.position,
        lightSettings: LIGHT_SETTINGS,
        opacity: 0.8,
        pickable: true,
        onHover,
        ...settings
      }),
    settings.showPopulation && 
      new PolygonLayer({
        id: 'total_population',
        data: geoms,
        pickable: true,
        stroked: true,
        filled: true,
        wireframe: true,
        lineWidthMinPixels: 1,
        getPolygon: d => d.polygon,
        getElevation: 10,
        getFillColor: d => [d.population * 2, 185, 72, 0.7*255],
        getLineColor: d => [d.population * 2, 185, 72, 0.7*255],
        getLineWidth: 0 
      }),
  ];
}