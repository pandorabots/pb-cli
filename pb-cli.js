#!/usr/bin/env node

'use strict';

var fs = require('fs');
var readline = require('readline');
var glob = require('glob');
var nconf = require('nconf');
var path = require('path');
var program = require('commander');
var prompt = require('prompt');
var qs = require('querystring');
var request = require('request');
var unzip = require('unzip');
var url = require('url');
var Filequeue = require('filequeue');

var fq = new Filequeue(500);

var config = 'chatbot.json';

var sep = function (str) {
    return str ? '/' + str : '';
}

var composeUri = function (mode, botname, kind, filename) {
    var uri = {
	protocol: nconf.get('protocol'),
	hostname: nconf.get('hostname'),
	port: nconf.get('port')
    };
    var path = '';
    path += sep(nconf.get('prefix'));
    path += sep(mode);
    path += sep(conf_app_id());
    path += sep(botname);
    path += sep(kind);
    path += sep(filename);
    uri.pathname = path;
    return uri;
}

var composeParams = function (params) {
    params.user_key = conf_user_key();
    return params;
}

var listUri = function () {
    var uri = composeUri('bot', '', '', '');
    uri.query = composeParams({});
    return url.format(uri);
}

var botUri = function (botname) {
    var uri = composeUri('bot', botname, '', '');
    uri.query = composeParams({});
    return url.format(uri);
}

var fileUri = function (filename) {
    var ext = path.extname(filename);
    var base = path.basename(filename, ext);
    var kind = ext.slice(1);
    var botname = conf_botname();
    var uri;
    if (kind === 'pdefaults' || kind === 'properties')
	uri = composeUri('bot', botname, kind, '');
    else if (kind === 'map' || kind === 'set' || kind === 'substitution')
	uri = composeUri('bot', botname, kind, base);
    else if (kind === 'aiml')
	uri = composeUri('bot', botname, 'file', base + ext);
    else {
	console.log('illegal file name: ' + filename);
	return;
    }
    uri.query = composeParams({});
    return url.format(uri);
}

var zipUri = function () {
    var uri = composeUri('bot', conf_botname(), '', '');
    uri.query = composeParams({return: 'zip'});
    return url.format(uri);
}

var verifyUri = function () {
    var uri = composeUri('bot', conf_botname(), 'verify', '');
    uri.query = composeParams({});
    return url.format(uri);
}

var talkUri = function () {
    var uri = composeUri('talk', conf_botname(), '', '');
    return url.format(uri);
}

var okResp = function (error, response, body) {
    if (!response)
	console.log(error);
    else if (response.statusCode >= 400)
	console.log(body);
    else {
	var jObj = JSON.parse(body);
	if (jObj.status === 'ok')
	    console.log(jObj.status);
	else {
	    console.log(jObj.message);
	    if (jObj.results !== undefined)
		console.log(JSON.stringify(jObj.results[0], null, 2));
	}
    }
}

var deletePerf = function (botname) {
    if (nconf.get('yes')) {
	console.log('deleting bot "' + botname + '"');
	request.del(botUri(botname), deleteResp);
    }
    else {
	var prop  = {
	    message: 'Are you sure you want to delete bot "' + botname + '" (yes/no)?',
	    name: 'resp', required: true, validator: /^(y|yes|n|no)$/i,
	    warning: 'please answer yes or no.'
	};
	prompt.get(prop, function (error, result) {
	    var yesRe = /^(y|yes)$/i;
	    if (error) {
		console.log("aborted.");
		process.exit(2);
	    }
	    else if (yesRe.test(result.resp))
		request.del(botUri(botname), deleteResp);
	    else
		console.log('skipped.');
	});
    }
}

var deleteResp = function (error, response, body) {
    if (!response)
	console.log(error);
    else if (response.statusCode >= 400)
	console.log(body);
    else {
	var jObj = JSON.parse(body);
	if (jObj.status === 'ok')
	    console.log(jObj.status);
	else {
	    console.log(jObj.message);
	    if (!nconf.get('yes')) {
		var prop  = {
		    message: 'Re-enter the name of the bot to delete:',
		    name: 'botname',
		    required: true
		};
		prompt.get(prop, function (error, result) {
		    if (error) {
			console.log("aborted.");
			process.exit(2);
		    }
		    else
			deletePerf(result.botname);
		});
	    }
	}
    }
}

