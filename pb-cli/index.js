#!/usr/bin/env node
'use strict';

const PBCli = require('./PBCli')

var config = 'chatbot.json';
var options = {
    protocol: 'https',
    hostname: 'aiaas.pandorabots.com',
    port: undefined,
    prefix: undefined,
    app_id: undefined,
    user_key: undefined,
    botkey: undefined,
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

const pbCli = new PBCli({config, options})

try {
  pbCli.run()
} catch(error) {
  console.error(error)
}
