const fs = require('fs')
const readline = require('readline')

function writeLogFile (input, output) {
  var arr = "";
  var note = `${input}\t${output}\n`;

  try{
    arr = fs.readFileSync('response-log.tsv').toString();
  }catch(e){
    arr = "Input\tOutput\n";
  }
  arr += note;
  fs.writeFileSync('response-log.tsv', arr)
};

function updatedChatResp(input, rl) {
  var logString = null;
  return ((error, response, body) => {
    if (!response)
      console.log(error);
    else if (response.statusCode >= 400) {
      this.errors.talk(response.statusCode)
    } else {
      var jObj = JSON.parse(body);
      if (jObj.status === 'ok') {
        if(jObj.client_name && jObj.client_name != this.nconf.get('client_name')) {
          console.log('client_name:'+ jObj.client_name);
          this.nconf.set('client_name', jObj.client_name)
        }
        this.nconf.set('sessionid', jObj.sessionid);
        jObj.responses.forEach ((entry) => {
        console.log(`${this.nconf.get('botname') || 'bot'}> ${entry}`);
        writeLogFile(input,entry);
    });
  }
	else console.log(jObj.message);
    }
    rl.prompt();
  })
}

module.exports = updatedChatResp
