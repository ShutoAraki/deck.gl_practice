import React, { Component } from 'react';
import { mapStylePicker, layerControl } from './style';

export const COLUMNS = {
  hex: ['numJobs',
        'numCompanies',
        'modality',
        'timeToTokyo',
        'timeAndCostToTokyo',
        'crimeTotalRate',
        'crimeFelonyRobberyRate',
        'crimeFelonyOtherRate',
        'crimeViolentWeaponsRate',
        'crimeViolentAssaultRate',
        'crimeViolentInjuryRate',
        'crimeViolentIntimidationRate',
        'crimeViolentExtortionRate',
        'crimeTheftBurglarySafeRate',
        'crimeTheftBurglarySchoolRate',
        'crimeTheftBurglaryBusinessRate',
        'crimeTheftBurglaryStoreRate',
        'crimeTheftBurglaryEmptyHomeRate',
        'crimeTheftBurglaryHomeSleepingRate',
        'crimeTheftBurglaryHomeUnnoticedRate',
        'crimeTheftBurglaryOtherRate',
        'crimeTheftVehicleRate',
        'crimeTheftMotorcycleRate',
        'crimeTheftBicycleRate',
        'crimeTheftVehicleCargoRate',
        'crimeTheftVendingMachineRate',
        'crimeTheftConstructionRate',
        'crimeTheftPickPocketRate',
        'crimeTheftPurseSnatchingRate',
        'crimeTheftBagLiftingRate',
        'crimeTheftShopliftingRate',
        'crimeTheftOtherRate',
        'crimeOtherIntellectualFraudRate',
        'crimeOtherTakingLostPropertyRate',
        'crimeOtherIntellectualTotalRate',
        'crimeOtherMoralIndecencyRate',
        'crimeOtherOtherRate',
        'greenArea',
        'pop_Total_A',
        'pop_0-4yr_A',
        'pop_5-9yr_A',
        'pop_10-14yr_A',
        'pop_15-19yr_A',
        'pop_20-24yr_A',
        'pop_25-29yr_A',
        'pop_30-34yr_A',
        'pop_35-39yr_A',
        'pop_40-44yr_A',
        'pop_45-49yr_A',
        'pop_50-54yr_A',
        'pop_55-59yr_A',
        'pop_60-64yr_A',
        'pop_65-69yr_A',
        'pop_70-74yr_A',
        'pop_75-79yr_A',
        'pop_80-84yr_A',
        'pop_85-89yr_A',
        'pop_90-94yr_A',
        'pop_95-99yr_A',
        'pop_100yr+_A',
        'pop_AgeUnknown_A',
        'pop_AverageAge_A',
        'pop_15yrOrLess_A',
        'pop_15-64yr_A',
        'pop_65yr+_A',
        'pop_75yr+_A',
        'pop_85yr+_A',
        'pop_Foreigner_A',
        'pop_Total_M',
        'pop_0-4yr_M',
        'pop_5-9yr_M',
        'pop_10-14yr_M',
        'pop_15-19yr_M',
        'pop_20-24yr_M',
        'pop_25-29yr_M',
        'pop_30-34yr_M',
        'pop_35-39yr_M',
        'pop_40-44yr_M',
        'pop_45-49yr_M',
        'pop_50-54yr_M',
        'pop_55-59yr_M',
        'pop_60-64yr_M',
        'pop_65-69yr_M',
        'pop_70-74yr_M',
        'pop_75-79yr_M',
        'pop_80-84yr_M',
        'pop_85-89yr_M',
        'pop_90-94yr_M',
        'pop_95-99yr_M',
        'pop_100yr+_M',
        'pop_AgeUnknown_M',
        'pop_AverageAge_M',
        'pop_15yrOrLess_M',
        'pop_15-64yr_M',
        'pop_65yr+_M',
        'pop_75yr+_M',
        'pop_85yr+_M',
        'pop_Foreigner_M',
        'pop_Total_F',
        'pop_0-4yr_F',
        'pop_5-9yr_F',
        'pop_10-14yr_F',
        'pop_15-19yr_F',
        'pop_20-24yr_F',
        'pop_25-29yr_F',
        'pop_30-34yr_F',
        'pop_35-39yr_F',
        'pop_40-44yr_F',
        'pop_45-49yr_F',
        'pop_50-54yr_F',
        'pop_55-59yr_F',
        'pop_60-64yr_F',
        'pop_65-69yr_F',
        'pop_70-74yr_F',
        'pop_75-79yr_F',
        'pop_80-84yr_F',
        'pop_85-89yr_F',
        'pop_90-94yr_F',
        'pop_95-99yr_F',
        'pop_100yr+_F',
        'pop_AgeUnknown_F',
        'pop_AverageAge_F',
        'pop_15yrOrLess_F',
        'pop_15-64yr_F',
        'pop_65yr+_F',
        'pop_75yr+_F',
        'pop_85yr+_F',
        'pop_Foreigner_F',
        'numHouseholds',
        'pop_0-19yr_A',
        'pop_20-69yr_A',
        'pop_70yr+_A',
        'pop_20-29yr_A',
        'pop_20-29yr_M',
        'pop_20-29yr_F',
        'pop_30-44yr_A',
        'pop_30-44yr_M',
        'pop_30-44yr_F',
        'pop_percentForeigners',
        'pop_percentChildren',
        'pop_percentMale',
        'pop_percentFemale',
        'pop_percent30-44yr',
        'noiseMin',
        'noiseMean',
        'noiseMax'],
  chome:
       ['prefCode',
        'cityCode',
        'oazaCode',
        'chomeCode',
        'prefName',
        'districtName',
        'cityName',
        'oazaName',
        'chomeName',
        'perimeter',
        'waterSurface',
        'numHouseholds',
        'pop_Total_A',
        'pop_0-4yr_A',
        'pop_5-9yr_A',
        'pop_10-14yr_A',
        'pop_15-19yr_A',
        'pop_20-24yr_A',
        'pop_25-29yr_A',
        'pop_30-34yr_A',
        'pop_35-39yr_A',
        'pop_40-44yr_A',
        'pop_45-49yr_A',
        'pop_50-54yr_A',
        'pop_55-59yr_A',
        'pop_60-64yr_A',
        'pop_65-69yr_A',
        'pop_70-74yr_A',
        'pop_75-79yr_A',
        'pop_80-84yr_A',
        'pop_85-89yr_A',
        'pop_90-94yr_A',
        'pop_95-99yr_A',
        'pop_100yr+_A',
        'pop_AgeUnknown_A',
        'pop_TotalYears_A',
        'pop_AverageAge_A',
        'pop_15yrOrLess_A',
        'pop_15-64yr_A',
        'pop_65yr+_A',
        'pop_75yr+_A',
        'pop_85yr+_A',
        'pop_Foreigner_A',
        'pop_Total_M',
        'pop_0-4yr_M',
        'pop_5-9yr_M',
        'pop_10-14yr_M',
        'pop_15-19yr_M',
        'pop_20-24yr_M',
        'pop_25-29yr_M',
        'pop_30-34yr_M',
        'pop_35-39yr_M',
        'pop_40-44yr_M',
        'pop_45-49yr_M',
        'pop_50-54yr_M',
        'pop_55-59yr_M',
        'pop_60-64yr_M',
        'pop_65-69yr_M',
        'pop_70-74yr_M',
        'pop_75-79yr_M',
        'pop_80-84yr_M',
        'pop_85-89yr_M',
        'pop_90-94yr_M',
        'pop_95-99yr_M',
        'pop_100yr+_M',
        'pop_AgeUnknown_M',
        'pop_TotalYears_M',
        'pop_AverageAge_M',
        'pop_15yrOrLess_M',
        'pop_15-64yr_M',
        'pop_65yr+_M',
        'pop_75yr+_M',
        'pop_85yr+_M',
        'pop_Foreigner_M',
        'pop_Total_F',
        'pop_0-4yr_F',
        'pop_5-9yr_F',
        'pop_10-14yr_F',
        'pop_15-19yr_F',
        'pop_20-24yr_F',
        'pop_25-29yr_F',
        'pop_30-34yr_F',
        'pop_35-39yr_F',
        'pop_40-44yr_F',
        'pop_45-49yr_F',
        'pop_50-54yr_F',
        'pop_55-59yr_F',
        'pop_60-64yr_F',
        'pop_65-69yr_F',
        'pop_70-74yr_F',
        'pop_75-79yr_F',
        'pop_80-84yr_F',
        'pop_85-89yr_F',
        'pop_90-94yr_F',
        'pop_95-99yr_F',
        'pop_100yr+_F',
        'pop_AgeUnknown_F',
        'pop_TotalYears_F',
        'pop_AverageAge_F',
        'pop_15yrOrLess_F',
        'pop_15-64yr_F',
        'pop_65yr+_F',
        'pop_75yr+_F',
        'pop_85yr+_F',
        'pop_Foreigner_F',
        'pop_0-19yr_A',
        'pop_20-69yr_A',
        'pop_70yr+_A',
        'pop_20-29yr_A',
        'pop_20-29yr_M',
        'pop_20-29yr_F',
        'pop_30-44yr_A',
        'pop_30-44yr_M',
        'pop_30-44yr_F',
        'pop_totalDensity',
        'pop_percentForeigners',
        'pop_percentChildren',
        'pop_percentMale',
        'pop_percentFemale',
        'pop_percent30-44yr',
        'pop_percent70yr+',
        'greenArea',
        'greenAreaPercent',
        'modality',
        'noiseMin',
        'noiseMean',
        'noiseMax']
};

