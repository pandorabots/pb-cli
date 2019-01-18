function onListResponse (error, response, body) {
    if (!response)
	    console.log(error);
    else if (response.statusCode >= 400)
	    this.errors.bots(response.statusCode)
    else {
    	var jObj = JSON.parse(body);
    	if (response.statusCode === 200)
    	    this.util.fileList(jObj).forEach (function (file) { console.log(file); });
    	else
    	    console.log(jObj.message);
    }
}


module.exports = onListResponse
