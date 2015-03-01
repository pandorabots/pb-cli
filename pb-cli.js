#!/usr/bin/env node

'use strict';

var fs = require('fs');
var glob = require('glob');
var nconf = require('nconf');
var path = require('path');
var program = require('commander');
var prompt = require('prompt');
var qs = require('querystring');
var request = require('request');
var unzip = require('unzip');
var url = require('url');

var config = 'chatbot.json';

var sep = function (str) {
    return str ? '/' + str : '';
}

var composeUri = function (mode, botname, kind, filename) {
    var uri = {
	protocol: nconf.get('protocol'),
	hostname: nconf.get('hostname')
    }
    var path = mode;
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

var botUri = function () {
    var uri = composeUri('bot', conf_botname(), '', '');
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
    var jObj = JSON.parse(body);
    if (jObj.status === 'ok')
	console.log(jObj.status)
    else {
	console.log(jObj.message)
	if (jObj.results !== undefined)
	    console.log(JSON.stringify(jObj.results[0], null, 2))
    }
}

var deleteResp = function (error, response, body) {
    var jObj = JSON.parse(body);
    if (jObj.status === 'ok')
	console.log(jObj.status)
    else {
	console.log(jObj.message);
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
	    else {
		nconf.set('botname', result.botname);
		request.del(botUri(), deleteResp);
	    }
	});
    }
}

var removeResp = function (error, response, body) {
    var jObj = JSON.parse(body);
    if (jObj.status === 'ok')
	console.log(jObj.status)
    else {
	console.log("file not found");
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
	    else {
		request.del(fileUri(result.filename), removeResp);
	    }
	});
    }
}

var listBotResp = function (error, response, body) {
    var jObj = JSON.parse(body);
    if (response.statusCode === 200) {
	jObj.forEach (function (entry) {
	    console.log(entry.botname);
	});
    }
    else
	console.log(jObj.message)
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
    var jObj = JSON.parse(body);
    if (response.statusCode === 200)
	fileList(jObj).forEach (function (file) { console.log(file); });
    else
	console.log(jObj.message)
}

var pullResp = function (error, response, body) {
    var jObj = JSON.parse(body);
    if (response.statusCode === 200) {
	fileList(jObj).forEach (function (file) {
	    request.get(fileUri(file)).pipe(fs.createWriteStream(file));
	});
    }
    else
	console.log(jObj.message)
}

var talkResp = function (error, response, body) {
    var jObj = JSON.parse(body);
    if (jObj.status === 'ok') {
	nconf.set('sessionid', jObj.sessionid);
	if (nconf.get('extra') || nconf.get('trace')) 
	    console.log(jObj);
	else {
	    jObj.responses.forEach (function (entry) {
		console.log(entry);
	    });
	}
    }
    else
	console.log(jObj.message)
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
    all: undefined
}

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
		if (result[key]) {
		    prop[key] = result[key];
		}
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
    request.put(botUri(), okResp);
}

// Delete a bot
else if (program.args[0] === 'delete') {
    request.del(botUri(), deleteResp);
}

// Upload a file
else if (program.args[0] === 'upload') {
    if (program.args[1]) {
	fs.createReadStream(program.args[1]).pipe(request.put(fileUri(program.args[1]), okResp))
    }
    else {
	console.log('usage: upload <filename>');
    }
}

// Upload all files at once
else if (program.args[0] === 'push') {
    var files = glob.sync('*.{pdefaults,properties,map,set,substitution,aiml}', {});
    if (files.length) {
	files.forEach (function (entry) {
	    console.log('uploading: ' + entry);
	    fs.createReadStream(entry).pipe(request.put(fileUri(entry), okResp))
	});
    }
    else {
	console.log('no bot files found');
    }
}

// Remove a file
else if (program.args[0] === 'remove') {
    if (program.args[1]) {
	request.del(fileUri(program.args[1]), removeResp);
    }
    else {
	console.log('usage: remove <filename>');
    }
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
    request.get(botUri(), listFileResp);
}

// Retrieve all files as ZIP
else if (program.args[0] === 'get' && program.all) {
    request.get(zipUri()).pipe(fs.createWriteStream(conf_botname() + '.zip'));
}

// Retrieve all files at once
else if (program.args[0] === 'pull') {
    //request.get(zipUri()).pipe(unzip.Extract({path: conf_botname()}));
    //it should work however gets freeze after zip have been downloaded; ugly workaround below
    request.get(botUri(), pullResp);
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
	request.post(talkUri(), talkResp).form(composeParams(param));
    }
    else {
	console.log('usage: talk <text...>');
    }
}

else if (program.args[0] === undefined)
    console.log('usage: <command> [--options...]');
else {
    console.log('invalid command: ' + program.args[0]);
    process.exit(1);
}