function _generateGEOM_CONTROLS() {
  const GEOM_CONTROLS = {};
  COLUMNS.hex.map(col_name => {
    const styledName = col_name[0].toUpperCase() + col_name.slice(1);
    GEOM_CONTROLS["showHex_" + styledName] = {
      displayName: 'Hex: ' + styledName,
      type: 'boolean',
      value: false
    };
  });
  COLUMNS.chome.map(col_name => {
    const styledName = col_name[0].toUpperCase() + col_name.slice(1);
    GEOM_CONTROLS["showChome_" + styledName] = {
      displayName: 'Chome: ' + styledName,
      type: 'boolean',
      value: false
    };
  });
  return GEOM_CONTROLS;
}

export const GEOM_CONTROLS = _generateGEOM_CONTROLS();
  // showHexPopulation: {
  //   displayName: 'Hex: Total Population',
  //   type: 'boolean',
  //   value: true
  // },
  // showChomePopulation: {
  //   displayName: 'Chome: Total Population',
  //   type: 'boolean',
  //   value: true
  // },
  // showHexGreenArea: {
  //   displayName: 'Hex: Green Area',
  //   type: 'boolean',
  //   value: true
  // },
  // showChomeGreenArea: {
  //   displayName: 'Chome: Green Area',
  //   type: 'boolean',
  //   value: true
  // }
  

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
  _onValueChange(settingName, newValue) {
    const { settings } = this.props;
    // Only update if we have a confirmed change
    if (settings[settingName] !== newValue) {
      // Create a new object so that shallow-equal detects a change
      const newSettings = {
        ...this.props.settings,
        [settingName]: newValue
      };

      this.props.onChange(newSettings);
    }
  }

  render() {
    const { title, settings, propTypes = {} } = this.props;

    return (
      <div className="layer-controls" style={layerControl}>
        {title && <h4>{title}</h4>}
        {Object.keys(settings).map(key => (
          <div key={key}>
            <label>{propTypes[key].displayName}</label>
            <div style={{ display: 'inline-block', float: 'right' }}>
              {settings[key]}
            </div>
            <Setting
              settingName={key}
              value={settings[key]}
              propType={propTypes[key]}
              onChange={this._onValueChange.bind(this)}
            />
          </div>
        ))}
      </div>
    );
  }
}

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

const Checkbox = ({ settingName, value, onChange }) => {
  return (
    <div key={settingName}>
      <div className="input-group">
        <input
          type="checkbox"
          id={settingName}
          checked={value}
          onChange={e => onChange(settingName, e.target.checked)}
        />
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
