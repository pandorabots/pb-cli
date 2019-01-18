function removeNewLine(obj) {
    if (typeof obj == 'string')
	return obj.replace(/\n/g, '');
    else
	return obj;
}

function mapAll (jObj, func) {
    for (var i in jObj) {
	jObj[i] = func.call(this, jObj[i]);
	if (jObj[i] !== null && typeof (jObj[i]) == 'object')
	    jObj[i] = mapAll(jObj[i], func);
    }
    return jObj;
}

function talkResp(error, response, body) {
    if (!response)
      console.log(error);
    else if (response.statusCode >= 400)
      this.errors.talk(response.statusCode)
    else {
    	var jObj = JSON.parse(body);
    	if (jObj.status === 'ok') {
          if(jObj.client_name && jObj.client_name != this.nconf.get('client_name')) {
            this.nconf.set('client_name', jObj.client_name)
            console.log(`atalk: client_name was set to ${jObj.client_name}`)
          }
    	    this.nconf.set('sessionid', jObj.sessionid);
    	    if (this.nconf.get('extra') || this.nconf.get('trace'))
    		    console.log(JSON.stringify(mapAll.bind(this)(jObj, removeNewLine), null, 2));
    	    else {
        		jObj.responses.forEach ((entry) => {
              console.log(entry);
        		});
	        }
	     }
	     else
	       console.log(jObj.message);
    }
}

module.exports = talkResp
