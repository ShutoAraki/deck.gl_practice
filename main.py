import json
import os
import subprocess
import pickle
import pandas as pd

DATA_PATH = ""
isWindows = False
if "G:\My Drive" in os.path.dirname(os.path.abspath(__file__)):
    isWindows = True
    DATA_PATH = "G:\My Drive\Data\VisMaster"
elif "G:\\.shortcut" in os.path.dirname(os.path.abspath(__file__)):
    isWindows = True
    DATA_PATH = "G:\\.shortcut-targets-by-id\\1Hu8XWWree1F54qnzec2mDGSgsK1G5ytE\\Data\\VisMaster"
else:
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
    thisVariable = convertColName(thisVariable)
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

def convertColName(colname):
    return colname[0].lower() + colname[1:]

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
            core = core.loc[:, ['hexNum', 'geometry']]
        elif dtype == 'chome':
            core = core.loc[:, ['addressCode', 'addressName', 'geometry']]
        print(f"Saving core-{dtype}.csv with the shape of {core.shape}...")
        core.to_csv(os.path.join(DATA_PATH, f"core-{dtype}.csv"), index=False)


def splitFromVarList(varList, mappingArea=None):
    # varList name format: "hex_[column-name]"
    dtypes = set(map(lambda x: x.split('_')[0].lower(), varList))
    # Example:
    # dataDict = {
    #     'hex': {
    #         'Environment': ['percentCommercial', 'percentIndustrial'],
    #         'Crime': ['crimeTotalRate']
    #     }
    # }
    dataDict = {dtype: {} for dtype in dtypes}
    for varname in varList:
        dtype = varname.split('_')[0].lower()
        # colname = '-'.join(varname.split('_')[1:]) # Make sure no column name contains underbars
        # colname = convertColName(colname)
        colname = '_'.join(varname.split('_')[1:])
        colname = convertColName(colname)
        topic = getVariableTopic(colname)
        print(f"{colname}: {topic}")
        if topic in dataDict[dtype].keys():
            dataDict[dtype][topic].append(colname)
        else:
            dataDict[dtype][topic] = [colname]

    primaryKey = {
        'hex': 'hexNum',
        'chome': 'addressCode'
    }
    for dtype, topicDict in dataDict.items():
        for topic, cols in topicDict.items():
            topicFile = getTopicFile(topic, dtype+'Data')
            data = pd.read_csv(topicFile)
            filters = pd.read_csv(fullPathName(f"{dtype}_filters.csv"))
            data = data.merge(filters, on=primaryKey[dtype])
            if mappingArea == "in23Wards":
                data = data.loc[data.in23Wards]
            elif mappingArea == "inTokyoMain":
                data = data.loc[data.inTokyoMain]
            # Write to csv for each column
            for col in cols:
                print(f"Processing {col} of {dtype} type from topic \"{topic}\" (shape: {data.shape})")
                thisData = data.loc[:, col].fillna('')
                thisData.to_csv(fullPathName(f"{dtype}_{col}.csv"), index=False)


def makeShutoMap(varList, mappingArea='in23Wards'):
    '''
    varList name format: '[datatype]_[colname]' (e.g., 'hex_greenArea' / 'chome_noiseMean')
    '''
    # Parse the varList names to generate a dict and store it as a json file called 'columns.json'
    dtypes = set(map(lambda x: x.split('_')[0].lower(), varList))
    extractDict = {dtype: [] for dtype in dtypes}
    for varname in varList:
        dtype = varname.split('_')[0].lower()
        colname = '_'.join(varname.split('_')[1:])
        colname = convertColName(colname)
        topic = getVariableTopic(colname)
        extractDict[dtype].append(f"{colname}_{topic}")
    with open('src/data/columns.json', 'w') as f:
        json.dump(extractDict, f)
    # Start the process
    if isWindows:
        str_DATA_PATH = '"' + DATA_PATH + '"'
    else:
        str_DATA_PATH = DATA_PATH.replace(' ', '\ ')
    command = f"http-server --cors -p 8081 {str_DATA_PATH}"
    print("Running the command:", command)
    if isWindows:
        with open("launchDataScope_"+os.environ["USERNAME"]+".bat", 'w') as f:
            f.write("start " + command)
            cwd = os.getcwd()
            f.write("\nstart npm start --prefix " + cwd)
    else:
        subprocess.check_call(command + " &", shell=True)
        subprocess.check_call("npm start", shell=True)
    

