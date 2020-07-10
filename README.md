# Best Basho Visualizer v0.01

@author: [Shuto Araki](https://github.com/ShutoAraki)

![](docs/img/timeToTokyoInterpolated.png)

This tool semi-automates the geospatial data exploration process using Mapbox and deck.gl.

You can pick the data you would like to visualize and this tool immediately fetches the right data and adjust layer schemes to render it in front of you!

## Getting Started
### 1. Install dependencies
```
npm install
yarn add @loaders.gl/core
yarn add @loaders.gl/wkt
```

### 2. Set up the data folder server
Install `http-server` by following the instructions [here](https://www.npmjs.com/package/http-server). (It is most likely just this command: `npm install --global http-server`.)

Once you install the package, run the following command. Substitute `[YOUR_DATA_FOLDER]` with the path to your data folder.
```
http-server --cors -p 8081 [YOUR_DATA_FOLDER]
```
This command opens the port 8081 and allow other processes to access the csv files.

#### Data format requirements

- The folder needs to contain `hexData-Core.csv` and `chomeData-Core.csv` where geometry files are stored in [`wkt`](https://en.wikipedia.org/wiki/Well-known_text_representation_of_geometry) format. These will be loaded at the beginning and additional columns will be appended.

- All the other csv files need to be splitted into multiple csv files so that each one contains only one column data.

- Each column corresponds to each layer (as long as you specify correct column names in `src/CHANGEME.js`)

- Do not use `_` in any of the column/file names. An underbar `_` is used as the separator between data type (`hex` or `chome`) and column names internally.

### 3. Start the application
```
npm start
```
It should now be running at [`http://localhost:8080/`](http://localhost:8080/).

### 4. Customize layers and data
The `src/CHANGEME.js` file contains all the customizeable configurations in this system.

#### Edit data columns
Edit `COLUMNS` object to add more columns to visualize. Do not forget to add its format in `data_format` object too. Categorical data is usually of type **[`String`][42]** and numerical data is **[`Number`][44]**

#### Edit layer configurations
Edit `layerConfig` object to configure layer colors. The keys are layer names and values are the configuration objects.

Layer names are formatted as `[data_type]_[column_name]` (e.g., `Hex_NumJobs` for `hex` type `numJobs` column) **Currently, only numerical data are supported.** Categorical data are rendered with randomly generated colors.

One layer is formatted as follows:

```js
Hex_NumJobs: {
    colors: ['#ffffe5', '#f7fcb9', '#d9f0a3', '#addd8e', '#78c679'],
    scale: [0, 0.25, 0.5, 0.9, 1.0],
    type: 'normalized',
    scaleBy: 'percentage',
    reverse: false,
    interpolate: true
}
```

#### Parameters

- `colors` **[Array][41]** **\*required**
Each color is represented by its hex code. Opacity for each color can be set by appending two digit number at the end of a hex number. By default, the opacity is set as 100%. (e.g., `#f0241605` is red with 5% opacity.)

- `scale` **[Array][41]**
If provided, the array has to be the same length as the `colors` array so that each value in this array corresponds to each color in the same position.
If not provided, colors are equally spaced out.

- `type` **[string][42]** **\*required**
    - `'normalized'` if the data should be normalized with mean and standard deviation. $t = \frac{x - \mu}{\sigma} \forall x \in D$. 
    The calculated values are clipped in the range of $[-5, 5] \in \mathbb{R}$. These values will be mapped to $[0, 1] \in \mathbb{R}$.
    - `'standardized'` if the data should be standardized with minimum and maximum. $t = \frac{x - min}{max - min} \forall x \in D$. The calculated values will be mapped to $[0, 1] \in \mathbb{R}$.
    The mapping function is defined by the `interpolate` parameter.

- `scaleBy` **[string][42]** **\*required only if scaled by raw values**
    - `'value'` if the provided scaling is by raw numbers where mininumn and maximum of the data map to 0.0 and 1.0 respectively. (So the first and last values in the `scale` array are replaced with minimum and maximum values automatically)
    - `'percentage'` if the provided scaling is by percentage where 0.5 directly corresponds to the mapped value of $t$. (But it does not check if it is actually named 'percentage')

- `reverse` **[boolean][43]** **\*required** - reverses the color scheme if set to `true`
- `interpolate` **[boolean][43]** **\*required** - linearly interpolates across the colors if set to `true`

## Examples

The following setting results in the map below.

### Configuration
```js
// CHANGEME.js

export const COLUMNS = {
    hex: 
       ['categorical',
        'greenArea',
        'timeToTokyo',
        'crimeTotalRate'],
    chome:
       ['greenArea']
};

// String for categorical values
// Number for numerical values
export const data_format = {
    "greenArea": Number,
    "categorical": String,
    "timeToTokyo": Number,
    "crimeTotalRate": Number
};

export const layerConfig = {
    layers: {
        default: {
            colors: COLOR_SCHEMES.default_blue2red,
            reverse: false,
            type: 'standardized',
            interpolate: true
        },
        Hex_GreenArea: {
            colors: ['#ffffe5', '#f7fcb9', '#d9f0a3', '#addd8e', '#78c679'],
            scale: [0, 0.25, 0.5, 0.9, 1.0],
            scaleBy: 'percentage',
            reverse: false,
            type: 'standardized',
            interpolate: false
        },
        Chome_GreenArea: {
            colors: COLOR_SCHEMES.white2green,
            reverse: true,
            type: 'normalized',
            interpolate: true
        },
        Hex_CrimeTotalRate: {
            colors: ['#d73027', '#f46d43', '#fdae61', '#fee090', '#ffffbf', '#e0f3f8', '#abd9e9', '#74add1', '#4575b4'],
            scale: [0, 0.0001, 0.0005, 0.001, 0.003, 0.004, 0.005, 0.006, 0.008],
            scaleBy: 'value',
            reverse: true,
            type: 'normalized',
            interpolate: true
        }
    }
};
```

### Results
![categorical](docs/img/categorical.png)
![Hex_GreenArea](docs/img/greenArea.png)
![Hex_TimeToTokyo](docs/img/timeToTokyo.png)
![Hex_CrimeTotalRate](docs/img/totalCrimeRate.png)
![Chome_GreenArea](docs/img/chomeGreenArea.png)




[40]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object
[41]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array
[42]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String
[43]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean
[44]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number
[45]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function