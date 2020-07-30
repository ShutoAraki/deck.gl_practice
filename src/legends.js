import React, { Component } from 'react';
import { legendStyle } from './style';
import layerConfig from './data/layerConfig.json';
import COLORS from './data/COLORS.json';
import COLOR_SCHEMES from './data/COLOR_SCHEMES.json';
import { loadData } from './deckgl-layers';
import _ from "lodash";

export default class LegendCard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedColumn: null,
            colors: [],
            scale: {},
        };
   }

    componentDidUpdate(prevProps) {
        const currCol = this._getSelectedColumn(this.props.settings);
        const prevCol = this._getSelectedColumn(prevProps.settings);
        if (prevCol !== currCol) {
            this.setState({selectedColumn: currCol});
            if (currCol) {
                this._updateScale(currCol);
            }
        }
    }

    _getSelectedColumn(settings) {
        const cols = Object.keys(settings).filter(x => settings[x].value);
        return cols[0];
    }

    _getColorScheme(currCol) {
        // Convert showHex_NumJobs to Hex_NumJobs
        // var processedKey = this.state.selectedColumn.slice(4);
        var processedKey = currCol.slice(4);
        const colConfig = this._getColConfig(processedKey);
        const scheme = colConfig.colors;
        var processedScheme = typeof scheme === 'string' ? _.cloneDeep(COLOR_SCHEMES[scheme]) : _.cloneDeep(scheme);
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
        const str_arr = str.split('_');
        const name = str_arr.slice(1, str_arr.length).join('_');
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

    _getColConfig(col) {
        var key;
        if (Object.keys(layerConfig.layers).includes(col)) {
            key = col;
        } else {
            key = "default";
        }
        return {...layerConfig.layers[key]};
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
    _updateScale(currCol) {
        const scheme = this._getColorScheme(currCol);
        // const col = this.state.selectedColumn.slice(4);
        const col = currCol.slice(4);
        const dtype = this._getDType(col);
        const colname = this._getColName(col);
        const newData = loadData(dtype, colname);
        newData.then(loadedData => {
            const data = loadedData.map(x => x[colname]);
            const dataMax = Math.max(...data);
            const dataMin = Math.min(...data);
            const colConfig = this._getColConfig(col);
            this.setState({colors: scheme.reverse()});
            var tempScale = {}; // hex color -> scale num mapping
            var scaleArray;
            if (colConfig.scaleBy === "value") {
                scaleArray = colConfig.scale;
                scaleArray[0] = dataMin.toFixed(3);
                scaleArray[scaleArray.length-1] = dataMax.toFixed(3);
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
            const N = scaleArray.length;
            for (var i = 0; i < N; i++) {
                if (colConfig.reverse) {
                    tempScale[scheme[i]] = scaleArray[i];
                } else {
                    tempScale[scheme[i]] = scaleArray[N-i-1];
                }
            }
            console.log(tempScale);
            this.setState({scale: tempScale});
        });
    }

    render() {
        // Get one selected column
        // const col = this._getSelectedColumn(this.props.settings);
        const currCol = this.state.selectedColumn;
        if (!currCol) {
            return <div></div>
        }
        // Get the current colors and send it to promise to set the colors state asynchronously
        // const scheme = this._getColorScheme(currCol);
        const scheme = this.state.colors;
        // Render the colors with the scale
        return (
            <div style={legendStyle}>
            <div>{this.state.selectedColumn.split('_').slice(1).join('_')}</div>
            {scheme.map(color => (
                <div style={{height: 30}} key={color}>
                    <div style={this._getColorDivStyle(color)}></div>
                    <div style={{float: "right", margin: "4.5px"}}>&nbsp;&nbsp;&nbsp;{this.state.scale[color]}</div>
                </div>
            ))}
            </div>
        );
    }
}