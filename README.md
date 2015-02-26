# Pandorabots CLI

The Pandorabots CLI allows you to manage and interact with your AIaaS applications straight from the command line. 

Please read the [documentation](http://developer.pandorabots.com/docs) for further information regarding naming conventions and file types.

*Note: You will need both a* `user_key` *and* `app_id`*, which you can register for at the [Pandorabots Developer Portal](http://developer.pandorabots.com).*

## Installation

The CLI is available as a node.js module, via [npm](http://www.npmjs.org).

```bash
$ npm install -g pb-cli
```

## Configuration

The CLI introduces the concept of the bot configuration file, `pb.json`. This file stores information like your `app_id`, `user_key` and `botname`:

```json
{
  app_id: ********,
  user_key: *******,
  botname: ********,
  host: ********
}
```

Running any of the commands from within a directory containing a `pb.json` file will automatically add your configured parameters to the API call:

```bash
$ pb list
```

You can create this file manually, or, use the `init` command to be guided through the process:

```bash
$ pb init
app_id? (required) *********
user_key? (required) ********
botname? (recommended) ********
host? (optional) ******
```

The host field is optional, and will default to `aiaas.pandorabots.com`.

## Usage

### General

- `pb init`: creates a configuration file (overwrites any existing `pb.json` files in the same directory)

- `pb list`: list all bots associated with a particular `app_id`

### Bot management

- `pb compile`: compiles a bot

- `pb create`: creates a new bot on the server

- `pb delete`: deletes a bot on the server

- `pb talk <input>`: send a message to a bot and print the response

### File management

- `pb download <file>`: download a particular file from the server

- `pb get`: list all files associated with a bot (use `--all` to download all files as a .zip)

- `pb pull`: download all files associated with a bot (unzipped, avoid using this with large bots)

- `pb push`: upload all bot files in a given directory 

- `pb remove <file>`: delete a bot file from the server

- `pb upload <file>`: upload a bot file


## Flags

You can add flags to certain commands to override information stored in `pb.json`. 

For example, if I want to talk to a bot that has a different name than the one stored in the configuration file, we can override it by including the `--botname <botname>` flag:

```bash
$ pb talk --botname alice Hello!
```

You can use the same technique to override other parameters, using flags like `--host`, `--app_id`, and `--user_key`.

For a full list of available flags and their applications, access the help information by running `pb --help`.


