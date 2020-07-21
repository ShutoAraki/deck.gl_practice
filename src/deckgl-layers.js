import React from 'react';
import { PolygonLayer } from 'deck.gl';
import DataFrame from 'dataframe-js';
import chroma from 'chroma-js';
import layerConfig from './data/layerConfig.json';
import COLORS from './data/COLORS.json';
import COLOR_SCHEMES from './data/COLOR_SCHEMES.json';
import { legendStyle } from './style';

// Picks the right data from given data type (chome or hex)
// and colname. Then returns a data Promise object that
// eventually returns the casted data
export function loadData(dtype, colname) {
  var data_dir = 'http://127.0.0.1:8081/';
  if (dtype === 'hex') {
    data_dir += 'hex_';
  } else if (dtype === 'chome') {
    data_dir += 'chome_';
  } else {
    console.error("Invalid data type: " + dtype);
  }
  data_dir += colname + '.csv';
  return DataFrame.fromCSV(data_dir).then(df => {
    console.log("Fetching " + data_dir);
    const dataRows = df.toArray();
    const fields = df.listColumns();
    const castedData = dataRows.map(r => r.reduce((prev, curr, i) => {
        const field = fields[i];
        if (!isNaN(Number(curr))) {
          prev[field] = Number(curr);
        }
        return prev;
    }, {}));
    return castedData;
  });
}

function _t_val(val, std_cutoff=4) {
  const pre_t = val / (std_cutoff*2) + 0.5;
  // Clip to [0, 1]
  return pre_t > 1.0 ? 1.0 : pre_t < 0.0 ? 0.0 : pre_t;
}

function _hexToRgb(hex) {
  var result;
  var alpha = 255;
  // It may be some reserverd string
  if (hex[0] !== '#') {
    if (Object.keys(COLORS).includes(hex)) {
      hex = COLORS[hex];
    } else {
      console.error("The hex color string " + hex + " does not exist in COLORS.json.");
    }
  }
  // if alpha channel is included in the string
  if (hex.length === 9) { 
    alpha = Number(hex.slice(hex.length-2)) / 100 * 255;
    const real_hex = hex.slice(0, hex.length-2);
    result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(real_hex);
  } else if (hex.length === 7) {
    result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  } else {
    console.error("Wrong hex color string: " + hex);
  }
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
    a: alpha
  } : null;
}

// Deprecated: You can copy and paste the string from ColorBrewer and make it a JS array
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

function _generateColorDict(layerInfo, min, max) {
  var scale = Object.keys(layerInfo).includes('scale') ? [...layerInfo.scale] : [];
  var layer_colors;
  if ((typeof layerInfo.colors === 'string') && (Object.keys(COLOR_SCHEMES).includes(layerInfo.colors))) {
    layer_colors = [...COLOR_SCHEMES[layerInfo.colors]];
  } else if (typeof layerInfo.colors === 'string') {
    console.error("The color scheme " + layerInfo.colors + " does not exist in COLOR_SCHEMES.json.")
  } else {
    layer_colors = [...layerInfo.colors];
  }
  const color_arr = layerInfo.reverse ? layer_colors.reverse() : layer_colors;
  if (color_arr.length < 2) {
    console.error("You need two or more colors specified.");
  }
  if (scale.length === 0) {
      const step = 1 / (color_arr.length-1);
      for (var num = 0; num <= 1.0; num += step) {
        scale.push(num);
      }
      if (scale[scale.length-1] !== 1.0) {
        scale[scale.length-1] = 1.0;
      }
  } else if (scale.length !== color_arr.length) {
    console.error("The scale and colors must have the same number of elements.");
  } else if (layerInfo.scaleBy === 'value') {
    // For now, replace the first and last items with min and max
    // TODO: Inform the user with some color scheme
    scale[0] = min;
    scale[scale.length-1] = max;
    // Map raw values to percentage
    for (var i = 0; i < scale.length; i++) {
      scale[i] = scale[i] / (max - min) - min / (max - min);
    }
  }
  var colors = {};
  for (var i = 0; i < scale.length; i++) {
    colors[scale[i]] = color_arr[i];
  }
  return colors;
}

