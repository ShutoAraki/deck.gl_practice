import { ScatterplotLayer, HexagonLayer, PolygonLayer, DeckGL } from 'deck.gl';
import DataFrame from 'dataframe-js';
import { data_format } from './style';

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
// Maybe return the 
function _loadData(dtype, colname) {
  var data_dir = 'http://127.0.0.1:8081/';
  if (dtype === 'hex') {
    data_dir += 'hexData-';
  } else if (dtype === 'chome') {
    data_dir += 'chomeData-';
  } else {
    console.error("Invalid data type: " + dtype);
  }
  data_dir += colname + '.csv';
  return DataFrame.fromCSV(data_dir).then(df => {
    const dataRows = df.toArray();
    const fields = df.listColumns();
    const castedData = dataRows.map(r => r.reduce((prev, curr, i) => {
        const field = fields[i];
        prev[field] = data_format[field](curr);
        return prev;
    }, {}));
    return castedData;
  });
}

function _t_val(val) {
  const pre_t = val / 8 + 0.5;
  // Clip to [0, 1]
  return pre_t > 1.0 ? 1.0 : pre_t < 0.0 ? 0.0 : pre_t;
}

function _hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function _parseColorScheme(color_strs, scale=null) {
  const raw_colors = color_strs.split('\n').map(x => x.replace(/\s+/g,'')).filter(x => x !== "");
  if (raw_colors.length < 2) {
    console.error("You need two or more colors specified.");
  }
  if (scale === null) {
    const step = 1 / (raw_colors.length-1);
    scale = [];
    for (var num = 0; num <= 1.0; num += step) {
      scale.push(num);
    }
    if (scale[scale.length-1] !== 1.0) {
      scale[scale.length-1] = 1.0;
    }
  } else if (scale.length !== raw_colors.length) {
    console.error("The scale and colors must have the same number of elements.");
  }
  var colors = {};
  for (var i = 0; i < scale.length; i++) {
    colors[scale[i]] = raw_colors[i];
  }
  return colors;
}

function _getColor(d, agg_info, colname) {
  // This object at least needs to have 0 and 1.0 colors specified
  // Paste colors here
  const color_strs = `
  #ffffcc
  #ffeda0
  #fed976
  #feb24c
  #fd8d3c
  #fc4e2a
  #e31a1c
  #b10026
  `;
  const colors = _parseColorScheme(color_strs);
  /* normalization process 
  const mean = agg_info[colname + '_mean'];
  const std = agg_info[colname + '_std'];
  const normalized = (d[colname] - mean) / std;
  */
  const min = agg_info[colname + '_min'];
  const max = agg_info[colname + '_max'];
  const t = (d[colname] - min) / (max - min);

// /*
  // Get the parametric value
  // const t = _t_val(normalized);
  // Get the corresponding color range
  var color_marks = Object.keys(colors).sort();
  var color_range = [];
  for (var i = 0; i < color_marks.length-1; i++) {
    if ((color_marks[i] <= t) && (t <= color_marks[i+1])) {
      const color1 = _hexToRgb(colors[color_marks[i]]);
      const color2 = _hexToRgb(colors[color_marks[i+1]]);
      color_range.push(color1);
      color_range.push(color2);
      break;
    }
  }
  const color1 = color_range[0];
  const color2 = color_range[1];
  // const red = (color2[0] - color1[0]) * t + color1[0];
  // const green = (color2[1] - color1[1]) * t + color1[1];
  // const blue = (color2[2] - color1[2]) * t + color1[2];
  const red = (color2.r - color1.r) * t + color1.r;
  const green = (color2.g - color1.g) * t + color1.g;
  const blue = (color2.b - color1.b) * t + color1.b;
// */
  const alpha = 255 * (0.8*t + 0.2);
  // const red = 255 / (1 + Math.exp(1.5*normalized));
  // const green = 255;
  // const blue = 3;
  // Sigmoid interpolation for alpha
  // const alpha = 255 / (1 + Math.exp(-1.5*normalized)) + 50;
  return [red, green, blue, alpha];
}

