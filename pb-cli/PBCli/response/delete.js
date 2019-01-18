function onDelete (error, response, body) {
    if (!response)
	   console.log(error);
    else if (response.statusCode >= 400)
      this.errors.bots(response.statusCode)
    else {
    	var jObj = JSON.parse(body);
    	if (jObj.status === 'ok')
    	    console.log(jObj.status);
    	else {
    	    console.log(jObj.message);
    	    if (!this.nconf.get('yes')) {
        		var prop  = {
        		    message: 'Re-enter the name of the bot to delete:',
        		    name: 'botname',
        		    required: true
        		};
            this.prompt.get(prop, (error, result) => {
        		    if (error) {
        			console.log("aborted.");
        			process.exit(2);
        		    }
        		    else
        			this.util.deletePerf(result.botname);
        		});
    	    }
    	}
    }
}

module.exports = onDelete
