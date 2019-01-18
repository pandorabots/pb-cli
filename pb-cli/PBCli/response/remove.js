function removeResp(error, response, body) {
    if (!response)
	   console.log(error);
    else if (response.statusCode >= 400)
	   this.errors.files(response.statusCode)
    else {
	var jObj = JSON.parse(body);
	if (jObj.status === 'ok')
	    console.log(jObj.status);
	else {
	    console.log("file not found");
	    if (!this.nconf.get('yes')) {
		var prop  = {
		    message: 'Re-enter the name of file to remove:',
		    name: 'filename',
		    required: true
		};
		this.prompt.get(prop, (error, result) => {
		    if (error) {
			console.log("aborted.");
			process.exit(2);
		    }
		    else
			this.util.removePerf(result.filename);
		});
	    }
	}
    }
}

module.exports = removeResp
