exports.createDelegateListener = function(host){
	return function(type, selector, fn ){
		host.addEventListener(type, function(e){
			let target = e.target;
			while(target && target !== host && !target.matches(selector) ) {
				target = target.parentNode;
			}
			if(target && target !== host ) {
					return fn.call(target, e);
			}
		}, false);
	};
};

exports.once = function(host, eventType, fn){
	fnb = function(...args){
		fn.apply(host, args);
		host.removeEventListener(eventType, fnb);
	};
	host.addEventListener(eventType, fnb);
}

exports.debounce = function(fn, delay){
  var timer = null;
  return function () {
    var context = this, args = arguments;
    clearTimeout(timer);
    timer = setTimeout(function () {
      fn.apply(context, args);
    }, delay);
  };
}

exports.getHash = function(length){
	function s4() {
		return Math.floor((1 + Math.random()) * 0x10000)
			.toString(16)
			.substring(1);
	};
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

exports.isDebug = function(){
	if("WIKIDEBUG" in process.env && process.env.WIKIDEBUG === "true"){
		return true;
	};
	return false;
}

exports.delay = function(ms){
	return new Promise((resolve, reject)=>{
		setTimeout(()=>{
			resolve();
		}, ms);
	})
}