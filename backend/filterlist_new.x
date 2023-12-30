import cantor thru 'lrpc:1000'
from Galaxy import galaxy
import yaml
from xlang_os import fs

# -------------------------------------------------------------------- #
galaxy.cantor = cantor
cantor.log('start of filterlist.x')

galaxy_root ="../../Galaxy"
galaxy_design_root = galaxy_root+"/design"
galaxy_config_path = galaxy_root+"/config/filters.yaml"

# -------------------------------------------------------------------- #
def readTextFile(filePath,openMode):
  f = fs.File(filePath,openMode)
  f_size = f.size
  if f_size >=0:
    data = f.read(f_size)
  else:
    data = ""
  f.close() 
  return data

def createTextFile(filePath,openMode):
  f = fs.File(filePath,openMode)
  f.close() 
  return true

def convertYamltoJson(yamlData):
	# jsonOutput = {}

	jsonOut = '{ \n'
	bFirstCategory= True
	# Loop through the top level categories
	for child in yamlData.children:
		if(bFirstCategory == False):
			jsonOut += '\n  ],\n'
		category = child.key
		jsonOut += '  "'	
		jsonOut += category
		jsonOut += ' ":'
		# print('category = ' + category)
		jsonOut += '[\n'
		bFirstFilter = True
		for filter in child.value.children:
			if(bFirstFilter == False):
				jsonOut += '\n    },\n'
			jsonOut += '    {\n'
			# cantor.log('   filter = ' + filter.key)
			jsonOut += '      "'
			jsonOut += filter.key
			jsonOut += ' "'
			jsonOut += ' :{\n'
			bFirstItem = True
			for item in filter.value.children:
				# cantor.log('      ' + item.key + ':' + item.value)
				# if(!bFirstItem):
				if(bFirstItem == False):
					jsonOut += ',\n'
				jsonOut += '        "'
				jsonOut += item.key
				jsonOut += ' ":" '	
				jsonOut += item.value
				jsonOut += ' " '	
				bFirstItem = False
			jsonOut += '\n        }'
			bFirstFilter = False
		bFirstCategory= False
		jsonOut += '\n    }'
	jsonOut += '\n  ]'
	jsonOut += '\n}'

	# print(jsonOut)
	return jsonOut

def json2X(pipelineJsonStr):
	print("in json2X")
	pipelineJson = json.loads(pipelineJsonStr)
	#header 
	gXData = None
	gXData += "import cantor thru 'lrpc:1000'" 
	gXData += "\n"
	gXData += "from Galaxy import galaxy" 
	gXData += "\n"
	gXData += "\n"
	gXData += "taskManager = cantor.TaskManager()	"
	gXData += "\n"
	gXData += "metrics = cantor.Metrics()"
	gXData += "\n"
	gXData += "TaskCount = metrics.queryMetrics(taskManager,'TaskCount')"
	gXData += "\n"
	gXData += "galaxy.cantor = cantor"
	gXData += "\n"

	# filters and their interconnections

	# retrieve filter name first, and store them in gFilterList
	gFilterList = []
	#for item in pipelineJson:
	#	gFilterList += item
	#print(gFilterList)

	dataset_names = []
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
		xData += "\n"

		gXData += xData
		#end of for 

	gXData += "\n"

	# tailer
	# turn on datasets
	for dataset_name in dataset_names:
		gXData += dataset_name
		gXData += ".RunAsTask("
		gXData += ")\n"

	gXData += "cantor.log('End')\n"
	print (gXData)
	return gXData
	#end of json2X

def retrieveFilterList():
	# yamlData = yaml.load('C:\\project\\CantorAI\\Galaxy\\config\\filters.yaml') 
	yamlData = yaml.load(galaxy_config_path) 
	print('got yaml data')
	print (yamlData.size)
	# for key, value in data.items():
	#	print(f'{key}: {value}')
	jsonData = convertYamltoJson(yamlData)
	cantor.log(jsonData)
	return jsonData

def retrieveFilterListRaw():
	# filePath = 'C:\\project\\CantorAI\\Galaxy\\config\\filters.yaml'
	# data = readTextFile(filePath,"r");
	data = readTextFile(galaxy_config_path,"r");	
	cantor.log(data)
	return data

def retrieveFilterPins(filterType, filterDll, pinType):
	filterObj = galaxy.LoadFilter (filterType, filterDll)
	# filterType = type(filterObj)
	if (pinType == 1):
		print("retrieve input Pins")
		pins = filterObj.inputs
	else: #'0'
		print("retrieve output Pins")
		pins = filterObj.outputs
	print("number of pins: ", pins.size())
	return pins #list
	# return pins.size()