function _getColor(d, agg_info, colname, fullname) {
  // If the data is categorical
  if (agg_info[colname + '_str']) {
    // Random color for each category
    const colors = agg_info[colname + '_colors'];
    const hexColor = colors[d[colname]];
    const rgbColor = _hexToRgb(hexColor);
    return [rgbColor.r, rgbColor.g, rgbColor.b, rgbColor.a];
  }
  const layerInfo = Object.keys(layerConfig.layers).includes(fullname) ? layerConfig.layers[fullname] : layerConfig.layers.default;
  const min = agg_info[colname + '_min'];
  const max = agg_info[colname + '_max'];
  const colors = _generateColorDict(layerInfo, min, max)

  var t;
  if (layerInfo.type === 'normalized') {
    const mean = agg_info[colname + '_mean'];
    const std = agg_info[colname + '_std'];
    const normalized = (d[colname] - mean) / std;
    // Get the parametric value
    t = _t_val(normalized);
  } else if (layerInfo.type === 'standardized') {
    t = (d[colname] - min) / (max - min);
  } else {
    console.error("Invalid layer type: " + layerInfo.type + ". Supported types are 'standardized' and 'normalized'");
  }
  // Get the corresponding color range
  const color_marks = Object.keys(colors).sort();
  var color_range = [];
  if (layerInfo.interpolate) {
    for (var i = 0; i < color_marks.length-1; i++) {
      if ((color_marks[i] <= t) && (t <= color_marks[i+1])) {
        // console.log(color_marks[i] + " " + color_marks[i+1]);
        const color1 = _hexToRgb(colors[color_marks[i]]);
        const color2 = _hexToRgb(colors[color_marks[i+1]]);
        color_range.push(color1);
        color_range.push(color2);
        break;
      }
    }
  } else {
    var alt_color_marks = [];
    const step = 1 / color_marks.length;
    var current_val = 0.0;
    for (var i = 0; i <= color_marks.length; i++) {
      alt_color_marks.push(current_val);
      current_val += step;
    }
    // Force the last point to be 1.0
    if (alt_color_marks[alt_color_marks.length-1] !== 1.0) {
      alt_color_marks[alt_color_marks.length-1] = 1.0;
    }
    for (var i = 0; i < alt_color_marks.length-1; i++) {
      if ((alt_color_marks[i] <= t) && (t <= alt_color_marks[i+1])) {
        const theColor = _hexToRgb(colors[color_marks[i]]);
        color_range.push(theColor);
        color_range.push(theColor);
        break;
      }
    }
  }
  
  const color1 = color_range[0];
  const color2 = color_range[1];
  var layer_colors;
  if ((typeof layerInfo.colors === 'string') && (Object.keys(COLOR_SCHEMES).includes(layerInfo.colors))) {
    layer_colors = [...COLOR_SCHEMES[layerInfo.colors]];
  } else if (typeof layerInfo.colors === 'string') {
    console.error("The color scheme " + layerInfo.colors + " does not exist in COLOR_SCHEMES.json.")
  } else {
    layer_colors = [...layerInfo.colors];
  }
  var bez = chroma.scale(layerInfo.reverse ? layer_colors.reverse() : layer_colors);
  const red = layerInfo.interpolate ? bez(t).rgb()[0] : color1.r;
  const green = layerInfo.interpolate ? bez(t).rgb()[1] : color1.g;
  const blue = layerInfo.interpolate ? bez(t).rgb()[2] : color1.b;
  const alpha = layerInfo.interpolate ? (color2.a - color1.a) * t + color1.a : (color1.a + color2.a) / 2;
  return [red, green, blue, alpha];
}

function _getDType(str) {
  // return str.replace(/([a-z])([A-Z])/g, '$1 $2').split(" ")[0].toLowerCase();
  return str.split('_')[0].toLowerCase();
}

