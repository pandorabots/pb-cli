const bot = require('./bot')
const chat = require('./chat')
const onDelete = require('./delete')
const file = require('./file')
const list = require('./list')
const remove = require('./remove')
const talk = require('./talk')
const verify = require('./verify')

module.exports = (thisValue) => {
  return {
    bot: bot.bind(thisValue),
    chat: chat.bind(thisValue),
    delete: onDelete.bind(thisValue),
    file: file.bind(thisValue),
    list: list.bind(thisValue),
    remove: remove.bind(thisValue),
    talk: talk.bind(thisValue),
    verify: verify.bind(thisValue)
  }
}