def retrieveFilterDesignPage(fileterName, fileterURI):
	filter = galaxy.LoadFilter (fileterName, fileterURI)
	if (filter == 0):
		return 0
	designPage = filter.getFilterDesignPage()
	return designPage

def retrieveFilterPropertyList(filterObj):
	filterType = type(filterObj)
	propertyList = filterType.getMembers()
	return propertyList

def retrieveFilterPropertyListbyType(filterType, filterDll):
	filterObj = galaxy.LoadFilter (filterType, filterDll)
	filterType = type(filterObj)
	propertyList = filterType.getMembers()
	return propertyList

# def retrieveFilterProperty(filterObj, propertyKey):
#	propertyValue = filterObj.getMember(propertyKey)
#	return propertyValue

def retrieveProjects() : #when open project is clicked
	projList = []
	dir = fs.Dir(galaxy_design_root)
	projList = dir.scanDir(0) #0 subDir only
	# print (projList)
	return projList

def createProject(projName): #when open project is clicked
    # projPath = galaxy_design_root + "/" + projName
	# dir = fs.Dir(projPath)
	dir = fs.Dir("../../Galaxy/design/project_traffic_a")
	result = dir.createDir()
	print (result)

def retrievePipelines(projectPath):#when a project is selected
	# dir = fs.Dir(projectPath)
	dir = fs.Dir("../../Galaxy/design/project_security")
	plList = []
	plList = dir.scanDir(1) #file only
	return plList

def retrievePipelineDetails(filePath):
	data = readTextFile(filePath,"r");	
	cantor.log(data)
	return data

def createPipeline(filePath):
	# filePath = "../../Galaxy/design/project_security/apartment_complex.pl" 
	createTextFile(filePath, "w")

def savePipeline2FileTest(pipelineJsonStr, filePath):
	print(filePath)
	createTextFile(filePath, "w")

def savePipeline2File(pipelineJsonStr, filePath):
	print(filePath)
	print(pipelineJsonStr)
	openMode = "w"
	f = fs.File(filePath,openMode)
	# f = fs.File("C:\\project\\CantorAI\\Galaxy\\test\\design\\project_a\\proj_a_pipeline1.pl", "w")
	# f = fs.File("/C/project/CantorAI/Galaxy/test/design/project_a/proj_a_pipeline1.pl", "w")
	
	if (f != None): 
		print("file has been opened")
    	result = f.write(pipelineJsonStr)
		if (result != true):
			print("file write failed")	
		else:
			print("successfully writed data to the file")
	else:
		print("can not open the file")
	
	f.close()
	# cantor.log(pipelineJsonStr)

def runPipeline_Old(pipelineJsonStr):
	print("in runPipeline")
	print(pipelineJsonStr)

	# save json
	# convert pipelineJsonStr to a dictionary
	# call factory::LoadPipelineImpl 	

	# approach 1, convert json to x file, let xlang runtime execute x file
	# convert json to x file ?
	json2X(pipelineJsonStr)
	# xlang runtime execute x file

	# approach 2, xlang runtime execute each filter run
	# for each obj/filter in pipeline
	#     take obj's input
	#     for each step of this obj
	#         execute logic   -- add function run() in each filter c++ code
	#         if any step fails, set retVal, return retVal to front end
	#         take this obj's output
	# set retVal
	# return retVal to front end

def runPipeline(fileName):
	print("in runPipeline")
	print("fileName- ", fileName)
	#retVal = galaxy.LoadPipelineFromFile("C:\\project\\CantorAI\\Galaxy\\test\\design\\project_a\\proj_a_pipeline1.pl")
	retVal = galaxy.LoadPipelineFromFile(fileName) #call Galaxy factory 

# -------------------------------------------------------------------- #
cantor.RegisterAPI('retrieveFilterList',retrieveFilterList)
cantor.RegisterAPI('retrieveFilterListRaw',retrieveFilterListRaw)
cantor.RegisterAPI('retrieveFilterPins',retrieveFilterPins)
cantor.RegisterAPI('retrieveFilterPropertyList',retrieveFilterPropertyList)
cantor.RegisterAPI('retrieveFilterPropertyListbyType',retrieveFilterPropertyListbyType)
# cantor.RegisterAPI('retrieveFilterProperty',retrieveFilterProperty)
cantor.RegisterAPI('retrieveProjects',retrieveProjects)
cantor.RegisterAPI('createProject',createProject)
cantor.RegisterAPI('retrievePipelines',retrievePipelines)
cantor.RegisterAPI('retrievePipelineDetails',retrievePipelineDetails)
cantor.RegisterAPI('createPipeline',createPipeline)
cantor.RegisterAPI('savePipeline2File',savePipeline2File)
cantor.RegisterAPI('runPipeline',runPipeline) #obsolete
# cantor.RegisterAPI('loadPipeline',loadPipeline)
# -------------------------------------------------------------------- #

