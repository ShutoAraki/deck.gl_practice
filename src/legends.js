import React, { Component } from 'react';
import { legendStyle } from './style';
import layerConfig from './data/layerConfig.json';
import COLORS from './data/COLORS.json';
import COLOR_SCHEMES from './data/COLOR_SCHEMES.json';

export default class LegendCard extends Component {
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
        return {
            colors: layerConfig.layers[processedKey].colors,
        };
   }

   _getColorDivStyle(color) {
       const processedColor = color[0] !== '#' ? COLORS[color] : color
       const hexColor = processedColor.slice(0, 7);
       return {
           backgroundColor: hexColor,
           width: 50,
           height: 20,
           margin: 5
       };
   }

    render() {
        // Get one selected column
        const col = this._getSelectedColumn(this.props.settings);
        if (!col) {
            return <div></div>
        }
        // Get the color scheme
        const scheme = this._getColorScheme(col);
        const colors = typeof scheme.colors === 'string' ? COLOR_SCHEMES[scheme.colors] : scheme.colors;
        // Render the colors with the scale
        return (
            <div style={legendStyle}>
            {colors.map(color => (
                <div style={{height: 30}} key={color}>
                    <div style={this._getColorDivStyle(color)}></div>&nbsp;&nbsp;&nbsp;
                    <div></div>
                </div>
            ))}
            {/* {scheme.colors[0]} */}
            </div>
        );
    }
}