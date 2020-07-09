/* global window */
import React, { Component } from 'react';
import { StaticMap } from 'react-map-gl';
import {
  LayerControls,
  MapStylePicker,
  GEOM_CONTROLS
} from './controls';
import DeckGL from 'deck.gl';
import hexCorePromise from '../../../data/hexCore';
import chomeCorePromise from '../../../data/chomeCore';
import { renderLayers } from './deckgl-layers';
import HoverCard from './hoverCard';

const INITIAL_VIEW_STATE = {
  longitude: 139.59663852303368,
  latitude: 35.667929997207324,
  zoom: 9,
  minZoom: 5,
  maxZoom: 16,
  pitch: 0,
  bearing: 0
};

export default class App extends Component {
  state = {
    hover: {
      x: 0,
      y: 0,
      hoveredObject: null
    },
    points: [],
    settings: Object.keys(GEOM_CONTROLS).reduce(
      (accu, key) => ({
        ...accu,
        [key]: GEOM_CONTROLS[key].value
      }),
      {}
    ),
    style: 'mapbox://styles/shutoaraki/ckaxlks630p1s1ilbdw4i26no'
  };

  componentDidMount() {
    this._processData();
  }
  
  // Returns the aggregate information
  // for color configuration purpose
  // geoms is a dict of all the data
  // vars is a list of variables of interest
  getAggInfo(geoms, vars) {
    const ans = {};
    vars.map(varname => {
      const data = geoms.map(d => d[varname]);
      if (typeof data[0] === "string") {
        // Categorical data
        ans[varname + '_str'] = true;
        var counts = {};
        for (var i = 0; i < data.length; i++) {
          counts[data[i]] = 1 + (counts[data[i]] || 0);
        }
        // Generate random colors and overwrite counts
        for (var key of Object.keys(counts)) {
          counts[key] = "#" + Math.floor(Math.random()*16777215).toString(16) + "90";
        }
        ans[varname + '_colors'] = counts;
      } else {
        // Numerical data
        ans[varname + '_str'] = false;
        const mean = data.reduce((a, b) => a + b) / data.length;
        const std = Math.sqrt(data.map(d => Math.pow(d-mean, 2)).reduce((a, b) => a + b) / data.length);
        const min = Math.min(...data);
        const max = Math.max(...data);
        ans[varname + '_mean'] = mean;
        ans[varname + '_std'] = std;
        ans[varname + '_min'] = min;
        ans[varname + '_max'] = max;
      }
    });
    return ans;
  }

  // Loads the core data (geometries and primary keys)
  _processData = () => {

    hexCorePromise.then(hexCore => {
      const points = hexCore.reduce((accu, curr) => {
        accu.push({
          position: [Number(curr.lon), Number(curr.lat)],
          id: Number(curr.hexNum)
        });
        return accu;
      }, []);
      const geoms = hexCore.reduce((accu, curr) => {
        accu.push({
          polygon: curr.geometry.coordinates,
          population: curr.totalPopulation,
          id: curr.hexNum
        });
        return accu;
      }, []);
      this.setState({
        points: points,
        hex_geoms: geoms,
        agg_info: this.getAggInfo(geoms, ['population'])
      });
    }, console.error);

    chomeCorePromise.then(chomeCore => {
      const geoms = chomeCore.reduce((accu, curr) => {
        accu.push({
          polygon: curr.geometry.coordinates,
          population: curr.totalPopulation,
          addressName: curr.addressName,
          id: curr.addressCode,
        });
        return accu;
      }, []);
      this.setState({
        chome_geoms: geoms
      });
    }, console.error);
  };

  // Basic info on hover
  _onHover({ x, y, object }) {
    var label = object.id ? object.id : null;
    if ('population' in object) {
      label += '\nPopulation: ' + object.population.toFixed(2) + '\n';
      label += 'addressName' + object.addressName;
    }
    this.setState({ hover: { x, y, hoveredObject: object, label } });
  }

  onStyleChange = style => {
    this.setState({ style });
  };

  _updateLayerSettings(settings) {
    this.setState({ settings });
  }

  render() {
    if (!this.state.points.length) {
      console.log("Data is empty!");
      return null;
    }
    return (
      <div>
        {/* {hover.hoveredObject && (
          <div
            style={{
              ...tooltipStyle,
              transform: `translate(${hover.x}px, ${hover.y}px)`
            }}
          >
            <div>{hover.label}</div>
          </div>
        )} */}
        <HoverCard
          hover={this.state.hover}
        /> 
        <MapStylePicker
          onStyleChange={this.onStyleChange}
          currentStyle={this.state.style}
        />
        <LayerControls
          settings={this.state.settings}
          propTypes={GEOM_CONTROLS}
          onChange={settings => this._updateLayerSettings(settings)}
        />
        <DeckGL 
          layers={renderLayers({
            data: this.state,
            onHover: hover => this._onHover(hover),
            settings: this.state.settings,
            getAggInfo: this.getAggInfo
          })}
          initialViewState={INITIAL_VIEW_STATE}
          controller
        >
          <StaticMap mapStyle={this.state.style} />
        </DeckGL>
      </div>
    );
  }
}
