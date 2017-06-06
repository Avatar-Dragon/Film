var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
var assert = require('assert');
const crypto = require('crypto');

var url = 'mongodb://localhost:27017/Films';


// 添加某个user的order
var updateOrder = function(db, username, newOrder, callback) {
  // Get the users collection
  var collection = db.collection('users');
  
  collection.updateOne(
    {"username": username}, 
    {
      $push: {'orders': newOrder}
    }, function(err, result) {
    assert.equal(err, null);
    assert.equal(1, result.result.n);
    callback();
  });
}

router.post('/buyTickets', function(req, res, next) {
  var username = req.body.username;
  var password = req.body.password;
  var screeningId = req.body.screeningId;
  var screeningTime = req.body.screeningTime;
  var number = req.body.number;
  
  var myDate = new Date();
  
  var newOrder = {
    screeningId: screeningId,
    screeningTime: screeningTime,
    number: number,
    generateTime: myDate.toLocaleString()
  }
  
  console.log(newOrder);
  
  MongoClient.connect(url, function (err, db) {
    assert.equal(null, err);
    console.log("Connected successfully to server to updateOrder");
    
    updateOrder(db, username, newOrder, function () {
      db.close();
      res.jsonp({
        infornation: 'success',
        detail: ''
      });
    });
  });
});


module.exports = router;
