const request = require('request')
const readline = require('readline')

function onChat() {
  console.log(`Entering chat mode with ${this.nconf.get('botname') || 'bot'}`);
  console.log('Press Control-C at any time to exit');
  var rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
  });
  rl.setPrompt('user> ');
  rl.prompt();
  rl.on('line', function(cmd) {
      var param = {input: cmd};
      if (this.nconf.get('client_name'))
          param.client_name = this.nconf.get('client_name');
      if (this.nconf.get('sessionid'))
          param.sessionid = this.nconf.get('sessionid');
        if(this.util.usingBotkey()){
            //  *@usingBotkey() returns true if botkey exists or all three user_key, app_id, bot_key exists
            //  *@usingBotkey() return false if botkey does not exists
            request.post({url: this.uri.talkBkey(), form: this.params.composeBkey(param)}, this.response.chat(cmd));
          }else{
            request.post({url: this.uri.talk(), form: this.params.compose(param)}, this.response.chat(cmd));
          }
      });
}

module.exports = onChat
