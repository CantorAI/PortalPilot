# This script accepts request from the front end, and extract filter information from a .x file, and return data 
# in JSON.  The front end load this data to restore GUI design.

# import cantor thru 'lrpc:1000'
# from Galaxy import galaxy
import ast
from xlang_os import fs
# galaxy.cantor = cantor

print("start of extractUI")

moduleFileName = get_module_filename()
filename_parts = []
filename_parts = moduleFileName.split("portalpilot")
cantorAIRoot = filename_parts[0]
xFilePath = cantorAIRoot + "Galaxy/test/test.new.x"

gFilterList = []
gFilterDetails = []
gOutputJson = {}

def getFilterName():
    filterName = ""
    return filterName

def getFilterType():
    filterTypeName = ""
    return filterTypeName

def getFilterInput():
    filterInput = ""
    return filterInput

def getFilterOutput():
    filterOutput = ""
    return filterOutput

def getFilterProperties():
    properties = []
    return properties

def getFilterCoordinates():
    x = 0
    y = 0
    return [x,y]

def searchFiltersEdit(xFilePath):
	openMode = 'r'
	f = fs.File(xFilePath,openMode)
	f_size = f.size
	if f_size >=0:
		data = f.read(f_size)
	else:
		data = ''
	f.close()
	# cantor.log(data)

    offset = data.find ("galaxy.LoadFilter")

	return data

def searchFilters(node, gFilterList, gFilterDetails):
    global gFilterList     
    global gFilterDetails
    if node.type == "Dot":
        # if node.children[0].name == "galaxy" and node.children[0].type == "var" and
        #    node.children[1].name == "LoadFilter" and node.children[1].type == "var" 
        #    print("save keyword:", node.parent.parent.name)
        child0 = node.children[0]
        child1 = node.children[1]
        if (child0.name == "galaxy" and child1.name == "LoadFilter"):
           parent = node.parent
           grandparent = parent.parent
           sibling = parent.children[1]
           nephew0 = sibling.children[0]
           nephew1 = sibling.children[1]       
           filterFeatures = []
           filterFeature = {"filterName":grandparent.name}
           filterFeatures += filterFeature
           filterFeature = {"memberName":"filterType"}
           filterFeatures += filterFeature
           filterFeature = {"parameters":nephew0.name}
           filterFeatures += filterFeature
           filterFeature = {"memberName":"filterDll"}
           filterFeatures += filterFeature
           filterFeature = {"parameters":nephew1.name}
           filterFeatures += filterFeature
           gFilterList += grandparent.name
           gFilterDetails += filterFeatures
           
    # if (node.children != nullptr):
    if (node.children.size() > 0):
        for child in node.children:
            searchFilters(child, gFilterList, gFilterDetails)
    # print (gFilterList)

def searchAdditionalFilterMembers (node, gFilterList, gFilterDetails):
    global gFilterList     
    global gFilterDetails
    if node.type == "Dot": 
        child0 = node.children[0]
        child1 = node.children[1]
        parent = node.parent
        grandparent = parent.parent
        sibling = parent.children[1]
        nephew0 = sibling.children[0]
        nephew1 = sibling.children[1]
        for filterName in gFilterList:     
           print (filterName)
           if (child0.name == filterName):  
                gOutputJson += child0.name
                print("save keyword:", grandparent.name)
                filterFeatures = []
                filterFeature = {"filterName":child0.name}
                filterFeatures += filterFeature
                filterFeature = {"memberName":child1.name}
                filterFeatures += filterFeature
                filterFeature = {"parameters":${grandparent.name}}
                filterFeatures += filterFeature
                gOutputJson += filterFeatures
                break;
    
    # if (node.children != nullptr):
    if (node.children.size() > 0):
        for child in node.children:
            searchAdditionalFilterMembers(child, gFilterList, gFilterDetails)

def searchConnections(node):
    if node.type == "Dot":
        child0 = node.children[0]
        child1 = node.children[1]     
        if (child0.name == "galaxy" and child1.name == "LoadFilter"):
           parent = node.parent
           grandparent = parent.parent
           print("save keyword:", grandparent.name)
           gFilterList += grandparent.name
    
    # if (node.children != nullptr):
    if (node.children.size() > 0):
        for child in node.children:
            searchFilters(child, gFilterList)

tree = ast.load(xFilePath)
searchFilters(tree, gFilterList, gFilterDetails)
searchAdditionalFilterMembers(tree, gFilterList, gFilterDetails)
# searchConnections(tree)

# searchFiltersEdit(xFilePath)


def extractUIfromX(projectFileName):
	tree = ast.load(projectFileName)
    print ("AST has been created #1.")
    if (tree.children.size() > 0):
        # outPut = searchFilters(tree)
        # searchConnections(tree, gFilterList)
        print ("AST has been created #2.")
	# return outPut

def InsertXfromJson(projectFileName):
	tree = ast.load(projectFileName)
	outPut = " "
	return outPut

# cantor.RegisterAPI('extractUIfromX',extractUIfromX)
# cantor.RegisterAPI('InsertXfromJson',InsertXfromJson)

# UIdata = extractUIfromX(xFilePath)

print("end of extractUI")
