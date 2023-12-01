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
filename_parts = moduleFileName.split("PortalPilot")
cantorAIRoot = filename_parts[0]
xFilePath = cantorAIRoot + "Galaxy/test/test.new.x"
# xFilePath = cantorAIRoot + "Galaxy/test/test_tee.x"
# xFilePath = cantorAIRoot + "Galaxy\\test\\test.new.x"

print("xFilePath = ", xFilePath)

gFilterList = []
gFilterDetails = {}
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
        '''
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
        '''

        if (child0.name == "galaxy" and child1.name == "LoadFilter"):
           parent = node.parent
           grandparent = parent.parent
           
           sibling = parent.children[1]
           nephew0 = sibling.children[0]
           nephew1 = sibling.children[1]
           filterFeature += "'"
           filterFeature += grandparent.name
           filterFeature += "':{"
           filterFeature += "\n"
           filterFeature += "'filterType':'" 
           filterFeature += nephew0.name
           filterFeature += "',"
           filterFeature += "\n"
           filterFeature += "'filterDll':'"
           filterFeature += nephew1.name
           filterFeature += "'"
           filterFeature += "\n"
           filterFeature += "}"
           gFilterList += grandparent.name
           gFilterDetails += filterFeature

    # if (node.children != nullptr):
    if (node.children.size() > 0):
        for child in node.children:
            searchFilters(child, gFilterList, gFilterDetails)
    # print (gFilterList)

def searchAdditionalFilterMembers (node, gFilterList, gFilterDetails):
    global gFilterList     
    global gFilterDetails
    if (node.type != "Comment"):
        # if (node.parent != None):
        #    print ("=============node.parent =", node.parent.name)

        # print ("=============node.name =", node.name)
        # print ("=============node.type =", node.type)
        # print ("=============node.lineStart =", node.lineStart, ", lineEnd =", node.lineEnd)
        #print ("===================0.node.children_size = ", node.children.size())
    
        if (node.children != None):
        #if (node.children.size() > 0):
            # print ("===================4.node.children_size = ", node.children.size())
            for child in node.children:
                #print ("===================child.name  = ", child.name)
                #print ("===================child.type  = ", child.type)
                searchAdditionalFilterMembers(child, gFilterList, gFilterDetails)

        if node.type == "Dot":
            child0 = node.children[0]
            child1 = node.children[1]
            for filterName in gFilterList:  #go thru each found filter     
                if (child0.name == filterName):  #if filter name matches
                        print ("=====", filterName, node.lineStart, child0.name, child1.name, node.parent.name, node.parent.type)
                        #gOutputJson += child0.name
                        if (node.parent != None):
                            parent = node.parent
                            #print ("====parent.type=", parent.type)
                        if(parent.parent != None):
                            grandparent = parent.parent
                        #else:
                        #    grandparent = None    

                        if (parent.children[1] != None)    
                            sibling = parent.children[1]
                        #else: 
                        #    sibling = None

                        # if (parent.type != None and parent.type == 'Assign'):
                        if (parent.type == 'Assign'):
                            nephew1 = sibling
    '''                                                    
                        else if (parent.type != None and parent.type == 'Pair'): 
                            if (sibling != None and sibling.children != None):
                                # num_nephew = len(sibling.children)
                                num_nephew = sibling.children.size()
                                if (num_nephew > 0):    
                                    nephew0 = sibling.children[0]
                                if (num_nephew > 1):
                                    nephew1 = sibling.children[1]
                        # print("save keyword:", grandparent.name)
                        filterFeatures = []
                        filterFeature = {"filterName":child0.name}
                        filterFeatures += filterFeature
                        filterFeature = {"memberName":child1.name}
                        filterFeatures += filterFeature
                        if (nephew1):
                            filterFeature = {"parameters":nephew1}
                        else:
                            filterFeature = {"parameters":"[]"}
                        filterFeatures += filterFeature
                        print ("filterFeatures:", filterFeatures)
                        gOutputJson += filterFeatures
                        break
                #end of if filtername        
            # end of for            
        # end of if dot                
    # end of if not comment
# end of def                    
        '''

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

def searchFilterCoordinates (node, gFilterList, gFilterDetails):
    global gFilterList     
    global gFilterDetails
    if (node.type == "Comment"):
        strComment = Str(node.name)
        #if(node.name.cmp(Str("###"), 3)):  # special comment for XY coordinates
        strComment.Find("###", 0)
        if(strComment.Find("###", 0)):  # special comment for XY coordinates
            strComment.trimmer ("###")
            coordinatesTree = ast.load(strComment)
            for filterName in gFilterList:  #go thru each found filter     
                if (strComment.Find(filterName += "x0", 0)):  #convert comment lines to uppercase

                #if (strComment.Find(filterName += "y0", 0)):
                #if (strComment.Find(filterName += "x1", 0)):
                #if (strComment.Find(filterName += "y1", 0)):
                    filterFeature += "'"
                    filterFeature += filterName
                    filterFeature += "':{"
                    filterFeature += "\n"
                    filterFeature += "'x0':'" 
                    filterFeature += nephew0.name
                    

                    gFilterDetails += filterFeature


def traverse_ast(node, level):
    # Print node name with its level
    if (node.name != None):
        print('---' * level,level, node.name, "(", node.type,")", " start = ", node.lineStart, " end = ", node.lineEnd)
    else:
        print('---' * level,level, "*NoName*","(", node.type,")", " start = ", node.lineStart, " end = ", node.lineEnd)

    # Print other nodes on the same level
    if node.children:
        # print()
        for child in node.children:
            traverse_ast(child, level+1)
    # else:
        # Leaf node
        # print(), no need to print the leaf, since it's been printed at the beginning of the function

tree = ast.load(xFilePath)
# traverse_ast (tree, 0)

searchFilters(tree, gFilterList, gFilterDetails)
print ("=================== Filter List ==================")
print (gFilterList)
print ("=================== Filter Details ==================")
print (gFilterDetails)

searchAdditionalFilterMembers(tree, gFilterList, gFilterDetails)
print ("=================== File Details #2 ==================")
print (gFilterDetails)

# searchFilterCoordinates(tree, gFilterList, gFilterDetails)

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
