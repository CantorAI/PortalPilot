# This script accepts UI designs in JSON from the front end, and converts the design into x files.

import cantor thru 'lrpc:1000'
from Galaxy import galaxy
import json
from xlang_os import fs, utils
# galaxy.cantor = cantor

print("start of JSON2X")

moduleFileName = get_module_filename() #output is "c:/users/victor/projects/cantorai/portalpilot/backend/json2x.x"
filename_parts = []
# filename_parts = moduleFileName.split("PortalPilot")
filename_parts = moduleFileName.split("portalpilot")
cantorAIRoot = filename_parts[0]
jsonFilePath = cantorAIRoot + "Galaxy/test/project1.json"
xFilePath = cantorAIRoot + "Galaxy/test/project1.x"
# xFilePath = cantorAIRoot + "Galaxy/test/project1.x"
# xFilePath = cantorAIRoot + "Galaxy\\test\\project1.x"

print("xFilePath = ", xFilePath)
print("jsonFilePath = ", jsonFilePath)

def load_json_file(jsonFilePath):
    jData = None
    jData = json.load(jsonFilePath)  #load from a file
    #jsonData = json.loads(jsonMessage)  #load from a file   
    '''
    if (jData != None):
        # print ("design file has been loaded \n", jsonData)
        return True
    else:
        # print ("can not load the design file")
        return False
    '''
    return jData

# def convert2x(jsonData):
#    for item in jsonData:
#        print (item)

def write_x (filePath, data):
	# filePath = 'C:\\Users\\victor\\projects\\CantorAI\\Galaxy\\config\\filters.yaml'
	# openMode = 'w'
    print("filePath = ", filePath)
	openMode = 'r'
    '''
	f = fs.File(filePath,openMode)
    if (f.write(data) != True):
        print ("can not write the design to a xfile")
	f.close()
	# cantor.log(data)
	return True
    '''

# ----------------Load JSON file ----------------------------  
# if (load_json_file(jsonFilePath) != True):
jsonData = load_json_file(jsonFilePath)
if (jsonData == None):
    return
# else:    
#    print ("design file has been loaded \n", jsonData)

# -----------------Prepare X file ---------------------------  
# if (convert2x(jsonData) != True):
#    return

gFilterList = []
for item in jsonData:
    #print (item)
    #print (item["uri"])  #not supported
    gFilterList += item
# print(gFilterList)

uuid = utils.generate_uid()
gXData = None
gXData += "# ---------------------------------------------------------------------\n"
gXData += "# This file contains the project details generated from :              \n"
gXData += "#    "
gXData += jsonFilePath
gXData += "\n"
gXData += "#    UUID = "
gXData += uuid
gXData += "\n"
gXData += "# ---------------------------------------------------------------------\n"
gXData += "import cantor thru 'lrpc:1000'\n"
gXData += "from Galaxy import galaxy\n"
gXData += "\n"
gXData += "taskManager = cantor.TaskManager()\n"
gXData += "metrics = cantor.Metrics()\n"
gXData += "TaskCount = metrics.queryMetrics(taskManager,'TaskCount')\n"
gXData += "galaxy.cantor = cantor\n"
gXData += "\n"

for item in gFilterList:  #each item is a filter instance
    # print (item) #just filter name
    # print (item["uri"]) #not supported

    xData = None
    # xData += item
    xData += " = "
    xData += "galaxy.LoadFilter('"
    # print(jsonData[item]["uri"])
    xType = jsonData[item]["type"]
    xData += xType
    xData += "','"
    # print(jsonData[item]["type"])
    xData += jsonData[item]["uri"]
    xData += "')\n"
    # print (xData)

    xData += "##!! "
    #xData += item
    xData += ".x0 = "
    xData += jsonData[item]["coordinates"]["x0"]
    xData += ", "
    #xData += item
    xData += ".y0 = "
    xData += jsonData[item]["coordinates"]["y0"]
    xData += ", "
    #xData += item
    xData += ".x1 = "
    xData += jsonData[item]["coordinates"]["x1"]
    xData += ", "
    #xData += item
    xData += ".y1 = "
    xData += jsonData[item]["coordinates"]["y1"]
    xData += "\n"

    if (xType == "dataset"):
        #xData += item
        xData += ".AddFolder"
        xData += "("
        xData += jsonData[item]["AddFolder"]
        xData += ")\n"

    if (xType == "fermat"):
        #xData += item
        xData += ".Pipeline"
        xData += "= ("
        xData += jsonData[item]["Pipeline"]
        xData += ")\n"

    xData += "\n"

    gXData += xData

gXData += "\n"
gXData += "cantor.log('End')\n"
print (gXData)

# Save the data into a XLang file
# xData = "Hello, World!"
# write_x (xFilePath, xData)

print ("End of JSON2X")    
