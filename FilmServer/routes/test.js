var express = require('express');
var router = express.Router();

const crypto = require('crypto');


/* test for hash. */
router.get('/', function(req, res, next) {
  var data = req.query.data;
  const hash = crypto.createHash('sha256');
  hash.update(data);
  console.log(hash.digest('hex'));
  res.send('This is a test.');
});

module.exports = router;