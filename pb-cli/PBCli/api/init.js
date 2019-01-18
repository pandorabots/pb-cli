const fs = require('fs')

function processProps(propName, hostName) {
  this.prompt.get(propName, (error, result) => {
    if (error) {
        console.log("aborted.");
        process.exit(2);
    }
    else {
      var prop = {};
      prop["hostname"] = hostName;
      for (var key in result) {
        if (result[key])
            prop[key] = result[key];
      }
      return fs.writeFile(this.config, JSON.stringify(prop, null, 4), () => { process.exit()});
  }
  });
}

function onInit () {
  var hostProp = [
    {message: 'hostname?(optional)', name: 'hostname'}
  ];
  var defaultHost = this.options["hostname"]
  var configProps = [
      {message: 'app_id? (required)', name: 'app_id',
          required: true, validator: /^[0-9a-z]+$/,
          warning: 'app_id must consist of alphanumeric, lowercase characters'},
      {message: 'user_key? (required)', name: 'user_key',
          required: true, validator: /^[0-9a-z]+$/,
          warning: 'user_key must consist of alphanumeric, lowercase characters'},
      {message: 'botname? (recommended)', name: 'botname'}

  ];

  this.prompt.get(hostProp, (error, result) => {
    if (error) {
        console.log("aborted.");
        process.exit(2);
    }
    else {
        var productionHost = "api.pandorabots.com"
        if(result["hostname"] == productionHost){
          defaultHost = productionHost
          configProps = [
            {message: 'botkey? (required)', name: 'botkey', required: true}
          ];
        }
        processProps.bind(this)(configProps,defaultHost);
    }
  });
}

module.exports = onInit
