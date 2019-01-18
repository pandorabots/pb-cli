const request = require('request')

function deletePerf(botname) {
    if (this.nconf.get('yes')) {
	console.log('deleting bot "' + botname + '"');
	request.del(this.uri.bot(botname), this.response.delete);
    }
    else {
	var prop  = {
	    message: 'Are you sure you want to delete bot "' + botname + '" (yes/no)?',
	    name: 'resp', required: true, validator: /^(y|yes|n|no)$/i,
	    warning: 'please answer yes or no.'
	};
	this.prompt.get(prop, function (error, result) {
	    var yesRe = /^(y|yes)$/i;
	    if (error) {
		console.log("aborted.");
		process.exit(2);
	    }
	    else if (yesRe.test(result.resp))
		request.del(this.uri.bot(botname), this.response.delete);
	    else
		console.log('skipped.');
	});
    }
}

function removePerf(filename) {
    if (this.nconf.get('yes'))
	request.del(this.uri.file(filename), this.response.remove);
    else {
	var prop  = {
	    message: 'Are you sure you want to remove file "' + filename + '" (yes/no)?',
	    name: 'resp', required: true, validator: /^(y|yes|n|no)$/i,
	    warning: 'please answer yes or no.'
	};
	this.prompt.get(prop, function (error, result) {
	    var yesRe = /^(y|yes)$/i;
	    if (error) {
		console.log("aborted.");
		process.exit(2);
	    }
	    else if (yesRe.test(result.resp))
		request.del(this.uri.file(filename), this.response.remove);
	    else
		console.log('skipped.');
	});
    }
}

function usingBotkey() {
  var ukey = this.nconf.get('user_key');
  var akey = this.nconf.get('app_id');
  var bname = this.nconf.get('botkey');
  if(ukey && akey && bname){
    return true;
  } else {
    if(bname){
      return true;
    } else {
      return false;
    }
  }
}

function fileList (jObj) {
    var files = [];
    if (jObj.properties.length) files.push(jObj.botname + ".properties");
    if (jObj.pdefaults.length) files.push(jObj.botname + ".pdefaults");
    jObj.files.forEach (function (entry) { files.push(entry.name); });
    jObj.sets.forEach (function (entry) { files.push(entry.name + ".set"); });
    jObj.maps.forEach (function (entry) { files.push(entry.name + ".map"); });
    jObj.substitutions.forEach (function (entry) { files.push(entry.name + ".substitution"); });
    return files;
}


module.exports = (thisValue) => {
  return {
    usingBotkey: usingBotkey.bind(thisValue),
    deletePerf: deletePerf.bind(thisValue),
    removePerf: removePerf.bind(thisValue),
    fileList: fileList.bind(thisValue)
  }
}
