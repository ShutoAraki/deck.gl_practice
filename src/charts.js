import React, { Suspense, Fragment } from "react";
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


function _updateChart(dtype, colname, state, numBars=100) {
  /*
  const newData = loadData(dtype, colname);
  return newData.then(loadedData => {
    const data = loadedData.map(x => x[colname]);
    const dataMax = Math.max(...data);
    const dataMin = Math.min(...data);
    const step = (dataMax - dataMin) / numBars;
    var dataList = [];
    for (var i = 0; i < numBars; i++) {
      dataList.push({x0: dataMin + step*i, x: dataMin + step*(i+1), y: 0});
    }
    data.map(d => {
      const barIndex = Math.floor(d / numBars) > 99 ? 99 : Math.floor(d / numBars);
      dataList[barIndex].y += 1;
    });
    return dataList;
  });
  */
  // /*
  const key = dtype + "_geoms";
  const geoms = state[key];
  const data = geoms.map(x => x[colname]);
  const dataMax = Math.max(...data);
  const dataMin = Math.min(...data);
  const step = (dataMax - dataMin) / numBars;
  var dataList = [];
  for (var i = 0; i < numBars; i++) {
    dataList.push({x0: dataMin + step*i, x: dataMin + step*(i+1), y: 0});
  }
  data.map(d => {
    const barIndex = Math.floor(d / numBars) > 99 ? 99 : Math.floor(d / numBars);
    dataList[barIndex].y += 1;
  });
  return dataList;
  // */
}

function _extractTypesColnames(state) {
  try {
    const selected = Object.keys(state.settings).filter(x => state.settings[x])[0];
    const dtype = selected.split('_')[0].slice(4).toLowerCase();
    const colname = selected.split('_')[1][0].toLowerCase() + selected.split('_')[1].slice(1);
    return {"dtype": dtype, "colname": colname};
  } catch(err) {
    return {"dtype": 'hex', "colname": 'population'};
  }
}

export default function Charts({ state }) {
  const info = _extractTypesColnames(state);
  const selectedData = _updateChart(info.dtype, info.colname, state);
  // return selectedData.then(d => {
  //   <Fragment>
  //     <div style={charts}>
  //       <h2>Histogram of {info.colname} ({info.dtype})</h2>
  //       <XYPlot width={500} height={300} stackBy="y">
  //         <VerticalGridLines />
  //         <HorizontalGridLines />
  //         <XAxis />
  //         <YAxis />
  //         <Suspense fallback={<div>Loading...</div>}>
  //           <VerticalRectSeries
  //             data={d}
  //           />
  //         </Suspense>
  //       </XYPlot>
  //     </div>
  //   </Fragment>
  // });
  return (
    <div style={charts}>
      <h2>Histogram of {info.colname} ({info.dtype})</h2>
      <XYPlot width={500} height={300} stackBy="y">
        <VerticalGridLines />
        <HorizontalGridLines />
        <XAxis />
        <YAxis />
        <VerticalRectSeries
          data={selectedData}
        />
      </XYPlot>
    </div>
  );
}