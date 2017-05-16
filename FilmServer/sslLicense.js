var fs = require('fs');

// ssl license

var privateKeyPath = '../RSAKey/private.pem';
var certPath = '../RSAKey/file.crt';

var privateKey = fs.readFileSync(privateKeyPath);
var cert = fs.readFileSync(certPath);

var option = {
  key: privateKey,
  cert: cert
}

// ssl object

var ssl = {};

ssl.options = option;

module.exports = ssl;