import React, { Component } from 'react';
import { mapStylePicker, layerControl, dtypeSelector} from './style';
import COLUMNS from './data/columns.json';

function _generateGEOM_CONTROLS() {
  const GEOM_CONTROLS = {};
  Object.keys(COLUMNS).map(dtype => {
    COLUMNS[dtype].map(col_info => {
      const col_name = col_info.split('_')[0];
      const topic_name = col_info.split('_')[1];
      const styledType = dtype[0].toUpperCase() + dtype.slice(1);
      const styledName = col_name[0].toUpperCase() + col_name.slice(1);
      GEOM_CONTROLS["show" + styledType + "_" + styledName] = {
        displayName: styledType + ':' + styledName,
        type: dtype,
        topic: typeof topic_name === "undefined" ? "default" : topic_name,
        value: false
      };
    });
  });
  return GEOM_CONTROLS;
}

export const GEOM_CONTROLS = _generateGEOM_CONTROLS();

export const HEXAGON_CONTROLS = {
  showHexagon: {
    displayName: 'Show Hexagon',
    type: 'boolean',
    value: true
  },
  radius: {
    displayName: 'Hexagon Radius',
    type: 'range',
    value: 144.5,
    step: 1,
    min: 140,
    max: 160 
  },
  coverage: {
    displayName: 'Hexagon Coverage',
    type: 'range',
    value: 1,
    step: 0.1,
    min: 0,
    max: 1
  },
  upperPercentile: {
    displayName: 'Hexagon Upper Percentile',
    type: 'range',
    value: 100,
    step: 0.1,
    min: 80,
    max: 100
  },
  showScatterplot: {
    displayName: 'Show Scatterplot',
    type: 'boolean',
    value: true
  },
  radiusScale: {
    displayName: 'Scatterplot Radius',
    type: 'range',
    value: 30,
    step: 10,
    min: 10,
    max: 200
  }
};

export const SCATTERPLOT_CONTROLS = {
  showScatterplot: {
    displayName: 'Show Scatterplot',
    type: 'boolean',
    value: true
  },
  radiusScale: {
    displayName: 'Scatterplot Radius',
    type: 'range',
    value: 15,
    step: 10,
    min: 5,
    max: 60
  }
};

const MAPBOX_DEFAULT_MAPSTYLES = [
  { label: 'Streets V10', value: 'mapbox://styles/mapbox/streets-v10' },
  { label: 'Outdoors V10', value: 'mapbox://styles/mapbox/outdoors-v10' },
  { label: 'Light V9', value: 'mapbox://styles/mapbox/light-v9' },
  { label: 'Dark V9', value: 'mapbox://styles/mapbox/dark-v9' },
  { label: 'Satellite V9', value: 'mapbox://styles/mapbox/satellite-v9' },
  {
    label: 'Satellite Streets V10',
    value: 'mapbox://styles/mapbox/satellite-streets-v10'
  },
  {
    label: 'Navigation Preview Day V4',
    value: 'mapbox://styles/mapbox/navigation-preview-day-v4'
  },
  {
    label: 'Navitation Preview Night V4',
    value: 'mapbox://styles/mapbox/navigation-preview-night-v4'
  },
  {
    label: 'Navigation Guidance Day V4',
    value: 'mapbox://styles/mapbox/navigation-guidance-day-v4'
  },
  {
    label: 'Navigation Guidance Night V4',
    value: 'mapbox://styles/mapbox/navigation-guidance-night-v4'
  },
  {
    label: "Shuto's Classic",
    value: 'mapbox://styles/shutoaraki/ckaxlks630p1s1ilbdw4i26no'
  }
];

export function MapStylePicker({ currentStyle, onStyleChange }) {
  return (
    <select
      className="map-style-picker"
      style={mapStylePicker}
      value={currentStyle}
      onChange={e => onStyleChange(e.target.value)}
    >
      {MAPBOX_DEFAULT_MAPSTYLES.map(style => (
        <option key={style.value} value={style.value}>
          {style.label}
        </option>
      ))}
    </select>
  );
}

