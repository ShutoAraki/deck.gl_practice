import React, { Component } from 'react';
import { tooltipStyle } from './style';

export default class HoverCard extends Component {

    render() {
        const hover = this.props.hover;
        const obj = hover.hoveredObject;
        if (!hover.hoveredObject) {
            return <div></div>;
        }
        const keys = Object.keys(obj).filter(k => k !== 'polygon');
        var type = 'chome';
        if ('hexNum' in obj) {
            type = 'hex';
        }
        return (
            <div
              style={{
                  ...tooltipStyle,
                  transform: `translate(${hover.x + 30}px, ${hover.y + 30}px)`
              }}>
              {keys.map(key => (
                  <div key={key + obj[key]}>
                    <div style={{float: "left"}}>{key}</div>:&nbsp;&nbsp;&nbsp;<div style={{float: "right"}}>
                        {typeof obj[key] === "number" ? obj[key].toFixed(3) : obj[key]}
                    </div>
                  </div> 
              ))} 
            </div>
        );
    }
}