function _getPopulationColor(d, agg_info) {
  const mean = agg_info.population_mean;
  const std = agg_info.population_std;
  const normalized_pop = (d.population - mean) / std;
  // const min = agg_info.population_min;
  // const max = agg_info.population_max;
  // const standardized_pop = (d.population - min) / (max - min);
  const red = 255;
  // const green = 255 / (max - min) * (standardized_pop - min); // Linear interpolation
  // const green = -normalized_pop * 255 / 6 + 127.5; // Linear interpolation
  const green = 255 / (1 + Math.exp(1.5*normalized_pop)); // Sigmoid interpolation
  const blue = 3;
  const alpha = 0.1 * 255 * d.population;
  return [red, green, blue, alpha];
}

function _getDType(str) {
  // return str.replace(/([a-z])([A-Z])/g, '$1 $2').split(" ")[0].toLowerCase();
  return str.split('_')[0].toLowerCase();
}

function _getColName(str) {
  const name = str.split('_')[1]
  return name[0].toLowerCase() + name.slice(1);
}

function _getLayers(settings, getAggInfo, data, onHover) {
  const keys = Object.keys(settings).filter(x => settings[x]);
  const colnames = keys.map(x => x.slice(4));
  const layers = [];
  colnames.map(fullname => {
    const dtype = _getDType(fullname); // hex or chome
    const colname = _getColName(fullname);
    const newData = _loadData(dtype, colname);
    const dataPromise = newData.then(loadedData => {
      const rightData = dtype === "hex" ? data.hex_geoms : data.chome_geoms;
      for (var i = 0; i < rightData.length; i++) {
        rightData[i][colname] = loadedData[i][colname];
      }
      data.agg_info = getAggInfo(rightData, [colname]);
      return rightData;
    });
    const layer = new PolygonLayer({
                    id: fullname,
                    data: dataPromise,
                    pickable: true,
                    stroked: true,
                    filled: true,
                    wireframe: true,
                    autoHighlight: true,
                    lineWidthMinPixels: 1,
                    getPolygon: d => d.polygon,
                    getElevation: 10,
                    getFillColor: d => _getColor(d, data.agg_info, colname),
                    getLineColor: d => _getColor(d, data.agg_info, colname),
                    getLineWidth: 0,
                    onHover,
                    ...settings
                  });
    layers.push(layer);
  });

  //   if (dtype === "hex") {
  //     for (var i = 0; i < hex_geoms.length; i++) {
  //       hex_geoms[i][colname] = loadedData[i][colname];
  //     }
  //   } else if (dtype === "chome") {
  //     for (var i = 0; i < chome_geoms.length; i++) {
  //       chome_geoms[i][colname] = loadedData[i][colname];
  //     }
  //   } else {
  //     console.error("Invalid data type: " + dtype);
  //   }
  //   data.agg_info = getAggInfo(dtype === "hex" ? hex_geoms : chome_geoms, [colname])
  //   layers.push(
  //     new PolygonLayer({
  //       id: fullname,
  //       data: dtype === "hex" ? hex_geoms : chome_geoms,
  //       pickable: true,
  //       stroked: true,
  //       filled: true,
  //       wireframe: true,
  //       autoHighlight: true,
  //       lineWidthMinPixels: 1,
  //       getPolygon: d => d.polygon,
  //       getElevation: 10,
  //       getFillColor: d => _getColor(d, data.agg_info, colname),
  //       getLineColor: d => _getColor(d, data.agg_info, colname),
  //       getLineWidth: 0,
  //       onHover,
  //       ...settings
  //     })
  //   );
  // });
  return layers;
}

