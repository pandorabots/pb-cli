const invalidBotname = 'Invalid botname.'
const invalidCredentials = 'Invalid app_id, user_key, or botkey.'

const errorCodes = {
  bots: {
    400: invalidBotname,
    401: invalidCredentials,
    404: 'No bot was found with that botname and app_id.',
    409: 'A bot already exists with that botname and app_id.',
    412: 'No bot was found with that botname and app_id.'
  },
  files: {
    400: 'Invalid bot or file name, or malformed JSON.',
    401: invalidCredentials,
    404: 'Invalid file extension or the bot does not exist.',
    412: 'The file or botname was not found.'
  },
  verify: {
    400: 'Unable to compile or the bot does not exist.\n\tCheck uploaded files for syntax issues.',
    401: invalidCredentials
  },
  talk: {
    400: 'Malformed request. This can be caused by an invalid botname or client_name, or by exceeding input size limits.',
    401: 'Invalid user_key.',
    412: 'The bot does not exist for that app_id or is not compiled.',
    429: 'Your application has reached the maximum number of API calls for your current plan.',
    502: 'Bad Gateway. Check host credentials'
  }
}

function handleErrors(category, statusCode) {
  let errorMessage = 'Error: '
  if (errorCodes[category])
    errorMessage += errorCodes[category][statusCode] || 'Undocumented error for this operation.'

  errorMessage += ` (${statusCode})`

  console.error(errorMessage)
  process.exit(0)
}

module.exports = {
  bots: function(statusCode) { handleErrors('bots', statusCode) },
  files: function(statusCode) { handleErrors('files', statusCode) },
  verify: function(statusCode) { handleErrors('verify', statusCode) },
  talk: function(statusCode) { handleErrors('talk', statusCode) }
}
