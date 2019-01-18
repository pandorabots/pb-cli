const fs = require('fs')
const request = require('request')

function listExtraFileResp (error, response, body) {
    if (!response)
	    console.log(error);
    else if (response.statusCode >= 400)
	    this.errors.bots(response.statusCode)
    else {
    	var jObj = JSON.parse(body);
    	if (response.statusCode === 200)
    	    console.log(jObj);
    }
}

function onGet(returnZip=false) {
  if(returnZip) {
    request.get(this.uri.zip()).pipe(fs.createWriteStream(this.params.botname() + '.zip'));
  } else {
    if(this.nconf.get('extra')){
        request.get(this.uri.bot(this.params.botname()), listExtraFileResp.bind(this));
    } else {
      request.get(this.uri.bot(this.params.botname()), this.response.list);
    }
  }
}

module.exports = onGet
