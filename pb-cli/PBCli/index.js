const nconf = require('nconf')
const program = require('commander')
const prompt = require('prompt')

const api = require('./api')
const uri = require('./uri')
const params = require('./params')
const response = require('./response')
const util = require('./util')

const errors = require('../errors.js')

class PBCli {
  constructor({config, options}) {
    this.program = program
    this.nconf = nconf
    this.prompt = prompt
    this.errors = errors

    this.api = api(this)
    this.uri = uri(this)
    this.util = util(this)
    this.params = params(this)
    this.response = response(this)

    this.run = this.run.bind(this)

    this.config = config
    this.options = options

    this.initializeProgram = this.initializeProgram.bind(this)
    this.initializeProgram(config, options)
  }

  initializeProgram(config, options) {
    this.program
        .version('1.3.1')
        .usage('command [options] <file ...>')
        .on('--help', function() {
          console.log('\n   General Commands:\n')
          console.log('      init                     Create a configuration file.')
          console.log('      list                     List all bots associated with your app_id.')
          console.log('\n   Bot Management Commands:\n')
          console.log('      compile                  Compile a bot.')
          console.log('      create                   Create a bot on the server.')
          console.log('      delete                   Delete a bot on the server.')
          console.log('      talk <input>             Send a message to a bot and print the response.')
          console.log('      atalk <input>            Send an atalk message to a bot, printing the response and client_name.')
          console.log('      chat                     Enter a REPL-style chat mode with a bot.')
          console.log('      achat                    Enter a REPL-style chat mode with a bot using atalk.')
          console.log('\n   File Management Commands:\n')
          console.log('      download <file> <path>   Download a file from the server to the specifed path.')
          console.log('      get                      List all files associated with a bot. Use --all to download as a zip file.')
          console.log('      pull <path>              Download all files associated with a bot to the specified path.')
          console.log('      push <path>              Upload all bot files at the specified path, including subdirectories.')
          console.log('      remove <file>            Delete a bot file from the server.')
          console.log('      upload <file>            Upload a bot file to the server.')
          console.log('')
        })
        .option('-p, --protocol <protocol>', 'protocol')
        .option('-h, --hostname <hostname>', 'hostname')
        .option('-P, --port <port>', 'port number')
        .option('-X, --prefix <prefix>', 'prefix path of URL')
        .option('-i, --app_id <app_id>', 'app_id')
        .option('-k, --user_key <user_key>', 'user_key')
        .option('-B, --botkey <botkey>', 'botkey')
        .option('-b, --botname <botname>', 'name of bot')
        .option('-c, --client_name <client_name>', 'name of client')
        .option('-s, --sessionid <sessionid>', 'session id of conversation')
        .option('-e, --extra', 'provides additional information')
        .option('-M, --reset', 'reset the bot memory')
        .option('-t, --trace', 'adds trace data into response')
        .option('-r, --reload', 'force system to reload bot')
        .option('-R, --recent', 'use most recently compiled version of bot')
        .option('-a, --all', 'downloads all files')
        .option('-y, --yes', 'do not prompt anything; assume yes to all yes/no queries')
        .option('-o, --referer', 'define a referer header to send with the request')
        .parse(process.argv);

      this.nconf.env()
      this.nconf.file({file: config})
      this.nconf.defaults(options)

      this.prompt.message = ""
      this.prompt.delimiter = ""

      for (var key in options) {
          if (this.program[key]){
             this.nconf.set(key, this.program[key]);
          }
      }
  }

  run() {
    // Initialize
    if (this.program.args[0] === 'init') {
      this.api.init()
    }

    // List names of bots
    else if (this.program.args[0] === 'list') {
      this.api.list()
    }

    // Create a bot
    else if (this.program.args[0] === 'create') {
      this.api.create()
    }

    // Delete a bot
    else if (this.program.args[0] === 'delete') {
      this.api.delete()
    }

    // Upload a file
    else if (this.program.args[0] === 'upload') {
      this.api.upload()
    }

    // Upload all files at once
    else if (this.program.args[0] === 'push') {
      this.api.push()
    }

    // Remove a file
    else if (this.program.args[0] === 'remove') {
      this.api.remove()
    }

    // Download a file
    else if (this.program.args[0] === 'download') {
      this.api.download()
    }

    // List files of bot
    else if (this.program.args[0] === 'get' && !program.all) {
      this.api.get()
    }

    // Retrieve all files as ZIP
    else if (this.program.args[0] === 'get' && program.all) {
      this.api.get(true)
    }

    // Retrieve all files at once
    else if (this.program.args[0] === 'pull') {
      this.api.pull()
    }

    // Compile a bot
    else if (this.program.args[0] === 'compile') {
      this.api.compile()
    }

    // Talk to a bot
    else if (this.program.args[0] === 'talk') {
      this.api.talk()
    }

    // Atalk to a bot
    else if (this.program.args[0] === 'atalk') {
      this.api.atalk()
    }

    // Chat mode
    else if (this.program.args[0] === 'chat') {
      this.api.chat()
    }

    // Achat mode
    else if (this.program.args[0] === 'achat') {
      this.api.achat()
    }

    else if (this.program.args[0] === undefined)
        console.log('usage: <command> [--options...]');
    else {
        console.log('invalid command: ' + this.program.args[0]);
        process.exit(1);
    }
  }
}

module.exports = PBCli
