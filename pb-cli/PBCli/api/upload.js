const fs = require('fs')
const request = require('request')

function retryOnFile (file, cb) {
    fs.exists(file, (doesExist) => {
	if (doesExist)
	    cb(file);
	else {
	    console.log('file not found');
	    if (!this.nconf.get('yes')) {
		var prop  = {
		    message: 'Re-enter the name of file to upload:',
		    name: 'input',
		    required: true
		};
		this.prompt.get(prop, (error, result) => {
		    if (error) {
			console.log("aborted.");
			process.exit(2);
		    }
		    else
			retryOnFile(result.input, cb);
		});
	    }
	}
    });
}

function onUpload() {
  if (this.program.args[1]) {
    retryOnFile(this.program.args[1], (entry) => {
      fs.createReadStream(entry).pipe(request.put(this.uri.file(entry), this.response.file));
    });
  } else {
    console.log('usage: upload <filename>');
  }
}

module.exports = onUpload
