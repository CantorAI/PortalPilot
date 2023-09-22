import cantor thru 'lrpc:1000'
from Galaxy import galaxy
import yaml
from xlang_os import fs

galaxy.cantor = cantor
# cantor.log('start of filterlist.x')
moduleFileName = get_module_filename()
filename_parts = []
filename_parts = moduleFileName.split("portalpilot")
cantorAIRoot = filename_parts[0]

myTab = '  '
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

def retrieveFilterList():
	# yamlData = yaml.load('C:\\Users\\victor\\projects\\CantorAI\\Galaxy\\config\\filters.yaml') 
	# yamlData = yaml.load('..\\..\\CantorAI\\Galaxy\\config\\filters.yaml') 
	yamlFilePath = cantorAIRoot + "Galaxy/config/filters.yaml"
	yamlData = yaml.load (yamlFilePath)

	# for key, value in data.items():
	#	print(f'{key}: {value}')
	jsonData = convertYamltoJson(yamlData)
	return jsonData

def retrieveFilterListRaw():
	# filePath = 'C:\\Users\\victor\\projects\\CantorAI\\Galaxy\\config\\filters.yaml'
	yamlFilePath = cantorAIRoot + "Galaxy/config/filters.yaml"
	openMode = 'r'
	f = fs.File(yamlFilePath,openMode)
	f_size = f.size
	if f_size >=0:
		data = f.read(f_size)
	else:
		data = ''
	f.close()
	# cantor.log(data)
	return data

# def retrieveFilterDesignPage(fileterName, fileterURI):
def retrieveFilterDesignPage(fileterName):
	# filter = galaxy.LoadFilter (fileterName, fileterURI)
	# if (filter == 0):
	# 	return 0
	# designPage = filter.getFilterDesignPage()

	yamlFilePath = cantorAIRoot + "Galaxy" + filterName
	openMode = 'r'

	# filePath = 'C:\\Users\\victor\\projects\\CantorAI\\Galaxy\\dataset\\DesignPage.htm'
	openMode = 'r'
	f = fs.File(filePath,openMode)
	f_size = f.size
	if f_size >=0:
		designPage = f.read(f_size)
	else:
		data = ''
	f.close()
	# cantor.log(designPage)
	return designPage

def retrieveFilterPropertyList(filterObj):
	filterType = type(filterObj)
	propertyList = filterType.getMembers()
	return propertyList

def retrieveFilterPropertyListbyType(filterTypeStr, filterDll):
	filterObj = galaxy.LoadFilter (filterTypeStr, filterDll)
	filterType = type(filterObj)
	propertyList = filterType.getMembers()
	return propertyList

cantor.RegisterAPI('retrieveFilterList',retrieveFilterList)
cantor.RegisterAPI('retrieveFilterListRaw',retrieveFilterListRaw)
cantor.RegisterAPI('retrieveFilterPropertyList',retrieveFilterPropertyList)
cantor.RegisterAPI('retrieveFilterPropertyListbyType',retrieveFilterPropertyListbyType)
# cantor.RegisterAPI('retrieveFilterProperty',retrieveFilterProperty)
cantor.RegisterAPI('retrieveFilterDesignPage',retrieveFilterDesignPage)

#retrieveFilterListRaw()
retrieveFilterList()
# retrieveFilterDesignPage("dataset/DesignPage.html")

'''
dataset = galaxy.LoadFilter ('dataset', 'galaxy_dataset')
fermat = galaxy.LoadFilter('fermat','galaxy_fermat')
promptFilter = galaxy.LoadFilter('prompt','galaxy_llmAgent')
llmAgentFilter = galaxy.LoadFilter('llmAgent','galaxy_llmAgent')

retrieveFilterPropertyList(dataset)
retrieveFilterPropertyList(fermat)
retrieveFilterPropertyList(promptFilter)
retrieveFilterPropertyList(llmAgentFilter)

'''

# cantor.log('End of filterlist.x')
cantor.log('filterlist is loaded ')