export class LayerControls extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedTopics: [],
      selectedType: null,
    }
  }

  _onValueChange(settingName, newValue) {
    const { settings } = this.props;

    // Only update if we have a confirmed change
    if (settings[settingName].value !== newValue) {
      // Create a new object so that shallow-equal detects a change
      const newSettings = {
        ...this.props.settings,
        [settingName]: {
          ...settings[settingName],
          value: newValue
        }
      };
      this.props.onChange(newSettings);

      // Update the selectedTopics
      const topics = Object.keys(newSettings)
                           .filter(x => newSettings[x].value)
                           .map(x => newSettings[x].topic);
      this.setState({selectedTopics: topics});
    }
  }

  // Given the settings object like this
  // {
  //   "showChome_NoiseMean":
  //     {
  //       "displayName": "Chome: NoiseMean",
  //       "type":"chome",
  //       "topic":"Environment",
  //       "value":false
  //     }
  // }
  // Return the following (topicName: an array of displayNames)
  // {
  //   "Environment": ["Chome: NoiseMean", "Hex: GreenArea"],
  //   "Crime": ["Hex: TotalCrimeRate"]
  // }
  _groupByTopic(settings) {
    var result = {};
    Object.keys(settings).map(key => {
      const topic = settings[key].topic;
      const name = settings[key].displayName;
      if (Object.keys(result).includes(topic)) {
        result[topic].push(name);
      } else {
        result[topic] = [name];
      }
    });
    return result;
  }

  _accordionButtonStyle(topic) {
    if (this.state.selectedTopics.includes(topic)) {
      return {
        color: 'white',
        fontWeight: 'bold'
      };
    } else {
      return {
        color: '#D3D3D3'
      };
    }
  }

  _getDtypes(settings) {
    const dtypes = Object.keys(settings).map(x => settings[x].type);
    return [... new Set(dtypes)];
  }

  removeA(arr) {
    var what, a = arguments, L = a.length, ax;
    while (L > 1 && arr.length) {
        what = a[--L];
        while ((ax= arr.indexOf(what)) !== -1) {
            arr.splice(ax, 1);
        }
    }
    return arr;
  }

  _toggleTopicSelection(topic) {
    const colsSelected = Object.keys(this.props.settings)
                               .filter(x => this.props.settings[x].value)
                               .filter(x => this.props.settings[x].topic === topic);
    // Remove only if no checkbox is selected
    if (this.state.selectedTopics.includes(topic) && colsSelected.length === 0) {
      const removedArray = this.removeA(this.state.selectedTopics, topic);
      this.setState({selectedTopics: removedArray});
    } else if (colsSelected.length !== 0) {
      this.setState(prevState => ({
        selectedTopics: [...prevState.selectedTopics, topic]
      }));
    }
  }

  _selectType(type) {
    this.setState({selectedType: type});
  }

  render() {
    const { settings, propTypes = {} } = this.props;
    const topics = this._groupByTopic(settings);
    const dtypes = this._getDtypes(settings);
    console.log(topics);
    return (
      <div>
        <DtypeSelector
          dtypes={dtypes}
          currentType={this.state.selectedType}
          selectType={this._selectType.bind(this)}
        />
        <div className="layer-controls" style={layerControl} id="accordion">
          {Object.keys(topics)
                 .filter(x => topics[x].reduce((prev, curr) => prev || curr.toLowerCase().includes(this.state.selectedType), false))
                 .map(topic => (
            <div key={topic}>
              <button
                style={this._accordionButtonStyle(topic)}
                className="btn dropdown-toggle"
                data-toggle="collapse"
                data-target={"#collapse" + topic}
                aria-expanded="true"
                aria-controls={"collapse" + topic}
                onClick={() => this._toggleTopicSelection(topic)}
              >
                  {topic}
              </button>
              <div id={"collapse" + topic} className="collapse" aria-labelledby={"heading" + topic} data-parent="#accordion">
                {Object.keys(settings)
                       .filter(x => settings[x].topic === topic)
                       .filter(x => settings[x].type === this.state.selectedType)
                       .map(key => (
                  <div key={key}>
                    {/* <label style={{float: 'right'}}>{propTypes[key].displayName}</label> */}
                    <Checkbox
                      settingName={key}
                      value={settings[key].value}
                      topic={settings[key].topic}
                      propType={propTypes[key]}
                      onChange={this._onValueChange.bind(this)}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
}

const DtypeSelector = ({ dtypes, currentType, selectType }) => {
  return (
    <div style={dtypeSelector} className="btn-group dropleft">
      <button style={{color: 'white', height: 40}} className="btn dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
        {currentType ? currentType : "Select Dtype"}
      </button>
      <div className="dropdown-menu">
        {dtypes.map(dtype => (
          <a className="dropdown-item" key={dtype} onClick={() => selectType(dtype)}>{dtype}</a>
        ))}
      </div>
    </div>
  );
};

const Setting = props => {
  const { propType } = props;
  if (propType && propType.type) {
    switch (propType.type) {
      case 'range':
        return <Slider {...props} />;
      case 'boolean':
        return <Checkbox {...props} />;
      default:
        return <input {...props} />;
    }
  }
};

const Checkbox = ({ settingName, value, onChange, propType }) => {
  return (
    <div key={settingName}>
      <div className="custom-control custom-switch" style={{alignContent: 'center', alignItems: 'center'}}>
        <input
          type="checkbox"
          className="custom-control-input"
          id={settingName}
          checked={value}
          onChange={e => onChange(settingName, e.target.checked)}
        />
        <label className="custom-control-label" htmlFor={settingName} style={{margin: '5px'}}>{propType.displayName.split(':')[1]}</label>
      </div>
    </div>
  );
};

const Slider = ({ settingName, value, propType, onChange }) => {
  const { max = 100 } = propType;

  return (
    <div key={settingName}>
      <div className="input-group">
        <div>
          <input
            type="range"
            id={settingName}
            min={0}
            max={max}
            step={max / 100}
            value={value}
            onChange={e => onChange(settingName, Number(e.target.value))}
          />
        </div>
      </div>
    </div>
  );
};