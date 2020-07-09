# Best Basho Visualizer

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
Install `http-server` by following the instructions [here](https://www.npmjs.com/package/http-server).

On your terminal or command line, navigate yourself to the source data folder (under Google Drive `VisualizationEngine` folder in this case) and run the following.

```
http-server --cors -p 8081
```
This command opens the port 8081 and allow other processes to access the csv files.

#### Data format requirements

- The folder needs to contain `hexData-Core.csv` and `chomeData-Core.csv` where geometry files are stored. These will be loaded at the beginning and additional columns will be appended.

- All the other csv files need to be splitted into multiple csv files so that each one contains only one column data.

- Each column corresponds to each layer (if you specify in `src/CHANGEME.js`)

- Do not use `_` in any of the column/file names.

### 3. Start the application
```
npm start
```
It should now be running at [`http://localhost:8080/`](http://localhost:8080/).

### 4. Customize layers and data
The `src/CHANGEME.js` file contains all the customizeable components in this tool.

#### Edit data columns
Edit `COLUMNS` object to add more columns to visualize. Do not forget to add its format in `data_format` object too.

#### Edit layer configurations
Edit `layerConfig` object to configure layer colors. The keys are layer names and values are the configuration objects.

Layer names are named as `[data_type]_[column_name]` (e.g., `Hex_NumJobs` for `hex` type `numJobs` column)
