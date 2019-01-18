const request = require('request')

function listExtraBotResp (error, response, body) {
    if (!response)
    	console.log(error);
    else if (response.statusCode >= 400)
      this.errors.bots(response.statusCode)
    else {
    	var jObj = JSON.parse(body);
    	if (response.statusCode === 200) {
          console.log(jObj);
    	}
    	else
    	    console.log(jObj.message);
    }
}

function listBotResp(error, response, body) {
    if (!response)
    	console.log(error);
    else if (response.statusCode >= 400)
      this.errors.bots(response.statusCode)
    else {
    	var jObj = JSON.parse(body);
    	if (response.statusCode === 200) {
          jObj.forEach (function (entry) {
        		console.log(entry.botname);
    	    });
    	}
    	else
    	    console.log(jObj.message);
    }
}


function onList() {
  if (this.nconf.get('extra')){
    request.get(this.uri.list(), listExtraBotResp.bind(this));
  } else {
    request.get(this.uri.list(), listBotResp.bind(this));
  }
}

module.exports = onList
