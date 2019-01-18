const request = require('request')

function onCompile() {
  request.get(this.uri.verify(), this.response.verify);
}

module.exports = onCompile
