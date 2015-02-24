pb-cli
=======

Pandorabots CLI

This is a guide for the Pandorabots CLI.
Please read the [documentation](http://developer.pandorabots.com/docs) for further information regarding naming conventions and file types.

You will need both a `user_key` and `app_id`, which you can register for at the [Pandorabots Developer Portal](http://developer.pandorabots.com).

Installation
------------

Simply do npm install. pb-cli depends [commander](https://github.com/tj/commander.js), [glob](https://github.com/isaacs/node-glob), [nconf](https://github.com/flatiron/nconf), [request](https://github.com/request/request).

```
    npm install pb-cli
```

Setup
-----

First, create a directory for your specific bot (like alice).
Then do **pandorabots init** in the directory so as to generate **chatbot.json** for convenience later on.
At least you need to enter `user_key` and `app_id` here.
You can omit `--botname alice` in case you have entered `botname`.

```
    mkdir alice
    cd alice
    pandorabots init
```

Create a bot
------------

You need to create a bot before uploading bot files.

```
    pandorabots create --botname alice
```

List all bots on Pandorabots server you own
-------------

```
    pandorabots list
```

Delete a bot
------------

```
    pandorabots delete --botname alice
```

Upload a file
-------------

```
    pandorabots upload something.aiml --botname alice
```

Upload all files at once (Push)
--------------

Upload all bot-related files (like `*.properties`, `*.aiml`) in current directory at once.
You can push example bot files that comes with this pacakge (in test directory).

```
    pandorabots push --botname alice
```

List all files
--------------

```
    pandorabots get --botname alice
```

Compile a bot
-------------

```
    pandorabots compile --botname alice
```

Download a file
-------------

```
    pandorabots download something.aiml --botname alice
```

Download all files at once (Pull)
--------------

```
    pandorabots pull --botname alice
```

Download all files as zip file
--------------

Alternatively to pull method, you can get ZIP archive of all of your bot's files.

```
    pandorabots get --botname alice --all
```

Remove a file
-------------

This command do remove a file on Pandorabots server; do not remove files on your local storage.

```
    pandorabots remove something.aiml --botname alice
```

Talk to a bot
-------------

```
    pandorabots --botname alice talk Hello, I'm John.
```

