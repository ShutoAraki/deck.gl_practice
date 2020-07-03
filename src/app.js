/* global window */
import React, { Component } from 'react';
import { StaticMap } from 'react-map-gl';
import {
  LayerControls,
  MapStylePicker,
  GEOM_CONTROLS
} from './controls';
import { tooltipStyle } from './style';
import DeckGL from 'deck.gl';
import hexCorePromise from '../../../data/hexCore';
import { renderLayers } from './deckgl-layers';

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
          population: curr.totalPopulation
        });
        return accu;
      }, []);
      this.setState({
        points: points,
        geometry: geoms
      });
      console.log(geoms.slice(0, 7));
    }, console.error)
  };

  _onHover({ x, y, object }) {
    const label = object ? object.id : null;

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
      return null;
    }
    const { hover, settings } = this.state;
    return (
      <div>
        {hover.hoveredObject && (
          <div
            style={{
              ...tooltipStyle,
              transform: `translate(${hover.x}px, ${hover.y}px)`
            }}
          >
            <div>{hover.label}</div>
          </div>
        )}
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
            settings: this.state.settings
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
