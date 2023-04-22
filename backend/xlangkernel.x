
def kernel_main():
	output_list =[]
	_lock = object()
	fragModule = new_module()
	def output_redirect(info):
		global output_list
		_lock.lock()
		output_list+=info
		_lock.unlock()
	def process(code):
		print("run process:\n",code)
		fragModule.runfragment(code,post=True)
	def get_outputs():
		global output_list
		_lock.lock()
		l = tostring(output_list)
		output_list =[]
		_lock.unlock()
		return l
	fragModule.setprimitive("Output",output_redirect)

class KernelManager():

	_remoteMap =dict()
	_lock = object()
	_lastPortUsed = 10000
	def runCode(sessionId,code):
		remote_module = None
		this._lock.lock()
		if this._remoteMap.has(sessionId):
			remote_module = _remoteMap[sessionId]
		else:
			port = this._lastPortUsed
			this._lastPortUsed +=2
			this._lock.unlock()
			print("KernelManager.runCode:${port}","and:",this._lastPortUsed)
			remote_module = this.start(port)
			this._lock.lock()
			this._remoteMap[sessionId] = remote_module
		this._lock.unlock()
		if remote_module != None:
			remote_module.process(code)
	def fetchOutputs(sessionId):
		remote_module = None
		this._lock.lock()
		if this._remoteMap.has(sessionId):
			remote_module = this._remoteMap[sessionId]
		this._lock.unlock()
		retVal = None
		if remote_module != None:
			retVal = remote_module.get_outputs()
		return retVal

	def start(port):
		run_param = "-event_loop -c lrpc_listen(${port},False)"
		run_new_instance(run_param)
		import builtin as remote_proc thru 'lrpc:${port}'
		code = kernel_main.getcode()
		remote_module = remote_proc.new_module()
		remote_module.runfragment(code)
		return remote_module
