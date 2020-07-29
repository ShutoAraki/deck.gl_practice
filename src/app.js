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
import columns from './data/columns.json';
import { renderLayers } from './deckgl-layers';
import HoverCard from './hoverCard';
import Charts from './charts';
import ChartToggler from './ChartToggler';
import LegendCard from './legends';
import { Logo } from './logo';

const INITIAL_VIEW_STATE = {
  longitude: 139.710078,
  latitude: 35.674613,
  zoom: 11,
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
    settings: Object.keys(GEOM_CONTROLS).reduce(
      (accu, key) => ({
        ...accu,
        [key]: GEOM_CONTROLS[key]
      }),
      {}
    ),
    showChart: false,
    style: 'mapbox://styles/shutoaraki/ckd4e23v80yfs1ipci9rl72mf'
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
    const primaryKeys = {
      'hex': 'hexNum',
      'chome': 'addressCode'
    }
    const dtypes = Object.keys(columns);
    dtypes.map(dtype => {
      coreDataPromise(dtype).then(hexCore => {
        const geoms = hexCore.reduce((accu, curr) => {
          if (dtype === "chome") {
            accu.push({
              polygon: curr.geometry.coordinates,
              id: curr[primaryKeys[dtype]],
              addressName: curr.addressName
            });
          } else {
            accu.push({
              polygon: curr.geometry.coordinates,
              id: curr[primaryKeys[dtype]],
            });
          }
          // if (dtype === "chome") {
          //   accu.push({
          //     addressName: curr.addressName,
          //     id: curr.addressCode
          //   });
          // }
          return accu;
        }, []);
        this.setState({
          [dtype + "_geoms"]: geoms,
        });
      }, console.error);
    });
      /*
      coreDataPromise('hex').then(hexCore => {
        const geoms = hexCore.reduce((accu, curr) => {
          accu.push({
            polygon: curr.geometry.coordinates,
            id: curr.hexNum
          });
          return accu;
        }, []);
        this.setState({
          hex_geoms: geoms,
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
      */
      // coreDataPromise('network').then(core => {
      //   const geoms = core.reduce((accu, curr) => {
      //     accu.push({
      //       polygon: curr.geometry.coordinates,
      //       id: curr.networkNum,
      //     });
      //     return accu;
      //   }, []);
      //   this.setState({
      //     network_geoms: geoms
      //   }); 
      // }, console.error);
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
        <LegendCard
          settings={this.state.settings}
        />
        <Logo/>
      </div>
    );
  }
}
