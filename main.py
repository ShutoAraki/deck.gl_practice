import json
import os
import subprocess
import pickle
import pandas as pd

DATA_PATH = os.path.join(os.environ['DATA_PATH'], 'VisMaster')

# ========== Helper functions ========== 
# Append a path to the DATA_PATH
def fullPathName(path):
    return os.path.join(DATA_PATH, path)

# Given a topic name and data type, get its file name
def getTopicFile(thisTopic, dataType='hexData'):
    return fullPathName(f"{dataType}-{thisTopic}.csv")

def readPickleFile(filePathName):
    with open (filePathName, 'rb') as fp:
        return pickle.load(fp)

def getVariableDict(dataType='hexData'):
    return readPickleFile(fullPathName('variableLocatorDict.pkl'))[dataType]

def getVariableTopic(thisVariable, dataType='hexData'):
    thisVariable = thisVariable[0].lower() + thisVariable[1:]
    variableLocatorDict = getVariableDict(dataType)
    thisTopic = variableLocatorDict[thisVariable] if thisVariable in list(variableLocatorDict.keys()) else None
    return thisTopic

def getVariableFile(thisVariable, dataType='hexData'):
    thisTopic = getVariableTopic(thisVariable, dataType)
    if thisTopic == None:
        print(f"Variable '{thisVariable}' not found in master data")
        return None
    else:
        return getTopicFile(thisTopic, dataType)

def getVariableList(dataType='hexData'):
    variableLocatorDict = getVariableDict(dataType)
    return list(variableLocatorDict.keys())

def getVariablesByTopic(dataType='hexData'):
    variableLocatorDict = getVariableDict(dataType)
    variablesByTopic = {thisTopic:[k for k,v in variableLocatorDict.items() if v == thisTopic] for thisTopic in list(set(variableLocatorDict.values()))}
    return variablesByTopic

def getTopicList(dataType='hexData'):
    return list(set(getVariableDict(dataType).values()))

def getVariablesForTopic(thisTopic, dataType='hexData'):
    variableLocatorDict = getVariableDict(dataType)
    return [k for k,v in variableLocatorDict.items() if v == thisTopic]

def createCore(dtypes, mappingArea=None):
    for dtype in dtypes:
        core = pd.read_csv(fullPathName(f"{dtype}Data-Core.csv"))
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
        masterDataDict[dtype] = pd.read_csv(fullPathName(f"master-{dtype}.csv")).fillna('')
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
        dtype = varname.split('_')[0].lower()
        colname = ''.join(varname.split('_')[1:]).replace('_', '-') # Make sure no column name contains underbars
        colname = colname[0].lower() + colname[1:]
        extractDict[dtype].append(colname)
    # Extract the data
    for dtype, colnames in extractDict.items():
        for colname in colnames:
            fullname = fullPathName(f"{dtype}_{colname}.csv") 
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
        dtype = varname.split('_')[0].lower()
        colname = ''.join(varname.split('_')[1:]).replace('_', '-') # Make sure no column name contains underbars
        colname = colname[0].lower() + colname[1:]
        topic = getVariableTopic(colname)
        extractDict[dtype].append(f"{colname}_{topic}")
    print(extractDict)
    with open('src/data/columns.json', 'w') as f:
        json.dump(extractDict, f)
    # Start the process
    str_DATA_PATH = DATA_PATH.replace(' ', '\ ')
    command = f"http-server --cors -p 8081 {str_DATA_PATH} &"
    print("Running the command:", command)
    # subprocess.check_call(command, shell=True)
    # subprocess.check_call('npm start', shell=True)


if __name__ == "__main__":
    varList = ['Hex_NumJobs', 
               'Hex_NumCompanies',
               'Hex_CrimeTotalRate',
               'Hex_TimeToTokyo',
               'Hex_NoiseMin',
               'Hex_NoiseMean',
               'Hex_NoiseMax',
               'Hex_GreenArea',
               'Chome_NoiseMean']
    mappingArea = 'in23Wards'

    #createCore(['hex', 'chome'], mappingArea)
    # splitFromVarList(varList, mappingArea)
    makeShutoMap(varList, mappingArea)
