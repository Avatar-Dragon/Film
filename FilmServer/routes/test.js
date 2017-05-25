var express = require('express');
var router = express.Router();
var cookie = require('cookie');
var jwt = require('jwt-simple');
var jwtauth = require('../middleWare/jwtauth.js');
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');

var moment = require('moment');

var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var url = 'mongodb://localhost:27017/Films';

const crypto = require('crypto');


/* test for hash. */
router.get('/', function(req, res, next) {
  var data = req.query.data;
  const hash = crypto.createHash('sha256');
  hash.update(data);
  console.log(hash.digest('hex'));
  res.send('This is a test.');
});

// 返回hash加密的结果
router.post('/', function(req, res, next) {
  var data = req.query.data;
  const hash = crypto.createHash('sha256');
  hash.update(data);
  var result = hash.digest('hex');
  console.log(result);
  res.send(result);
});

/* test for cookie */
router.get('/cookie', function(req, res, next) {
  console.log('Cookie: ', req.cookies);
  
  var cookieName = req.cookies.cookieName;
  // 如果没有cookie，则新建一个并返回
  if (cookieName === undefined) {
    var randomNumber = Math.random().toString();
    console.log(randomNumber);
    randomNumber = randomNumber.substring(2, randomNumber.length);
    console.log(randomNumber);
    res.cookie('cookieName', randomNumber, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7 // 1 week
    });
    console.log('set cookie');
  } else {
    console.log('cookie exists');
  }  
  
  res.send('Hello cookie.');
});

/* test for token */
router.post('/jwt', [jsonParser, jwtauth], function(req, res, next) {
  var user = {};
  user.name = req.query.name;
  var token = req.name;
  
  if (token) {
    res.send('Hello token.' + token);
  } else {
    console.log(user);
    // 超时的时限
    var expires = moment().add(1, 'minute').valueOf();
    console.log(expires);

    // 生成token并加密
    var token = jwt.encode({
      iss: user.name,
      exp: expires
    }, 'FILM_SECRET_STRING');
    
    res.json({
      token: token,
      expires: expires,
      user: JSON.stringify(user)
    });
    
  }
});

// 返回number个电影
var findMovies = function(db, number, callback) {
  // Get the movieDescriptions collection
  var collection = db.collection('movieDescriptions');
  // Find some documents
  collection.find({}, {'_id': 0}).limit(number).toArray(function(err, docs) {
    assert.equal(err, null);
    console.log("Found the following records");
    //console.log(docs)
    callback(docs);
  });
}

router.get('/movie', function(req, res, next) {
  var number = Number(req.query.number);
  var movies = {};
  // 如果返回全部电影
  if (number >= 1) {
    MongoClient.connect(url, function(err, db) {
      assert.equal(null, err);
      console.log("Connected successfully to server");
      
      findMovies(db, number, function(docs) {
        movies.number = docs.length;
        movies.moviesList = docs;
        res.json(movies);
        db.close();
      });
    });
  } else {
    res.send('number is wrong!');
  }
});

module.exports = router;