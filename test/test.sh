#!/bin/bash

pb="node ../pb-cli.js"
function cmd {
    echo ">> $pb $*"
    $pb $*
    echo
}

# test of init method is omitted.
test -f chatbot.json || (echo "do init first."; exit 1)

# set botname to alice
export botname=abcdefg

echo %% create bot abcdefg
cmd create

echo %% list bots
cmd list

echo %% upload file properties
cmd upload abcdefg.properties

echo %% upload file bot_profile.aiml
cmd upload bot_profile.aiml

echo %% upload file client_profile.aiml
cmd upload client_profile.aiml

echo %% upload file color.set
cmd upload color.set

echo %% upload file udc.aiml
cmd upload udc.aiml

echo %% compile bot abcdefg
cmd compile

echo %% list files of abcdefg
cmd get

echo %% get zip of abcdefg
cmd get -all

echo %% download file color.set
cmd download color.set

echo %% remove file color.set
cmd remove color.set --yes

echo %% list files of abcdefg
cmd get

echo %% upload file color.set
cmd upload color.set

echo %% pull all files
cmd pull

echo %% push all files
cmd push

echo %% compile bot abcdefg again
cmd compile

# set botname to alice
export client_name=myclient

echo %% talk to abcdefg
cmd talk Hello
cmd talk How are you?
cmd talk name
cmd talk age
cmd talk gender
cmd talk Call me Richard
cmd talk my name?
cmd talk air force blue

echo %% delete bot abcdefg
cmd delete --yes

exit 0