function _getColName(str) {
  const name = str.split('_')[1]; // This is why you can't name your column with _
  return name[0].toLowerCase() + name.slice(1);
}

function _getLayers(settings, getAggInfo, data, onHover) {
  const keys = Object.keys(settings).filter(x => settings[x]);
  const colnames = keys.map(x => x.slice(4));
  const layers = [];
  colnames.map(fullname => {
    const dtype = _getDType(fullname); // hex or chome
    const colname = _getColName(fullname);
    const newData = loadData(dtype, colname);
    const dataPromise = newData.then(loadedData => {
      const rightData = data[dtype + "_geoms"];
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
                    getFillColor: d => _getColor(d, data.agg_info, colname, fullname),
                    getLineColor: d => _getColor(d, data.agg_info, colname, fullname),
                    getLineWidth: 0,
                    onHover,
                    ...settings
                  });
    layers.push(layer);
  });

  return layers;
}

export function renderLayers(props) {
  const { data, onHover, settings, getAggInfo } = props;
  const layers = _getLayers(settings, getAggInfo, data, onHover);
  return layers;
}

// Return an object like this
// {
//   "colors": ["#ffffe510", "#f7fcb920", "#d9f0a350", "#addd8e", "#78c679"],
//   "scale": {
//     "#ffffe510": 12.42,
//     "#f7fcb920": 23.32,
//     ...
//   }
// }
function _getColorRange(fullname, colorRange) {
  const col = fullname.slice(4)
  const dtype = _getDType(col); // hex or chome
  const colname = _getColName(col);
  const newData = loadData(dtype, colname);
  return newData.then(loadedData => {
    const data = loadedData.map(x => x[colname]);
    const dataMax = Math.max(...data);
    const dataMin = Math.min(...data);
    const colConfig = layerConfig.layers[col];
    var scaleArray;
    if (colConfig.scaleBy === "value") {
      scaleArray = colConfig.scale;
      scaleArray[0] = dataMin;
      scaleArray[scaleArray.length-1] = dataMax;
      for (var i = 0; i < scaleArray.length; i++) {
        colorRange.scale[colorRange.colors[i]] = scaleArray[i];
      }
    } else {
      scaleArray = [];
    }
    return colorRange;
  });
  
}

function _getSelectedColumn(settings) {
    const cols = Object.keys(settings).filter(x => settings[x]);
    return cols[0];
}

function _getColorScheme(key) {
    // Convert showHex_NumJobs to Hex_NumJobs
    var processedKey = key.slice(4);
    if (!Object.keys(layerConfig.layers).includes(processedKey)) {
        processedKey = "default";
    }
    return {
        colors: layerConfig.layers[processedKey].colors,
    };
}

function _getColorDivStyle(color) {
    const processedColor = color[0] !== '#' ? COLORS[color] : color
    const hexColor = processedColor.slice(0, 7);
    return {
        backgroundColor: hexColor,
        width: 50,
        height: 20,
        margin: 5
    };
}

export function LegendCard({ settings }) {
    // Get one selected column
    const col = _getSelectedColumn(settings);
    if (!col) {
        return <div></div>
    }
    // Get the color scheme
    const scheme = _getColorScheme(col);
    const colors = typeof scheme.colors === 'string' ? COLOR_SCHEMES[scheme.colors] : scheme.colors;
    var colorRange = {"colors": colors, "scale": {}};
    const colorRangePromise = _getColorRange(col, colorRange);
   // Render the colors with the scale
    return (
        <div style={legendStyle}>
        {
          colorRangePromise.then(colorRange => {
            colorRange.colors.map(color => (
              <div style={{height: 30}} key={color}>
                  <div style={_getColorDivStyle(color)}></div>
                  <div>&nbsp;&nbsp;&nbsp;{colorRange.scale[color]}</div>
              </div>
            ))
          })
        }
        </div>
    );
}