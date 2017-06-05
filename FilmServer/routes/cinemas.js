var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');


var url = 'mongodb://localhost:27017/Films';


// 返回number个电影院
var findCinemas = function(db, number, callback) {
  // Get the cinemaItems collection
  var collection = db.collection('cinemaItems');
  // Find some documents
  collection.find({}).limit(number).toArray(function(err, docs) {
    assert.equal(err, null);
    console.log("Found " + number + " cinemas");
    //console.log(docs)
    callback(docs);
  });
}

router.get('/getCinemas', function(req, res, next) {
  var number = Number(req.query.number);
  var resultCinemas = {};
  // 如果返回全部电影院
  if (number >= 1) {
    MongoClient.connect(url, function(err, db) {
      assert.equal(null, err);
      console.log("Connected successfully to server to getCinemas");
      
      findCinemas(db, number, function(docs) {
        resultCinemas.number = docs.length;
        resultCinemas.cinemaList = docs;
        res.json(resultCinemas);
        db.close();
      });
    });
  } else {
    res.send('number is wrong!');
  }
});

module.exports = router;
