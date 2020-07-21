import React, { Component } from 'react';
import { legendStyle } from './style';
import layerConfig from './data/layerConfig.json';
import COLORS from './data/COLORS.json';
import COLOR_SCHEMES from './data/COLOR_SCHEMES.json';
import { loadData } from './deckgl-layers';

export default class LegendCard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            colors: [],
            scale: {}
        };
    }

    _getSelectedColumn(settings) {
        const cols = Object.keys(settings).filter(x => settings[x]);
        return cols[0];
    }

    _getColorScheme(key) {
        // Convert showHex_NumJobs to Hex_NumJobs
        var processedKey = key.slice(4);
        if (!Object.keys(layerConfig.layers).includes(processedKey)) {
            processedKey = "default";
        }
        const scheme = layerConfig.layers[processedKey].colors;
        var processedScheme = typeof scheme=== 'string' ? COLOR_SCHEMES[scheme] : scheme;
        // if (layerConfig.layers[processedKey].reverse) {
        //     processedScheme = processedScheme.reverse();
        // }
        return processedScheme;
    }

    _getColorDivStyle(color) {
        const processedColor = color[0] !== '#' ? COLORS[color] : color
        const hexColor = processedColor.slice(0, 7);
        return {
            backgroundColor: hexColor,
            width: 50,
            height: 20,
            margin: 5,
            float: "left"
        };
    }

    _getDType(str) {
         // return str.replace(/([a-z])([A-Z])/g, '$1 $2').split(" ")[0].toLowerCase();
         return str.split('_')[0].toLowerCase();
     }
    
    _getColName(str) {
        const name = str.split('_')[1]; // This is why you can't name your column with _
        return name[0].toLowerCase() + name.slice(1);
    }

    _getAutomaticScale() {
        // Automatic scale if scale is not specified in the layerConfig.json
        var scaleArray = [];
        const step = 1 / (this.state.colors.length-1);
        for (var num = 0; num <= 1.0; num += step) {
            scaleArray.push(num);
        }
        if (scaleArray[scaleArray.length-1] !== 1.0) {
            scaleArray[scaleArray.length-1] = 1.0;
        }
        return scaleArray;
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
    _updateScale(fullname, scheme) {
        const col = fullname.slice(4);
        const dtype = this._getDType(col);
        const colname = this._getColName(col);
        const newData = loadData(dtype, colname);
        newData.then(loadedData => {
            this.setState({colors: scheme});
            const data = loadedData.map(x => x[colname]);
            const dataMax = Math.max(...data);
            const dataMin = Math.min(...data);
            const colConfig = layerConfig.layers[col];
            var tempScale = {};
            var scaleArray;
            if (colConfig.scaleBy === "value") {
                scaleArray = colConfig.scale;
                scaleArray[0] = dataMin;
                scaleArray[scaleArray.length-1] = dataMax;
            } else if (colConfig.type === "standardized") {
                // Automatic scale if scale is not specified in the layerConfig.json
                scaleArray = colConfig.scale ? colConfig.scale : this._getAutomaticScale();
                // Get the raw number x from standardized num = (x - min) / (max - min)
                scaleArray = scaleArray.map(num => (
                    (dataMin + num * (dataMax - dataMin)).toFixed(3)
                ));
            } else if (colConfig.type === "normalized") {
                scaleArray = colConfig.scale ? colConfig.scale : this._getAutomaticScale();
                const mean = data.reduce((a, b) => a + b) / data.length;
                const std = Math.sqrt(data.map(d => Math.pow(d-mean, 2)).reduce((a, b) => a + b) / data.length);
                // Assuming std_cutoff=4, get x from num = (x - mean) / std / 8 + 0.5
                scaleArray = scaleArray.map(num => (
                    (4 * std * (2 * num - 1) + mean).toFixed(3)
                ));
            } else {
                console.error("Invalid type: " + colConfig.type);
            }
            for (var i = 0; i < scaleArray.length; i++) {
                tempScale[scheme[i]] = scaleArray[i];
            }
            this.setState({scale: tempScale});
        });
    }

    render() {
        // Get one selected column
        const col = this._getSelectedColumn(this.props.settings);
        if (!col) {
            return <div></div>
        }
        // Set the current state (colors) 
        const scheme = this._getColorScheme(col);
        this._updateScale(col, scheme);
        // Render the colors with the scale
        return (
            <div style={legendStyle}>
            {scheme.map(color => (
                <div style={{height: 30}} key={color}>
                    <div style={this._getColorDivStyle(color)}></div>
                    <div style={{float: "right"}}>&nbsp;&nbsp;&nbsp;{this.state.scale[color]}</div>
                </div>
            ))}
            </div>
        );
    }
}