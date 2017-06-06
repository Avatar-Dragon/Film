var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
var assert = require('assert');
const crypto = require('crypto');

var url = 'mongodb://localhost:27017/Films';

// 查找user
var findUserByName = function(db, name, callback) {
  // Get the users collection
  var collection = db.collection('users');
  // Find some documents
  collection.find({"username": name}).toArray(function(err, docs) {
    assert.equal(err, null);
    console.log("Finished finding user");
    //console.log(docs)
    callback(docs);
  });
}

// 添加新的user
var insertUser = function(db, user, callback) {
  // Get the users collection
  var collection = db.collection('users');
  
  collection.insertOne(user, function(err, result) {
    assert.equal(err, null);
    assert.equal(1, result.ops.length);
    console.log("Inserted 1 user into the collection");
    callback(result);
  });
}

// 查找user的所有order
var getAllOrdersByUserName = function(db, username, callback) {
  // Get the users collection
  var collection = db.collection('users');
  // Find some documents
  collection.find({"username": username}, {orders: 1}).toArray(function(err, docs) {
    assert.equal(err, null);
    console.log("Finished finding orders of a user");
    //console.log(docs)
    callback(docs[0].orders);
  });
}

// 根据id查找场次
var getScreeningItemById = function(db, id, callback) {
  // Get the screeningItems collection
  var collection = db.collection('screeningItems');
  // Find some documents
  collection.find({"_id": new ObjectID(id)}).toArray(function(err, docs) {
    assert.equal(err, null);
    console.log("Found the screeningItem By id");
    //console.log(docs)
    callback(docs);
  });
}

function getFinalOrder(db, orderList, index, finalOrderList, callback) {
  getScreeningItemById(db, orderList[index].screeningId, function (docs) {
//    console.log(docs);
    var tempOrder = {
      screeningId: orderList[index].screeningId,
      movie: docs[0].movieName,
      cinema: docs[0].cinema,
      screeningRoom: docs[0].screeningRoom,
      screeningTime: orderList[index].screeningTime,
      ticketNumber: orderList[index].number,
      generateTime: orderList[index].generateTime
    }
//    console.log(tempOrder);
    finalOrderList.push(tempOrder);
//    console.log(finalOrderList.length);
    if (orderList.length == finalOrderList.length) {
      callback();
    }
  });
}

router.post('/register', function(req, res, next) {
  var username = req.body.username;
  var password = req.body.password;
//  console.log(username);
//  console.log(password);
  if (username != undefined && password != undefined) {
    
    const hash = crypto.createHash('sha256');
    hash.update(password);
    var hashPassword = hash.digest('hex');
    
    MongoClient.connect(url, function(err, db) {
      assert.equal(null, err);
      console.log("Connected successfully to server to findUserByName");
      
      findUserByName(db, username, function(result) {
        if (result.length == 0) {
          var user = {
            username: username,
            password: hashPassword,
            orders: []
          }
          
          insertUser(db, user, function(result2) {
//            console.log(result2);
            res.jsonp({
              infornation: 'success',
              detail: ''
            });
          });
          
        } else {
          res.jsonp({
            infornation: 'false',
            detail: 'The user is exist.'
          });
        }
        
        db.close();
      });
    });
    
  } else {
    res.jsonp({
      infornation: 'false',
      detail: 'No post username or password.'
    });
  }
}); 

router.post('/login', function(req, res, next) {
  var username = req.body.username;
  var password = req.body.password;
//  console.log(username);
//  console.log(password);
  if (username != undefined && password != undefined) {
    
    MongoClient.connect(url, function(err, db) {
      assert.equal(null, err);
      console.log("Connected successfully to server to findUserByName");
      
      findUserByName(db, username, function(result) {
        if (result.length == 0) {
          res.jsonp({
            infornation: 'false',
            detail: 'The user is not exist.'
          });
        } else {
          const hash = crypto.createHash('sha256');
          hash.update(password);
          var hashPassword = hash.digest('hex');
          if (result[0].password == hashPassword) {
            res.jsonp({
              infornation: 'success',
              detail: ''
            });
          } else {
            res.jsonp({
              infornation: 'false',
              detail: 'Password is wrong.'
            });
          }
        }
        
        db.close();
      });
    });
    
  } else {
    res.jsonp({
      infornation: 'false',
      detail: 'No post username or password.'
    });
  }
});

router.post('/getAllOrders', function(req, res, next) {
  var username = req.body.username;
  var password = req.body.password;
  
  MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    console.log("Connected successfully to server to getAllOrdersByUserName");
    
    getAllOrdersByUserName(db, username, function(result) {
//      console.log(result);
      var finalOrderList = [];
      for (var i = 0; i < result.length; i++) {
        getFinalOrder(db, result, i, finalOrderList, function() {
          db.close();
//          console.log(finalOrderList);
          finalOrderList = {
            number: finalOrderList.length,
            orderList: finalOrderList
          }
          res.jsonp(finalOrderList);
        });
      }
    });
  });
});




module.exports = router;
