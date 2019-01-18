const url = require('url')
const path = require('path')

function sep(str) {
  return str ? `/${str}` : ''
}

function composeUri(mode, botname, kind, filename) {
  var uri = {
    protocol: this.nconf.get('protocol'),
    hostname: this.nconf.get('hostname'),
    port: this.nconf.get('port')
  };
  var path = '';
  path += sep(this.nconf.get('prefix'));
  path += sep(mode);
  path += sep(this.params.app_id());
  path += sep(botname);
  path += sep(kind);
  path += sep(filename);
  uri.pathname = path;
  return uri;
}

function composeBotkeyUri(mode) {
  var uri = {
    protocol: this.nconf.get('protocol'),
    hostname: this.nconf.get('hostname'),
    port: this.nconf.get('port')
  };
  var path = '';
  path += sep(mode);
  uri.pathname = path;
  return uri;
}

function listUri() {
  var uri = composeUri.bind(this)('bot', '', '', '');
  uri.query = this.params.compose({});
  return url.format(uri);
}

function botUri(botname) {
  var uri = composeUri.bind(this)('bot', botname, '', '');
  uri.query = this.params.compose({});
  return url.format(uri);
}

function fileUri(filename) {
  var ext = path.extname(filename);
  var base = path.basename(filename, ext);
  var kind = ext.slice(1);
  var botname = this.params.botname();
  var uri;
  if (kind === 'pdefaults' || kind === 'properties')
    uri = composeUri.bind(this)('bot', botname, kind, '');
  else if (kind === 'map' || kind === 'set' || kind === 'substitution')
    uri = composeUri.bind(this)('bot', botname, kind, base);
  else if (kind === 'aiml')
    uri = composeUri.bind(this)('bot', botname, 'file', base + ext);
  else {
    console.log('illegal file name: ' + filename);
    return;
  }
  uri.query = this.params.compose({});
  return url.format(uri);
}

function zipUri() {
  var uri = composeUri.bind(this)('bot', this.params.botname(), '', '');
  uri.query = this.params.compose({return: 'zip'});
  return url.format(uri);
}

function verifyUri() {
  var uri = composeUri.bind(this)('bot', this.params.botname(), 'verify', '');
  uri.query = this.params.compose({});
  return url.format(uri);
}

function talkUri() {
  var uri = composeUri.bind(this)('talk', this.params.botname(), '', '');
  return url.format(uri);
}

function talkBotkeyUri() {
  var uri = composeBotkeyUri.bind(this)('talk');
  return url.format(uri);
}

function atalkUri() {
  var uri = composeUri.bind(this)('atalk', this.params.botname(), '', '');
  return url.format(uri);
}

function atalkBotkeyUri() {
  var uri = composeBotkeyUri.bind(this)('atalk');
  return url.format(uri);
}

module.exports = (thisValue) => {
  return {
    atalk: atalkUri.bind(thisValue),
    atalkBkey: atalkBotkeyUri.bind(thisValue),
    talk: talkUri.bind(thisValue),
    talkBkey: talkBotkeyUri.bind(thisValue),
    verify: verifyUri.bind(thisValue),
    zip: zipUri.bind(thisValue),
    file: fileUri.bind(thisValue),
    bot: botUri.bind(thisValue),
    list: listUri.bind(thisValue),
    compose: composeUri.bind(thisValue),
    composeBkey: composeBotkeyUri.bind(thisValue)
  }
}
