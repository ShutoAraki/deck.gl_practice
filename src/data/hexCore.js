import DataFrame from 'dataframe-js';
import {WKTLoader} from '@loaders.gl/wkt';
import {parseSync} from '@loaders.gl/core';

// const data_dir = 'http://127.0.0.1:8081/hexCore-test.csv'
const data_dir = 'http://127.0.0.1:8081/core-hex.csv'
export default DataFrame.fromCSV(data_dir).then(df => {
    df = df.filter(row => row.get('in23Wards') === "True");
    const dataRows = df.toArray();
    const fields = df.listColumns();
    const format = {
        hexNum: Number,
        geometry: String,
        lat: Number,
        lon: Number,
        in23Wards: Boolean,
        inTokyoMain: Boolean,
        totalPopulation: Number
    };
    return dataRows.map(r => r.reduce((prev, curr, i) => {
        const field = fields[i];
        prev[field] = format[field](curr);
        if (field === "geometry") {
            prev[field] = parseSync(format[field](curr), WKTLoader);
            if (i % 100 == 0) {
                console.log(prev[field]);
            }
        }
        return prev;
    }, {}));
});

// console.log(state);
// export default state;