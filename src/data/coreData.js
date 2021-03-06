import DataFrame from 'dataframe-js';
import {WKTLoader} from '@loaders.gl/wkt';
import {parseSync} from '@loaders.gl/core';

// const data_dir = 'http://127.0.0.1:8081/hexCore-test.csv'

export default function coreDataPromise(dtype) {
    const data_dir = 'http://127.0.0.1:8081/core-' + dtype.toLowerCase() + '.csv';
    return DataFrame.fromCSV(data_dir).then(df => {
        // df = df.filter(row => row.get('in23Wards') === "True");
        const dataRows = df.toArray();
        const fields = df.listColumns();
        const format = {
            geometry: String,
            hexNum: Number,
            addressCode: String,
            addressName: String,
            edgeNum: Number
        };
        return dataRows.map(r => r.reduce((prev, curr, i) => {
            const field = fields[i];
            try {
                prev[field] = format[field](curr);
            } catch(err) {
                prev[field] = Number(curr);
                if (isNaN(prev[field])) {
                    prev[field] = String(curr);
                }
            }
            if (field === "geometry") {
                prev[field] = parseSync(format[field](curr), WKTLoader);
            }
            return prev;
        }, {}));
    }); 
};