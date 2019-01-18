function onVerify (error, response, body) {
  if (!response)
    console.log(error);
  else if (response.statusCode >= 400) {
    var parsedBody = JSON.parse(body)
    var fileError = parsedBody ? (parsedBody.results ? parsedBody.results[0] : false) : false
    if(fileError)
      console.log(`Error in file:`)
      console.log(fileError)
    this.errors.verify(response.statusCode)
  }  else {
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

module.exports = onVerify
