function conf_app_id() {
    var app_id = this.nconf.get('app_id');
    if (app_id === undefined) {
	console.log('app_id required. use --app_id <app_id> or do init');
	process.exit(1);
    }
    return app_id;
}

function conf_user_key() {
    var user_key = this.nconf.get('user_key');
    if (user_key === undefined) {
	console.log('user_key required. use --user_key <user_key> or do init');
	process.exit(1);
    }
    return user_key;
}

function conf_botkey() {
    var botkey = this.nconf.get('botkey');
    if (botkey === undefined) {
	console.log('botkey required. use --botkey <botkey> or do init');
	process.exit(1);
    }
    return botkey;
}

function conf_botname() {
    var botname = this.nconf.get('botname');
    if (botname === undefined) {
	console.log('botname required. use --botname <botname> or do init');
	process.exit(1);
    }
    return botname;
}

function composeParams(params) {
  params.user_key = this.params.user_key();
  return params;
}

function composeBotkeyParams(params) {
  params.botkey = this.params.botkey();
  return params;
}

module.exports = (thisValue) => {
  return {
    compose: composeParams.bind(thisValue),
    composeBkey: composeBotkeyParams.bind(thisValue),
    botname: conf_botname.bind(thisValue),
    botkey: conf_botkey.bind(thisValue),
    user_key: conf_user_key.bind(thisValue),
    app_id: conf_app_id.bind(thisValue)
  }
}