# section for unit test 

# savePipeline2File ("ABCD", "../../Galaxy/design/project_security/highway.pl")

#print("------test createProject() -----")
# print("--------------------")
#projectName = "project_traffic"
#bResult = createProject(projectName)

'''
print("------test createPipeline() -----")
print("--------------------")
mfilePath = "../../Galaxy/design/project_security/apartment_complex.pl" 
createPipeline(mfilePath)

print("------test retrievePipelines() -----")
print("--------------------")
projectPath += "C:\\project\\CantorAI\\Galaxy\\design\\project_security"
pipelineList = retrievePipelines(projectPath) 
print (pipelineList)

print("------test retrievePipelineDetails() -----")
print("--------------------")
pipelineDetails = []
pipelineFilePath = "../../Galaxy/design/project_security/highway.pl"
pipelineDetails = retrievePipelineDetails(pipelineFilePath)
print (pipelineDetails)

print("------test retrieveProjects() -----")
print("--------------------")
projectList = retrieveProjects()
print (projectList)

print("------get pin size unit test section -----")
print("--------------------")
filterType = "dataset"
filterDll = "galaxy_dataset"
pinType = 1
retrieveFilterPins(filterType, filterDll, pinType)
pinType = 0
retrieveFilterPins(filterType, filterDll, pinType)

print("--------------------")
filterType = "fermat"
filterDll = "galaxy_fermat"
pinType = 1
retrieveFilterPins(filterType, filterDll, pinType)
pinType = 0
retrieveFilterPins(filterType, filterDll, pinType)

print("--------------------")
filterType = "tee"
filterDll = "galaxy_forge"
pinType = 1
retrieveFilterPins(filterType, filterDll, pinType)
pinType = 0
retrieveFilterPins(filterType, filterDll, pinType)

print("--------------------")
filterType = "mux"
filterDll = "galaxy_mux"
pinType = 1
retrieveFilterPins(filterType, filterDll, pinType)
pinType = 0
retrieveFilterPins(filterType, filterDll, pinType)

print("--------------------")
filterType = "sink"
filterDll = "galaxy_sink"
pinType = 1
retrieveFilterPins(filterType, filterDll, pinType)
pinType = 0
retrieveFilterPins(filterType, filterDll, pinType)

print("--------------------")
filterType = "llmAgent"
filterDll = "galaxy_llmAgent"
pinType = 1
retrieveFilterPins(filterType, filterDll, pinType)
pinType = 0
retrieveFilterPins(filterType, filterDll, pinType)

print("--------------------")
filterType = "prompt"
filterDll = "galaxy_llmAgent"
pinType = 1
retrieveFilterPins(filterType, filterDll, pinType)
pinType = 0
retrieveFilterPins(filterType, filterDll, pinType)

print("--------------------")
filterType = "heartRate"
filterDll = "galaxy_health"
pinType = 1
retrieveFilterPins(filterType, filterDll, pinType)
pinType = 0
retrieveFilterPins(filterType, filterDll, pinType)

tee = galaxy.LoadFilter("tee","galaxy_forge")
tee_out1 = tee.NewOutputPin()
print("tee_out1:", tee_out1)
tee_out2 = tee.NewOutputPin()
print("tee_out2:", tee_out2)
tee_in = tee.inputs
print("number of tee_in:", tee_in.size())
tee_out = tee.outputs
print("number of tee_out:", tee_out.size())

pipelineJsonStr =  {"pipeline":[{"name":"Dataset","id":0,"x":10,"y":50,"w":150,"h":100},{"name":"Sink","id":0,"x":271.9044196133007,"y":52.99895332921821,"w":150,"h":100},{"name":"Connect","id":0,"x":269.6203537312021,"y":103.43265076084914,"w":150,"h":100,"StartObject":"Dataset.0","StartPin":"output","EndObject":"Sink.0","EndPin":"input"}]}
print(pipelineJsonStr)
json2X(pipelineJsonStr)
dataset = galaxy.LoadFilter ('dataset', 'galaxy_dataset')
fermat = galaxy.LoadFilter('fermat','galaxy_fermat')
promptFilter = galaxy.LoadFilter('prompt','galaxy_llmAgent')
llmAgentFilter = galaxy.LoadFilter('llmAgent','galaxy_llmAgent')
'''

'''
retrieveFilterListRaw()
retrieveFilterList()
retrieveFilterPropertyList(dataset)
retrieveFilterPropertyList(fermat)
retrieveFilterPropertyList(promptFilter)
retrieveFilterPropertyList(llmAgentFilter)
retrieveFilterPropertyListbyType('fermat','galaxy_fermat')
savePipeline2File (dataset, None)
runPipeline(dataset)
'''

cantor.log('End of filterlist.x')
