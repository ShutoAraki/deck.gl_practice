import React, { Component } from "react";
import { charts } from "./style";
import { loadData } from './deckgl-layers';

import { 
  XAxis,
  XYPlot,
  YAxis,
  VerticalGridLines,
  HorizontalGridLines,
  VerticalRectSeries
} from "react-vis";

export default class Charts extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedData: null
    };
  }

  componentDidUpdate(prevProps) {
    if (this.props.state.settings != prevProps.state.settings) {
      const info = this._extractTypesColnames(this.props.state);
      if (info) {
        this._updateChart(info.dtype, info.colname);
      }
    }
  }

  _extractTypesColnames(state) {
    try {
      // e.g., showHex_Total_pop_A
      const selected = Object.keys(state.settings).filter(x => state.settings[x].value)[0];
      const str_arr = selected.split('_');
      const dtype = str_arr[0].slice(4).toLowerCase();
      const name = str_arr.slice(1, str_arr.length).join('_');
      const colname = name[0].toLowerCase() + name.slice(1);
      // const colname = selected.split('_')[1][0].toLowerCase() + selected.split('_')[1].slice(1);
      return {"dtype": dtype, "colname": colname};
    } catch(err) {
      // return {"dtype": 'hex', "colname": 'numJobs'};
      return null;
    }
  }

  _updateChart(dtype, colname, numBars=100) {
    const newData = loadData(dtype, colname);
    return newData.then(loadedData => {
      const data = loadedData.map(x => x[colname]);
      const dataMax = Math.max(...data);
      const dataMin = Math.min(...data);
      const step = (dataMax - dataMin) / numBars;
      // var steps = [0];
      // const r = 5;
      // for (var i = 0; i < numBars; i++) {
      //   steps.push((dataMax - dataMin) / (Math.pow(r, numBars) - 1) * (r - 1) * Math.pow(r, i));
      // }
      // var dataList = [];
      // for (var i = 0; i < numBars; i++) {
      //   dataList.push({x0: dataMin + steps[i], x: dataMin + steps[i + 1], y: 0});
      // }
      const epsilon = 1;
      var dataList = [];
      for (var i = 0; i < numBars; i++) {
        dataList.push({x0: dataMin + step*i, x: dataMin + step*(i+1), y: epsilon});
      }
      data.map(d => {
        const barIndex = Math.floor(d / numBars) > numBars-1 ? numBars-1 : Math.floor(d / numBars);
        // if (barIndex === 0) {
        //   dataList[barIndex].y += 1;
        // } else {
        //   dataList[barIndex].y += 10;
        // }
        // dataList[barIndex].y += barIndex + 1;
        dataList[barIndex].y += 1;
      });
      dataList = dataList.map(d => {
        return {
          x0: d.x0,
          x: d.x,
          y: Math.log(d.y)
        };
      });
      this.setState({selectedData: dataList});
    });
  }

  render () {
    const info = this._extractTypesColnames(this.props.state);
    if (!this.props.state.showChart || !info) {
      return <div></div>
    }
    // this._updateChart(info.dtype, info.colname);
    return (
      <div style={charts}>
        <h2>Histogram of {info.colname} ({info.dtype})</h2>
        <XYPlot width={500} height={300} stackBy="y">
          <VerticalGridLines />
          <HorizontalGridLines />
          <XAxis />
          <YAxis />
          <VerticalRectSeries
            data={this.state.selectedData}
          />
        </XYPlot>
      </div>
    );
  }
}