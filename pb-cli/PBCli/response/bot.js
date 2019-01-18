function onBotResponse (error, response, body) {
  if (!response)
    console.log(error);
  else if (response.statusCode >= 400)
    this.errors.bots(response.statusCode)
  else {
    var jObj = JSON.parse(body);
    if (jObj.status === 'ok')
        console.log(jObj.status);
    else {
        console.log(jObj.message);
        if (jObj.results !== undefined)
      console.log(JSON.stringify(jObj.results[0], null, 2));
    }
  }
}
module.exports = onBotResponse
