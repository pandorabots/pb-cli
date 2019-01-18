const Filequeue = require('filequeue')
const fq = new Filequeue(500)

const request = require('request')
const glob = require('glob')
const path = require('path')

function onPush() {
  var dirpath = '*.{pdefaults,properties,map,set,substitution,aiml}';
  if (this.program.args[1]) {
      dirpath = path.join(this.program.args[1], '**', dirpath);
  }
  var files = glob.sync(dirpath, {matchBase: true});
  if (files.length) {
    files.forEach ((entry) => {
      console.log('uploading: ' + entry);
      fq.createReadStream(entry).pipe(request.put(this.uri.file(entry), this.response.file));
    });
  }
  else {
    console.log('no bot files found');
  }
}

module.exports = onPush
