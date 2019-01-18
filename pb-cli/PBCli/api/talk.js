const request = require('request')

function onTalk() {
  if (this.program.args[1]) {
      var param = {input: this.program.args.slice(1).join(' ')};
      if (this.nconf.get('client_name')) param.client_name = this.nconf.get('client_name');
      if (this.nconf.get('sessionid')) param.sessionid = this.nconf.get('sessionid');
      if (this.nconf.get('extra')) param.extra = true;
      if (this.nconf.get('reset')) param.reset = true;
      if (this.nconf.get('trace')) param.trace = true;
      if (this.nconf.get('reload')) param.reload = true;
      if (this.nconf.get('recent')) param.recent = true;
        if(this.util.usingBotkey()){
          //  *@usingBotkey()-> true if botkey exists or all three user_key, app_id, bot_key exists
          //  *@usingBotkey()-> false if botkey does not exists
          request.post({url: this.uri.talkBkey(), form: this.params.composeBkey(param)}, this.response.talk);
        } else {
            request.post({url: this.uri.talk(), form: this.params.compose(param)}, this.response.talk);
        }
  } else {
    console.log('usage: talk <text...>');
  }
}

module.exports = onTalk
