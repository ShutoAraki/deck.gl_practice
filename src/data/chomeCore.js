import DataFrame from 'dataframe-js';
import {WKTLoader} from '@loaders.gl/wkt';
import {parseSync} from '@loaders.gl/core';

const data_dir = 'http://127.0.0.1:8081/core-chome.csv'

export default DataFrame.fromCSV(data_dir).then(df => {
    // df = df.filter(r => r.get('lowestLevel') === "True");
    // df = df.filter(row => (row.get('in23Wards') === "True") && (row.get('lowestLevel') === "True"));
    const dataRows = df.toArray();
    const fields = df.listColumns();
    const format = {
        addressCode: String,
        addressName: String, 
        geometry: String, 
        lat: Number, 
        lon: Number, 
        lowestLevel: Number,
        adminLevel: Number,
        in23Wards: Boolean,
        inTokyoMain: Boolean,
        totalPopulation: Number,
        landArea: Number
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