var retryOnFile = function (file, cb) {
    fs.exists(file, function (doesExist) {
	if (doesExist)
	    cb(file);
	else {
	    console.log('file not found');
	    if (!nconf.get('yes')) {
		var prop  = {
		    message: 'Re-enter the name of file to upload:',
		    name: 'input',
		    required: true
		};
		prompt.get(prop, function (error, result) {
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

var removePerf = function (filename) {
    if (nconf.get('yes'))
	request.del(fileUri(filename), removeResp);
    else {
	var prop  = {
	    message: 'Are you sure you want to remove file "' + filename + '" (yes/no)?',
	    name: 'resp', required: true, validator: /^(y|yes|n|no)$/i,
	    warning: 'please answer yes or no.'
	};
	prompt.get(prop, function (error, result) {
	    var yesRe = /^(y|yes)$/i;
	    if (error) {
		console.log("aborted.");
		process.exit(2);
	    }
	    else if (yesRe.test(result.resp))
		request.del(fileUri(filename), removeResp);
	    else
		console.log('skipped.');
	});
    }
}

var removeResp = function (error, response, body) {
    if (!response)
	console.log(error);
    else if (response.statusCode >= 400)
	console.log(body);
    else {
	var jObj = JSON.parse(body);
	if (jObj.status === 'ok')
	    console.log(jObj.status);
	else {
	    console.log("file not found");
	    if (!nconf.get('yes')) {
		var prop  = {
		    message: 'Re-enter the name of file to remove:',
		    name: 'filename',
		    required: true
		};
		prompt.get(prop, function (error, result) {
		    if (error) {
			console.log("aborted.");
			process.exit(2);
		    }
		    else
			removePerf(result.filename);
		});
	    }
	}
    }
}

var listBotResp = function (error, response, body) {
    if (!response)
	console.log(error);
    else if (response.statusCode >= 400)
	console.log(body);
    else {
	var jObj = JSON.parse(body);
	if (response.statusCode === 200) {
	    jObj.forEach (function (entry) {
		console.log(entry.botname);
	    });
	}
	else
	    console.log(jObj.message);
    }
}

var fileList = function (jObj) {
    var files = [];
    if (jObj.properties.length) files.push(jObj.botname + ".properties");
    if (jObj.pdefaults.length) files.push(jObj.botname + ".pdefaults");
    jObj.files.forEach (function (entry) { files.push(entry.name); });
    jObj.sets.forEach (function (entry) { files.push(entry.name + ".set"); });
    jObj.maps.forEach (function (entry) { files.push(entry.name + ".map"); });
    jObj.substitutions.forEach (function (entry) { files.push(entry.name + ".substitution"); });
    return files;
}

var listFileResp = function (error, response, body) {
    if (!response)
	console.log(error);
    else if (response.statusCode >= 400)
	console.log(body);
    else {
	var jObj = JSON.parse(body);
	if (response.statusCode === 200)
	    fileList(jObj).forEach (function (file) { console.log(file); });
	else
	    console.log(jObj.message);
    }
}

var pullResp = function (error, response, body) {
    if (!response)
	console.log(error);
    else if (response.statusCode >= 400)
	console.log(body);
    else {
	var jObj = JSON.parse(body);
	if (response.statusCode === 200) {
	    fileList(jObj).forEach (function (file) {
		request.get(fileUri(file)).pipe(fs.createWriteStream(file));
	    });
	}
	else
	    console.log(jObj.message);
    }
}

var mapAll = function (jObj, func) {
    for (var i in jObj) {
	jObj[i] = func.call(this, jObj[i]);
	if (jObj[i] !== null && typeof (jObj[i]) == 'object')
	    jObj[i] = mapAll(jObj[i], func);
    }
    return jObj;
}

var removeNewLine = function (obj) {
    if (typeof obj == 'string')
	return obj.replace(/\n/g, '');
    else
	return obj;
}

var talkResp = function (error, response, body) {
    if (!response)
	console.log(error);
    else if (response.statusCode >= 400)
	console.log(body);
    else {
	var jObj = JSON.parse(body);
	if (jObj.status === 'ok') {
	    nconf.set('sessionid', jObj.sessionid);
	    if (nconf.get('extra') || nconf.get('trace'))
		console.log(JSON.stringify(mapAll(jObj, removeNewLine), null, 2));
	    else {
		jObj.responses.forEach (function (entry) {
		    console.log(entry);
		});
	    }
	}
	else
	    console.log(jObj.message);
    }
}

var chatResp = function(error, response, body) {
    if (!response)
        console.log(error);
    else if (response.statusCode >= 400)
	console.log(body);
    else {
	var jObj = JSON.parse(body);
	if (jObj.status === 'ok') {
	    nconf.set('sessionid', jObj.sessionid);
	    jObj.responses.forEach (function (entry) {
	        console.log(conf_botname() + '> ' + entry);
	    });
	}
	else console.log(jObj.message);
    }
    rl.prompt();
}

var conf_app_id = function () {
    var app_id = nconf.get('app_id');
    if (app_id === undefined) {
	console.log('app_id required. use --app_id <app_id> or do init');
	process.exit(1);
    }
    return app_id;
}

var conf_user_key = function () {
    var user_key = nconf.get('user_key');
    if (user_key === undefined) {
	console.log('user_key required. use --user_key <user_key> or do init');
	process.exit(1);
    }
    return user_key;
}

var conf_botname = function () {
    var botname = nconf.get('botname');
    if (botname === undefined) {
	console.log('botname required. use --botname <botname> or do init');
	process.exit(1);
    }
    return botname;
}

var options = {
    protocol: 'https',
    hostname: 'aiaas.pandorabots.com',
    port: undefined,
    prefix: undefined,
    app_id: undefined,
    user_key: undefined,
    botname: undefined,
    client_name: undefined,
    sessionid: undefined,
    extra: undefined,
    reset: undefined,
    trace: undefined,
    reload: undefined,
    recent: undefined,
    all: undefined,
    yes: undefined
};

prompt.message = "";
prompt.delimiter = "";

nconf.env();
nconf.file({file: config});
nconf.defaults(options);

program
    .version('0.0.1')
    .usage('command [options] <file ...>')
    .option('-p, --protocol <protocol>', 'protocol')
    .option('-h, --hostname <hostname>', 'hostname')
    .option('-P, --port <port>', 'port number')
    .option('-X, --prefix <prefix>', 'prefix path of URL')
    .option('-i, --app_id <app_id>', 'app_id')
    .option('-k, --user_key <user_key>', 'user_key')
    .option('-b, --botname <botname>', 'name of bot')
    .option('-c, --client_name <client_name>', 'name of client')
    .option('-s, --sessionid <sessionid>', 'session id of conversation')
    .option('-e, --extra', 'provides additional information with bot response')
    .option('-M, --reset', 'reset the bot memory')
    .option('-t, --trace', 'adds trace data into response')
    .option('-r, --reload', 'force system to reload bot')
    .option('-R, --recent', 'use most recently compiled version of bot')
    .option('-a, --all', 'downloads all files')
    .option('-y, --yes', 'do not prompt anything; assume yes to all yes/no queries')
    .parse(process.argv);

for (var key in options) {
    if (program[key])
	nconf.set(key, program[key]);
}

// Initialize
if (program.args[0] === 'init') {
    var props = [
	{message: 'app_id? (required)', name: 'app_id',
	    required: true, validator: /^[0-9a-z]+$/,
	    warning: 'app_id must consist of alphanumeric, lowercase characters'},
	{message: 'user_key? (required)', name: 'user_key',
	    required: true, validator: /^[0-9a-z]+$/,
	    warning: 'user_key must consist of alphanumeric, lowercase characters'},
	{message: 'botname? (recommended)', name: 'botname'},
	{message: 'hostname? (optional)', name: 'hostname'}
    ];
    prompt.get(props, function (error, result) {
	if (error) {
	    console.log("aborted.");
	    process.exit(2);
	}
	else {
	    var prop = {};
	    for (var key in result) {
		if (result[key])
		    prop[key] = result[key];
	    }
	    fs.writeFileSync(config, JSON.stringify(prop, null, 4));
	}
    });
}

// List names of bots
else if (program.args[0] === 'list') {
    request.get(listUri(), listBotResp);
}

// Create a bot
else if (program.args[0] === 'create') {
    request.put(botUri(conf_botname()), okResp);
}

// Delete a bot
else if (program.args[0] === 'delete') {
    deletePerf(conf_botname());
}

// Upload a file
else if (program.args[0] === 'upload') {
    if (program.args[1]) {
	retryOnFile(program.args[1], function (entry) {
	    fs.createReadStream(entry).pipe(request.put(fileUri(entry), okResp));
	});
    }
    else {
	console.log('usage: upload <filename>');
    }
}

// Upload all files at once
else if (program.args[0] === 'push') {
    var dirpath = '*.{pdefaults,properties,map,set,substitution,aiml}';
    if (program.args[1]) {
        dirpath = path.join(program.args[1], dirpath); 
    }
    var files = glob.sync(dirpath, {});
    if (files.length) {
	files.forEach (function (entry) {
	    console.log('uploading: ' + entry);
	    fq.createReadStream(entry).pipe(request.put(fileUri(entry), okResp));
            
	});
    }
    else {
	console.log('no bot files found');
    }
}

// Remove a file
else if (program.args[0] === 'remove') {
    if (program.args[1])
	removePerf(program.args[1]);
    else
	console.log('usage: remove <filename>');
}

// Download a file
else if (program.args[0] === 'download') {
    if (program.args[1]) {
	request.get(fileUri(program.args[1])).pipe(fs.createWriteStream(program.args[1]));;
    }
    else {
	console.log('usage: download <filename>');
    }
}

// List files of bot
else if (program.args[0] === 'get' && !program.all) {
    request.get(botUri(conf_botname()), listFileResp);
}

// Retrieve all files as ZIP
else if (program.args[0] === 'get' && program.all) {
    request.get(zipUri()).pipe(fs.createWriteStream(conf_botname() + '.zip'));
}

// Retrieve all files at once
else if (program.args[0] === 'pull') {
    //request.get(zipUri()).pipe(unzip.Extract({path: conf_botname()}));
    //it should work however gets freeze after zip have been downloaded; ugly workaround below
    request.get(botUri(conf_botname()), pullResp);
}

// Compile a bot
else if (program.args[0] === 'compile') {
    request.get(verifyUri(), okResp);
}

// Talk to a bot
else if (program.args[0] === 'talk') {
    if (program.args[1]) {
	var param = {input: program.args.slice(1).join(' ')};
	if (nconf.get('client_name')) param.client_name = nconf.get('client_name');
	if (nconf.get('sessionid')) param.sessionid = nconf.get('sessionid');
	if (nconf.get('extra')) param.extra = true;
	if (nconf.get('reset')) param.reset = true;
	if (nconf.get('trace')) param.trace = true;
	if (nconf.get('reload')) param.reload = true;
	if (nconf.get('recent')) param.recent = true;
	request.post({url: talkUri(), form: composeParams(param)}, talkResp);
    }
    else
	console.log('usage: talk <text...>');
}

// Chat mode
else if (program.args[0] === 'chat') {
    console.log('Entering chat with ' + conf_botname());
    console.log('Press Control-C at any time to exit');
    var rl = readline.createInterface({
        input: process.stdin, 
        output: process.stdout
    });
    rl.setPrompt('user> ');
    rl.prompt();
    rl.on('line', function(cmd) {
        var param = {input: cmd};
        if (nconf.get('client_name')) 
            param.client_name = nconf.get('client_name');
        if (nconf.get('sessionid')) 
            param.sessionid = nconf.get('sessionid');
        request.post({url: talkUri(), form: composeParams(param)}, chatResp);
    });
}

else if (program.args[0] === undefined)
    console.log('usage: <command> [--options...]');
else {
    console.log('invalid command: ' + program.args[0]);
    process.exit(1);
}

