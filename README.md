pb-cli
=======

Pandorabots CLI

This is a guide for the Pandorabots CLI.
Please read the [documentation](http://developer.pandorabots.com/docs) for further information regarding naming conventions and file types.

You will need both a `user_key` and `app_id`, which you can register for at the [Pandorabots Developer Portal](http://developer.pandorabots.com).

Installation
------------

Simply do npm install. pb-cli depends [commander](https://github.com/tj/commander.js), [nconf](https://github.com/flatiron/nconf), [request](https://github.com/request/request).

```
    npm install pb-cli
```

Setup
-----

Do pandorabots init so pb-cli generates inital config.json.
At least you need to enter `user_key` and `app_id` here.

```
    pandorabots init
```

Create a bot
------------

```
    pandorabots create --botname alice
```

List all bots
-------------

```
    pandorabots list
```

Delete a bot
------------

```
    pandorabots delete --botname alice
```

Compile a bot
-------------

```
    pandorabots compile --botname alice
```

Upload a file
-------------

```
    pandorabots upload something.aiml --botname alice
```

List all files
--------------

```
    pandorabots get --botname alice
```

Alternatively, you can get ZIP archive of all of your bot's files. 

```
    pandorabots get --botname alice --all
```

Download a file
-------------

```
    pandorabots download something.aiml --botname alice
```

Remove a file
-------------

```
    pandorabots remove something.aiml --botname alice
```

Talk to a bot
-------------

```
    pandorabots --botname alice talk Hello, I'm John.
```

