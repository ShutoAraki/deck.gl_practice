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
                  transform: `translate(${hover.x}px, ${hover.y}px)`
              }}>
              {keys.map(key => (
                  <div key={key + obj[key]}>{key}: {obj[key]}</div> 
              ))} 
            </div>
        );
    }
}