# Pandorabots CLI

The Pandorabots CLI allows you to manage and interact with your AIaaS applications straight from the command line.

Please read the [documentation](http://developer.pandorabots.com/docs) for further information regarding naming conventions and file types.

*Note: You will need both a* `user_key` *and* `app_id`*, which you can register for at the [Pandorabots Developer Portal](http://developer.pandorabots.com).*

## Installation

The CLI is available as a node.js module, via [npm](http://www.npmjs.org).

```bash
$ npm install -g pb-cli
```

You should now be able to run the CLI by typing either `pandorabots` or `pb` in the command line.

## Configuration

The CLI introduces the concept of the bot configuration file, `chatbot.json`. This file stores information like your `app_id`, `user_key` and `botname`:

```js
{
  app_id: ********,
  user_key: *******,
  botname: ********,
  hostname: ********
}
```

Running any of the commands from within a directory containing a `chatbot.json` file will automatically add your configured parameters to the API call:

```bash
$ pb list
```

You can create this file manually, or, use the `init` command to be guided through the process:

```bash
$ pb init
app_id? (required) *********
user_key? (required) ********
botname? (recommended) ********
hostname? (optional) ******
```

The hostname field is optional, and will default to `aiaas.pandorabots.com`.

## Run tests

The `test` directory contains a shell script to test the CLI. You must first run `pb init` here to create a configuration, then run:

```bash
$ ./test.sh
```

## Usage

### General

- `pb init`: creates a configuration file (overwrites any existing `chatbot.json` files in the same directory)

- `pb list`: list all bots associated with a particular `app_id`

### Bot management

- `pb compile`: compiles a bot

- `pb create`: creates a new bot on the server

- `pb delete`: deletes a bot on the server

- `pb talk <input>`: send a message to a bot and print the response

- `pb atalk <input>`: send a message to a bot using atalk and print the generated client_name as well as the response (added in version 1.1.0)

- `pb chat`: enter a REPL-style chat mode with a bot (added in version 1.0.3)

- `pb achat`: enter a REPL-style chat mode with a bot, starting the session using atalk (added in version 1.1.0)

### File management

- `pb download <file> <path>`: download a particular file from the server, saving it at the specified path. Path can be absolute or relative to the current directory. Omitting the path will save the file to the current directory.

- `pb get`: list all files associated with a bot (use `--all` to download all files as a .zip)

- `pb pull <path>`: download all files associated with a bot (unzipped, avoid using this with large bots), saving them to the specified path. Path can be absolute or relative to the current directory. Omitting the path will save bot files to the current directory.

- `pb push <path>`: upload all bot files given the path to a directory. Path can be absolute, or relative to where the `chatbot.json` file is stored. Omitting the path will push all bot files in the current directory.

- `pb remove <file>`: delete a bot file from the server

- `pb upload <file>`: upload a bot file


## Flags

You can add flags to certain commands to override information stored in `chatbot.json`.

For example, if I want to talk to a bot that has a different name than the one stored in the configuration file, we can override it by including the `--botname <botname>` flag:

```bash
$ pb talk --botname alice Hello!
```

You can use the same technique to override other parameters, using flags like `--hostname`, `--app_id`, and `--user_key`.

For a full list of available flags and their applications, access the help information by running `pb --help`.
