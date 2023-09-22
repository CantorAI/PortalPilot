# This script accepts request from the front end, and extract filter information from a .x file, and return data 
# in JSON.  The front end load this data to restore GUI design.

# import cantor thru 'lrpc:1000'
# from Galaxy import galaxy
import ast
# from xlang_os import fs
# galaxy.cantor = cantor

print("start of extractUI")

moduleFileName = get_module_filename()
filename_parts = []
filename_parts = moduleFileName.split("portalpilot")
cantorAIRoot = filename_parts[0]
xFilePath = cantorAIRoot + "Galaxy/test/test.new.x"

filterList = []
outputJson = {}

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

def searchAST_old(node, filterList):
    if isinstance(node, ast.Str):
        if node.s in filterList:
            print("Found keyword:", node.s, "on line", node.lineno)
    
    for field in node.children:
        value = getattr(node, field)
        if isinstance(value, list):
            for item in value:
                search_ast(item, filterList)
        elif isinstance(value, ast.AST):
            search_ast(value, filterList)

def searchFilters(node):
    if node.type == "Dot":
        # if node.children[0].name == "galaxy" and node.children[0].type == "var" and
        #    node.children[1].name == "LoadFilter" and node.children[1].type == "var" 
        #    print("save keyword:", node.parent.parent.name)
        child0 = node.children[0]
        child1 = node.children[1]
             
        if (child0.name == "galaxy" and child1.name == "LoadFilter"):
           parent = node.parent
           grandparent = parent.parent
           print("save keyword:", grandparent.name)
           # filterList.push_back (grandparent.name)
           # filterList.Add (grandparent.name)
           # filterList.AddItem (grandparent.name)
           # filterList += grandparent.name
           filterFeatures = []
           filterFeature = {"filterName":grandparent.name}
           filterFeatures += filterFeature
           filterFeature = {"memberName":"filterType"}
           filterFeatures += filterFeature
           filterFeature = {"parameters":${grandparent.name}}
           filterFeatures += filterFeature
           filterList += filterFeatures
    
    # if (node.children != nullptr):
    if (node.children.size() > 0):
        for child in node.children:
            searchFilters(child, filterList)
    #else:
    #    print (filterList)

def searchConnections(node):
    if node.type == "Dot":
        child0 = node.children[0]
        child1 = node.children[1]     
        if (child0.name == "galaxy" and child1.name == "LoadFilter"):
           parent = node.parent
           grandparent = parent.parent
           print("save keyword:", grandparent.name)
           filterList += grandparent.name
    
    # if (node.children != nullptr):
    if (node.children.size() > 0):
        for child in node.children:
            searchFilters(child, filterList)

tree = ast.load(xFilePath)
searchFilters(tree)
# searchConnections(tree)

def extractUIfromX(projectFileName):
	tree = ast.load(projectFileName)
    print ("AST has been created #1.")
    if (tree.children.size() > 0):
        # outPut = searchFilters(tree)
        # searchConnections(tree, filterList)
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
