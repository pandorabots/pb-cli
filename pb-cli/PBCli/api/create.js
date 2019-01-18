const request = require('request')

function onCreate() {
    request.put(this.uri.bot(this.params.botname()), this.response.bot);
}

module.exports = onCreate