export function renderLayers(props) {
  const { data, onHover, settings, getAggInfo } = props;
  const points = data.points;
  const layers = _getLayers(settings, getAggInfo, data, onHover);
  return layers;
  // return [
  //   settings.showScatterplot &&
  //     new ScatterplotLayer({
  //       id: 'scatterplot',
  //       data: points,
  //       getPosition: d => d.position,
  //       getColor: d => (d.pickup ? PICKUP_COLOR : DROPOFF_COLOR),
  //       getRadius: d => 5,
  //       opacity: 0.5,
  //       pickable: true,
  //       radiusMinPixels: 0.25,
  //       radiusMaxPixels: 30,
  //       onHover,
  //       ...settings
  //     }),
  //   settings.showHexagon &&
  //     new HexagonLayer({
  //       id: 'heatmap',
  //       data: points,
  //       colorRange: HEATMAP_COLORS,
  //       elevationRange,
  //       elevationScale: 5,
  //       extruded: false,
  //       getPosition: d => d.position,
  //       lightSettings: LIGHT_SETTINGS,
  //       opacity: 0.8,
  //       pickable: true,
  //       onHover,
  //       ...settings
  //     }),
  //   settings.showHexPopulation && 
  //     new PolygonLayer({
  //       id: 'hex_total_population',
  //       data: hex_geoms,
  //       pickable: true,
  //       stroked: true,
  //       filled: true,
  //       wireframe: true,
  //       autoHighlight: true,
  //       lineWidthMinPixels: 1,
  //       getPolygon: d => d.polygon,
  //       getElevation: 10,
  //       // getFillColor: d => [d.population * 2, 185, 72, 0.7*255],
  //       // getLineColor: d => [d.population * 2, 185, 72, 0.7*255],
  //       getFillColor: d => _getPopulationColor(d, data.agg_info),
  //       getLineColor: d => _getPopulationColor(d, data.agg_info), 
  //       getLineWidth: 0,
  //       onHover,
  //       ...settings
  //     }),
  //   settings.showChomePopulation && 
  //     new PolygonLayer({
  //       id: 'chome_total_population',
  //       data: chome_geoms,
  //       pickable: true,
  //       stroked: true,
  //       filled: true,
  //       wireframe: true,
  //       autoHighlight: true,
  //       lineWidthMinPixels: 1,
  //       getPolygon: d => d.polygon,
  //       getElevation: 10,
  //       // getFillColor: d => [d.population * 2, 185, 72, 0.7*255],
  //       // getLineColor: d => [d.population * 2, 185, 72, 0.7*255],
  //       getFillColor: d => _getPopulationColor(d, data.agg_info),
  //       getLineColor: d => _getPopulationColor(d, data.agg_info),
  //       getLineWidth: 0,
  //       onHover,
  //       ...settings
  //     }),
  //   // settings.showHexNumJobs && 
  //   //   new PolygonLayer({
  //   //     id: 'hex_num_jobs',
  //   //     data: hex_geoms,
  //   //     pickable: true,
  //   //     stroked: true,
  //   //     filled: true,
  //   //     wireframe: true,
  //   //     autoHighlight: true,
  //   //     lineWidthMinPixels: 1,
  //   //     getPolygon: d => d.polygon,
  //   //     getElevation: 10,
  //   //     getFillColor: d => _getColor(d, 'hex', 'numJobs'),
  //   //     getLineColor: d => _getColor(d, 'hex', 'numJobs'),
  //   //     getLineWidth: 0,
  //   //     onHover,
  //   //     ...settings
  //   //   }),
  // ];
  const other_layers = [new PolygonLayer({
    id: 'hex_total_population',
    data: data.hex_geoms,
    pickable: true,
    stroked: true,
    filled: true,
    wireframe: true,
    autoHighlight: true,
    lineWidthMinPixels: 1,
    getPolygon: d => d.polygon,
    getElevation: 10,
    // getFillColor: d => [d.population * 2, 185, 72, 0.7*255],
    // getLineColor: d => [d.population * 2, 185, 72, 0.7*255],
    getFillColor: d => _getPopulationColor(d, data.agg_info),
    getLineColor: d => _getPopulationColor(d, data.agg_info), 
    getLineWidth: 0,
    onHover,
    ...settings
  })];
  console.log(other_layers);
  // return other_layers;
}