if __name__ == "__main__":
    varList = ['Hex_CrimeTotalRate',
               'Hex_CrimeFelonyRobberyRate',
               'Hex_CrimeFelonyOtherRate',
               'Hex_CrimeViolentWeaponsRate',
               'Hex_CrimeViolentAssaultRate',
               'Hex_CrimeViolentInjuryRate',
               'Hex_CrimeViolentIntimidationRate',
               'Hex_CrimeViolentExtortionRate',
               'Hex_CrimeTheftBurglarySafeRate',
               'Hex_CrimeTheftBurglaryEmptyHomeRate',
               'Hex_CrimeTheftBurglaryHomeSleepingRate',
               'Hex_CrimeTheftBurglaryHomeUnnoticedRate',
               'Hex_CrimeTheftBurglaryOtherRate',
               'Hex_CrimeTheftVehicleRate',
               'Hex_CrimeTheftMotorcycleRate',
               'Hex_CrimeTheftPickPocketRate',
               'Hex_CrimeTheftPurseSnatchingRate',
               'Hex_CrimeTheftBagLiftingRate',
               'Hex_CrimeTheftOtherRate',
               'Hex_CrimeOtherMoralIndecencyRate',
               'Hex_CrimeOtherOtherRate',
               'Hex_NumJobs',
               'Hex_NumCompanies',
               'Hex_GreenArea',
               'Hex_NoiseMin',
               'Hex_NoiseMean',
               'Hex_NoiseMax',
               'Hex_PercentCommercial',
               'Hex_PercentIndustrial',
               'Hex_PercentResidential',
               'Hex_MeanPercentLandCoverage',
               'Hex_MeanTotalPercentLandCoverage',
               'Hex_ElevationMin',
               'Hex_ElevationMean',
               'Hex_ElevationMax',
               'Hex_SlopeMean',
               'Hex_SlopeMedian',
               'Hex_SlopeMax',
               'Hex_NumHouseholds',
               'Hex_Pop_Total_A',
               'Hex_Pop_0-19yr_A',
               'Hex_Pop_20-69yr_A',
               'Hex_Pop_70yr+_A',
               'Hex_Pop_20-29yr_A',
               'Hex_Pop_30-44yr_A',
               'Hex_Pop_percentForeigners',
               'Hex_Pop_percentChildren',
               'Hex_Pop_percentMale',
               'Hex_Pop_percentFemale',
               'Hex_Pop_percent30-44yr',
               'Hex_TimeToTokyo',
               'Hex_TimeAndCostToTokyo',
               'Chome_NoiseMean']
    mappingArea = 'in23Wards'

#    createCore(['hex', 'chome'], mappingArea)
    #splitFromVarList(varList, mappingArea)
    makeShutoMap(varList, mappingArea)









####=============================================================================
####================= CREATE VARIABLE LISTS FOR VIZENGINE =======================
####=============================================================================

#thisVarList = ['elevationMin', 'elevationMean', 'elevationMax', 'slopeMin', 'slopeMean', 'slopeMedian', 'slopeMax']
#addVarsToLocatorDict(thisVarList, "Geography", dataType='hexData')

#addVarsToLocatorDict('totalPopulation', "Core", dataType='hexData')
##
#print(readPickleFile('../Data/DataMasters/variableLocatorDict.pkl')['hexData'])

#print(list(getDataForTopic("Population")))

#allVarList = getVisVarNames("Crime", dataType='hexData') + getVisVarNames("Economics", dataType='hexData') + getVisVarNames("Environment", dataType='hexData') + getVisVarNames("Geography", dataType='hexData') + getVisVarNames("Population", dataType='hexData') + getVisVarNames("Transportation", dataType='hexData')
#
#print(allVarList)
#print("Num hexData variables for far:", len(allVarList))

#varsToUse = ['Hex_CrimeTotalRate', 'Hex_CrimeFelonyRobberyRate', 'Hex_CrimeFelonyOtherRate', 'Hex_CrimeViolentWeaponsRate', 'Hex_CrimeViolentAssaultRate', 'Hex_CrimeViolentInjuryRate', 'Hex_CrimeViolentIntimidationRate', 'Hex_CrimeViolentExtortionRate', 'Hex_CrimeTheftBurglarySafeRate', 'Hex_CrimeTheftBurglaryEmptyHomeRate', 'Hex_CrimeTheftBurglaryHomeSleepingRate', 'Hex_CrimeTheftBurglaryHomeUnnoticedRate', 'Hex_CrimeTheftBurglaryOtherRate', 'Hex_CrimeTheftVehicleRate', 'Hex_CrimeTheftMotorcycleRate', 'Hex_CrimeTheftPickPocketRate', 'Hex_CrimeTheftPurseSnatchingRate', 'Hex_CrimeTheftBagLiftingRate', 'Hex_CrimeTheftOtherRate', 'Hex_CrimeOtherMoralIndecencyRate', 'Hex_CrimeOtherOtherRate', 'Hex_NumJobs', 'Hex_NumCompanies', 'Hex_GreenArea', 'Hex_NoiseMin', 'Hex_NoiseMean', 'Hex_NoiseMax', 'Hex_PercentCommercial', 'Hex_PercentIndustrial', 'Hex_PercentResidential', 'Hex_MeanPercentLandCoverage', 'Hex_MeanTotalPercentLandCoverage', 'Hex_ElevationMin', 'Hex_ElevationMean', 'Hex_ElevationMax', 'Hex_SlopeMin', 'Hex_SlopeMean', 'Hex_SlopeMedian', 'Hex_SlopeMax', 'Hex_NumHouseholds', 'Hex_Pop_Total_A', 'Hex_Pop_0-19yr_A', 'Hex_Pop_20-69yr_A', 'Hex_Pop_70yr+_A', 'Hex_Pop_20-29yr_A', 'Hex_Pop_30-44yr_A', 'Hex_Pop_percentForeigners', 'Hex_Pop_percentChildren', 'Hex_Pop_percentMale', 'Hex_Pop_percentFemale', 'Hex_Pop_percent30-44yr', 'Hex_TimeToTokyo', 'Hex_TimeAndCostToTokyo']
#
#for thisVar in varsToUse:
#    print('''        "'''+thisVar+'''": {
#            "colors": "white2red",
#            "reverse": false,
#            "type": "standardized",
#            "interpolate": true
#        },''')
#
#
#for thisVar in varsToUse:
#    print("               '"+thisVar+"',")






















#####======================================== END OF FILE ===========================================
