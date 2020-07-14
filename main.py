import json
import os
import subprocess
import pandas as pd

DATA_PATH = os.path.join(os.environ['DATA_PATH'], 'VisMaster')

def createCore(dtypes, mappingArea=None):
    for dtype in dtypes:
        core = pd.read_csv(os.path.join(DATA_PATH, f"{dtype}Data-Core.csv"))
        if dtype == 'chome':
            core = core.loc[core.lowestLevel]
        # Filter by mapping area
        if mappingArea == 'in23Wards':
            core = core.loc[core.in23Wards]
        elif mappingArea == 'inTokyoMain':
            core = core.loc[core.inTokyoMain]
        # Get only the essential columns
        if dtype == 'hex':
            core = core.loc[:, ['hexNum', 'geometry', 'totalPopulation']]
        elif dtype == 'chome':
            core = core.loc[:, ['addressCode', 'addressName', 'geometry', 'totalPopulation', 'landArea']]
        print(f"Saving core-{dtype}.csv with the shape of {core.shape}...")
        core.to_csv(os.path.join(DATA_PATH, f"core-{dtype}.csv"), index=False)


def splitFromVarList(varList, mappingArea=None):
    # varList name format: "hex_[column-name]"
    dtypes = set(map(lambda x: x.split('_')[0].lower(), varList))
    masterDataDict = {}
    for dtype in dtypes:
        masterDataDict[dtype] = pd.read_csv(os.path.join(DATA_PATH, f"{dtype}Data-Master_v003d.csv")).fillna('')
        # Filter by lowest level first
        if dtype == 'chome':
            masterDataDict[dtype] = masterDataDict[dtype].loc[masterDataDict[dtype].lowestLevel]
        # Filter by mapping area
        if mappingArea == "in23Wards":
            masterData = masterDataDict[dtype]
            filteredData = masterData.loc[masterData.in23Wards]
            masterDataDict[dtype] = filteredData
        elif mappingArea == "inTokyoMain":
            masterData = masterDataDict[dtype]
            filteredData = masterData.loc[masterData.inTokyoMain]
            masterDataDict[dtype] = filteredData
    # The dict that stores what columns to extract from each dtype
    extractDict = {dtype: [] for dtype in dtypes}
    for varname in varList:
        dtype = varname.split('_')[0]
        colname = ''.join(varname.split('_')[1:]).replace('_', '-') # Make sure no column name contains underbars
        extractDict[dtype].append(colname)
    print(extractDict)
    # Extract the data
    for dtype, colnames in extractDict.items():
        for colname in colnames:
            fullname = os.path.join(DATA_PATH, f"{dtype}_{colname}.csv")
            data = masterDataDict[dtype].loc[:, colname]
            print(f"Processing {colname} of {dtype} type with the shape {data.shape}...")
            data.to_csv(fullname, index=False)


def makeShutoMap(varList, mappingArea='in23Wards'):
    '''
    varList name format: '[datatype]_[colname]' (e.g., 'hex_greenArea' / 'chome_noiseMean')
    '''
    # Parse the varList names to generate a dict and store it as a json file called 'columns.json'
    dtypes = set(map(lambda x: x.split('_')[0].lower(), varList))
    extractDict = {dtype: [] for dtype in dtypes}
    for varname in varList:
        dtype = varname.split('_')[0]
        colname = ''.join(varname.split('_')[1:]).replace('_', '-') # Make sure no column name contains underbars
        extractDict[dtype].append(colname)
    with open('src/data/columns.json', 'w') as f:
        json.dump(extractDict, f)
    # Start the process
    subprocess.check_call('npm start', shell=True)


if __name__ == "__main__":
    varList = ['hex_numJobs', 'hex_numCompanies', 'hex_crimeTotalRate', 'hex_timeToTokyo', 'chome_noiseMean']
    mappingArea = 'inTokyoMain'

    # createCore(['hex', 'chome'], mappingArea)
    # splitFromVarList(varList, mappingArea)
    makeShutoMap(varList, mappingArea)