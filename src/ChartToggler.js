import React from "react";
import { chartToggler } from "./style";

export default function ChartToggler({ toggleChart }) {
    return (
        <button style={chartToggler} onClick={toggleChart}>Data Distribution</button>
    );
}