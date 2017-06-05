var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
var assert = require('assert');


var url = 'mongodb://localhost:27017/Films';

// 返回number个电影场次
var findScreeningItems = function(db, number, callback) {
  // Get the screeningItems collection
  var collection = db.collection('screeningItems');
  // Find some documents
  collection.find({}).limit(number).toArray(function(err, docs) {
    assert.equal(err, null);
    console.log("Found " + number + " screeningItems");
    //console.log(docs)
    callback(docs);
  });
}

// 返回某个电影院的某部电影的所有场次
var findAllScreeningItemByCinemaIdAndMovieId = function(db, cinemaId, movieId, callback) {
  // Get the screeningItems collection
  var collection = db.collection('screeningItems');
  // Find some documents
  collection.find({"cinemaId": new ObjectID(cinemaId), "movieId": new ObjectID(movieId)}).toArray(function(err, docs) {
    assert.equal(err, null);
    console.log("Found all screeningItems By cinemaId and movieId");
    //console.log(docs)
    callback(docs);
  });
}

router.get('/getScreenings', function(req, res, next) {
  var number = Number(req.query.number);
  var resultScreenings = {};
  // 如果返回全部电影
  if (number >= 1) {
    MongoClient.connect(url, function(err, db) {
      assert.equal(null, err);
      console.log("Connected successfully to server to getScreenings");
      
      findScreeningItems(db, number, function(docs) {
        resultScreenings.number = docs.length;
        resultScreenings.screeningItemList = docs;
        res.json(resultScreenings);
        db.close();
      });
    });
  } else {
    res.send('number is wrong!');
  }
});

router.get('/getAllScreeningsOfCinemaAndMovie', function(req, res, next) {
  var cinemaId = String(req.query.cinemaId);
  var movieId = String(req.query.movieId);
  var resultScreenings = {};
  // 如果返回全部电影
  MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    console.log("Connected successfully to server to getAllMoviesOfCinema");
    findAllScreeningItemByCinemaIdAndMovieId(db, cinemaId, movieId, function(docs) {
      var resultScreenings = {
        number: docs.length,
        screeningItemList: docs
      }
      res.json(resultScreenings);
      db.close();
    });
  });
});

module.exports = router;
