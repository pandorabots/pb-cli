const fs = require('fs')
const request = require('request')
const path = require('path')

function pullBotFiles (filePath) {
  var pullResp = function (error, response, body) {
      if (!response)
  	   console.log(error);
      else if (response.statusCode >= 400)
  	   this.errors.files(response.statusCode)
      else {
      	var jObj = JSON.parse(body);
      	if (response.statusCode === 200) {
      	    this.util.fileList(jObj).forEach (function (file) {
          		request.get(this.uri.file(file)).pipe(fs.createWriteStream(path.join(filePath, file)));
      	    });
      	}
      	else
      	    console.log(jObj.message);
      }
  }
  request.get({url: this.uri.bot(this.params.botname()), headers: {'Connection': 'keep-alive'}}, this.response.pull);
}


function onPull() {
  //request.get(zipUri()).pipe(unzip.Extract({path: conf_botname()}));
  //it should work however gets freeze after zip have been downloaded; ugly workaround below
  var outputPath = this.program.args[1] || process.cwd()
  pullBotFiles.bind(this)(outputPath)
}

module.exports = onPull
