const request = require('request')

function onAtalk() {
  if (this.program.args[1]) {
    var param = {input: this.program.args.slice(1).join(' ')};
    if (this.nconf.get('client_name')) param.client_name = this.nconf.get('client_name');
    if (this.nconf.get('sessionid')) param.sessionid = this.nconf.get('sessionid');
    if (this.nconf.get('recent')) param.recent = true;
      if(this.util.usingBotkey()){
        //  *@returns 1 if botkey exists or all three user_key, app_id, bot_key exists
        //  *@return 0 if botkey does not exists
        request.post({url: this.uri.atalkBkey(), form: this.params.composeBkey(param)}, this.response.talk);
      } else {
        request.post({url: this.uri.atalk(), form: this.params.compose(param)}, this.response.talk);
      }
  } else {
    console.log('usage: atalk <text...>');
  }
}

module.exports = onAtalk
