var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');

/* GET image by name. */
router.get('/', function(req, res, next) {
  var imageName = req.query.imageName;
//  console.log(imageName);
  if (imageName !== undefined) {
    var imagePath = '../oriData/images/' + imageName;
    res.sendFile(path.resolve(imagePath), function (err) {
      if (err) {
        console.log('err');
        next(err);
      } else {
        console.log('Send a image');
      }
    });
  } else {
    res.send('Not imagesName!');
  }
});

module.exports = router;