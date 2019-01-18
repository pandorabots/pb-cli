const request = require('request')
const readline = require('readline')

function onAchat() {
  console.log(`Entering achat mode with ${this.nconf.get('botname') || 'bot'}`);
  console.log('Press Control-C at any time to exit');
  var rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
  });
  rl.setPrompt('user> ');
  rl.prompt();
  rl.on('line', (cmd) => {
      var param = {input: cmd};
      if (this.nconf.get('client_name'))
          param.client_name = this.nconf.get('client_name');
      if (this.nconf.get('sessionid'))
          param.sessionid = this.nconf.get('sessionid');
        if(this.util.usingBotkey()){
          //  *@usingBotkey() returns true if botkey exists or all three user_key, app_id, bot_key exists
          //  *@usingBotkey() return false if botkey does not exists
          request.post({url: this.uri.atalkBkey(), form: this.params.composeBkey(param)}, this.response.chat(cmd, rl));
        }else{
          request.post({url: this.uri.atalk(), form: this.params.compose(param)}, this.response.chat(cmd, rl));
        }
  });
}

module.exports = onAchat
