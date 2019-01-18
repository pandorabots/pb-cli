const fs = require('fs')
const request = require('request')
const path = require('path')

function downloadBotFile (fileName, outputPath) {
  var onResp = (error, response, body) => {
    if (!response)
      console.log(error)
    else if(response.statusCode >= 400)
      this.errors.files(response.statusCode)
    else {
      var jObj;
      try {
        jObj = JSON.parse(body);
      } catch(error) {
        jObj = body;
      }
      if (response.statusCode === 200) {
        const stream = fs.createWriteStream(path.join(outputPath, fileName))
        stream.write(body, 'utf8')
      }
      else
          console.log(jObj.message);
    }
  }

  request.get(this.uri.file(fileName), onResp);
}

function onDownload() {
  if (this.program.args[1]) {
    var fileName = this.program.args[1]
    var outputPath = this.program.args[2] || process.cwd()
    downloadBotFile.bind(this)(fileName, outputPath)
  }
  else {
    console.log('usage: download <filename>');
  }
}

module.exports = onDownload
