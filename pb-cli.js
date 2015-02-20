#!/usr/bin/env node

'use strict';

var fs = require('fs');
var glob = require('glob');
var nconf = require('nconf');
var path = require('path');
var program = require('commander');
var qs = require('querystring');
var readline = require('readline');
var request = require('request');
var unzip = require('unzip');
var url = require('url');

var config = 'config.json';

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
    console.log(jObj.status === 'ok' ? jObj.status : jObj.message)
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

nconf.env();
nconf.file({file: config});
nconf.defaults({
    protocol: 'https',
    hostname: 'aiaas.pandorabots.com',
    app_id: undefined,
    user_key: undefined,
    botname: undefined,
    client_name: undefined,
    sessionid: undefined,
    all: undefined,
    extra: undefined,
    reset: undefined,
    trace: undefined,
    reload: undefined,
    recent: undefined
});

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
    .option('-e, --extra', 'reset status of bot')
    .option('-t, --trace', 'adds trace data into response')
    .option('-r, --reload', 'force system to realod bot')
    .option('-R, --recent', 'use recent pod even if it is older than files')
    .option('-a, --all', 'downloads all files')
    .parse(process.argv);

if (program.protocol)
    nconf.set('protocol', program.protocol);
if (program.hostname)
    nconf.set('hostname', program.hostname);
if (program.app_id)
    nconf.set('app_id', program.app_id);
if (program.user_key)
    nconf.set('user_key', program.user_key);
if (program.botname)
    nconf.set('botname', program.botname);
if (program.client_name)
    nconf.set('client_name', program.client_name);
if (program.sessionid)
    nconf.set('sessionid', program.sessionid);
if (program.extra)
    nconf.set('extra', program.extra);
if (program.trace)
    nconf.set('trace', program.trace);
if (program.reload)
    nconf.set('reload', program.reload);
if (program.recent)
    nconf.set('recent', program.recent);
if (program.all)
    nconf.set('all', program.all);

// Initialize
if (program.args[0] === 'init') {
    var params = ['app_id', 'user_key', 'botname', 'hostname'];
    var keyValues = {};
    var iface = readline.createInterface(process.stdin, process.stdout);

    iface.on('line', function(line) {
	var key = params.shift();
	var value = line.trim();
	keyValues[key] = value ? value : undefined;
	if (params.length > 0) {
	    var prmpt = params[0] + '? ';
	    iface.setPrompt(prmpt, prmpt.length);
	    iface.prompt();
	}
	else
	    iface.close();
    }).on('close', function() {
	fs.writeFileSync(config, JSON.stringify(keyValues, null, 4));
	console.log(config + " has been created.");
	process.exit(0);
    });

    console.log('Enter app_id (required), user_key (required), botname (recommended), hostname (optional).');
    var prmpt = params[0] + '? ';
    iface.setPrompt(prmpt, prmpt.length);
    iface.prompt();
}

// List names of bots
else if (program.args[0] === 'list') {
    request.get(listUri(), function (error, response, body) {
	var jObj = JSON.parse(body);
	jObj.forEach (function (entry) {
	    console.log(entry.botname);
	});
    });
}

// Create a bot
else if (program.args[0] === 'create') {
    request.put(botUri(), okResp);
}

// Delete a bot
else if (program.args[0] === 'delete') {
    request.del(botUri(), okResp);
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
	request.del(fileUri(program.args[1]), okResp);
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

