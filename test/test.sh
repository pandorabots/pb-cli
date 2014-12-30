#!/bin/bash

pb="node ../pb-cli.js"
function cmd {
    echo ">> $pb $*"
    $pb $*
    echo
}

# test of init method is omitted.
test -f config.json || (echo "do init first."; exit 1)

# set botname to alice
export botname=alice

echo %% create bot alice
cmd create

echo %% list bots
cmd list

echo %% delete bot alice
cmd delete

echo %% create bot alice again
cmd create

echo %% upload file properties
cmd upload alice.properties

echo %% upload file bot_profile.aiml
cmd upload bot_profile.aiml

echo %% upload file client_profile.aiml
cmd upload client_profile.aiml

echo %% upload file color.set
cmd upload color.set

echo %% upload file udc.aiml
cmd upload udc.aiml

echo %% compile bot alice
cmd compile

echo %% list files of alice
cmd get

echo %% get zip of alice
cmd get -all

echo %% download file color.set
cmd download color.set

echo %% remove file color.set
cmd remove color.set

echo %% list files of alice
cmd get

echo %% upload file color.set
cmd upload color.set

echo %% compile bot alice again
cmd compile

# set botname to alice
export client_name=myclient

echo %% talk to alice
cmd talk Hello
cmd talk How are you?
cmd talk name
cmd talk age
cmd talk gender
cmd talk Call me Richard
cmd talk my name?
cmd talk air force blue

exit 0

