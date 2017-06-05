var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
var assert = require('assert');


var url = 'mongodb://localhost:27017/Films';

// 返回number个电影
var findMovies = function(db, number, callback) {
  // Get the movieDescriptions collection
  var collection = db.collection('movieDescriptions');
  // Find some documents
  collection.find({}).limit(number).toArray(function(err, docs) {
    assert.equal(err, null);
    console.log("Found " + number + " movies");
    //console.log(docs)
    callback(docs);
  });
}

// 根据id查找电影
var findMovieById = function(db, id, callback) {
  // Get the movieDescriptions collection
  var collection = db.collection('movieDescriptions');
  // Find some documents
  collection.find({"_id": new ObjectID(id)}).toArray(function(err, docs) {
    assert.equal(err, null);
    console.log("Found the movie By id");
    //console.log(docs)
    callback(docs);
  });
}


// 返回某个电影院的所有场次
var findAllScreeningItemByCinemaId = function(db, id, callback) {
  // Get the movieDescriptions collection
  var collection = db.collection('screeningItems');
  // Find some documents
  collection.find({"cinemaId": new ObjectID(id)}).toArray(function(err, docs) {
    assert.equal(err, null);
    console.log("Found all screeningItems");
    //console.log(docs)
    callback(docs);
  });
}




router.get('/getMovies', function(req, res, next) {
  var number = Number(req.query.number);
  var resultMovies = {};
  // 如果返回全部电影
  if (number >= 1) {
    MongoClient.connect(url, function(err, db) {
      assert.equal(null, err);
      console.log("Connected successfully to server to getMovies");
      
      findMovies(db, number, function(docs) {
        resultMovies.number = docs.length;
        resultMovies.movieList = docs;
        res.json(resultMovies);
        db.close();
      });
    });
  } else {
    res.send('number is wrong!');
  }
});

function toDoFindMovieById(resultMovies, id, length, resolve) {
  MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    console.log("Connected successfully to server to getMovieById");
    console.log(id);
    findMovieById(db, id, function(result) {
      resultMovies.push(result[0]);
//      console.log(result);
      console.log(resultMovies.length);
      db.close();
      if (resultMovies.length == length) {
        resolve();
      }
    });
  });
};

router.get('/getAllMoviesOfCinema', function(req, res, next) {
  var cinemaId = String(req.query.cinemaId);
  var resultScreenings = {};
  // 如果返回全部电影
  MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    console.log("Connected successfully to server to getAllMoviesOfCinema");
    findAllScreeningItemByCinemaId(db, cinemaId, function(docs) {
      
      var resultMoviesId = [];
      for (var i = 0; i < docs.length; i++) {
        if (resultMoviesId.indexOf(docs[i].movieId) == -1) {
          resultMoviesId.push(docs[i].movieId);
        }
      }
      db.close();
      
      if (resultMoviesId.length == 0) {
        res.send("No movies");
        return next;
      }
      
      var resultMovies = [];
      
      var firstPromise = new Promise(function(resolve, reject) {
        for (var key in resultMoviesId) {
          toDoFindMovieById(resultMovies, resultMoviesId[key], resultMoviesId.length, resolve);
        }
      });
      
      
      firstPromise.then(function() {
        resultMovies = {
          number: resultMovies.length,
          movieList: resultMovies
        }
        res.jsonp(resultMovies);
      });
    });
  });
});

module.exports = router;
