/* global window */
import React, { Component } from 'react';
import { StaticMap } from 'react-map-gl';
import {
  LayerControls,
  MapStylePicker,
  GEOM_CONTROLS
} from './controls';
import DeckGL from 'deck.gl';
// import hexCorePromise from './data/hexCore';
// import chomeCorePromise from './data/chomeCore';
import coreDataPromise from './data/coreData';
import { renderLayers } from './deckgl-layers';
import HoverCard from './hoverCard';
import Charts from './charts';
import ChartToggler from './ChartToggler';

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
    showChart: true,
    style: 'mapbox://styles/shutoaraki/ckaxlks630p1s1ilbdw4i26no'
  };

  constructor(props) {
    super(props);
    this._toggleChart = this._toggleChart.bind(this);
  }

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
      coreDataPromise('hex').then(hexCore => {
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
      coreDataPromise('chome').then(core => {
        const geoms = core.reduce((accu, curr) => {
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
  }

  // Basic info on hover
  _onHover({ x, y, object }) {
    var label;
    try {
      label = object.id;
      if ('population' in object) {
        label += '\nPopulation: ' + object.population.toFixed(2) + '\n';
        label += 'addressName' + object.addressName;
      }
      this.setState({ hover: { x, y, hoveredObject: object, label } });
    } catch(err) {
      // Hover over some non-objects will result in null hoveredObject
      this.setState({ hover: { x, y, hoveredObject: null} });
    }
  }

  onStyleChange = style => {
    this.setState({ style });
  }

  _updateLayerSettings(settings) {
    this.setState({ settings });
  }

  _toggleChart() {
    if (this.state.showChart) {
      this.setState({showChart: false});
    } else {
      this.setState({showChart: true});
    }
  }

  render() {
    if (!this.state.points.length) {
      console.log("Data is empty!");
      return null;
    }
    return (
      <div>
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
        <ChartToggler toggleChart={this._toggleChart} />
        <Charts state={this.state} />
      </div>
    );
  }
}
