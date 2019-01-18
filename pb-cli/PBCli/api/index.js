const achat = require('./achat.js')
const atalk = require('./atalk.js')
const chat = require('./chat.js')
const compile = require('./compile.js')
const create = require('./create.js')
const onDelete = require('./delete.js')
const download = require('./download.js')
const get = require('./get.js')
const init = require('./init.js')
const list = require('./list.js')
const pull = require('./pull.js')
const push = require('./push.js')
const remove = require('./remove.js')
const talk = require('./talk.js')
const upload = require('./upload.js')

module.exports = (thisValue) => {
  return {
    achat: achat.bind(thisValue),
    atalk: atalk.bind(thisValue),
    chat: chat.bind(thisValue),
    compile: compile.bind(thisValue),
    create: create.bind(thisValue),
    delete: onDelete.bind(thisValue),
    download: download.bind(thisValue),
    get: get.bind(thisValue),
    init: init.bind(thisValue),
    list: list.bind(thisValue),
    pull: pull.bind(thisValue),
    push: push.bind(thisValue),
    remove: remove.bind(thisValue),
    talk: talk.bind(thisValue),
    upload: upload.bind(thisValue)
  }
}
