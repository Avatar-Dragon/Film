var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var fs = require('fs');

// Connection URL
var url = 'mongodb://localhost:27017/Films';

var insertDocuments = function(db, document, callback) {
  // Get the movieDescriptions collection
  var collection = db.collection('movieDescriptions');
  // Insert some movieDescriptions
  collection.insertMany(document, function(err, result) {
    assert.equal(err, null);
//    assert.equal(2, result.result.n);
//    assert.equal(2, result.ops.length);
    console.log("Inserted some movies into the collection");
    callback(result);
  });
}


var dataLine = fs.readFileSync('../codeForDatabase/name.txt').toString();
//console.log(dataLine.length);
var pattern = new RegExp("正在热映：(.)*\\.txt", "g");
var result = dataLine.match(pattern);

//console.log(result);

var pattern1 = new RegExp("原名(.)*", "g");
var pattern2 = new RegExp("中文名(.)*", "g");
var pattern3 = new RegExp("导演(.)*", "g");
var pattern4 = new RegExp("主演(.)*", "g");
var pattern5 = new RegExp("简介(.)*", "g");

var path;
var thedata;
var answer = [];
var final = [];
var temp;

for (var i = 0; i < result.length; i++) {
  path = result[i];
  thedata = fs.readFileSync('../oriData/movie/' + path).toString();
  temp = {
    原名: thedata.match(pattern1)[0].substring(4),
    中文名: thedata.match(pattern2)[0].substring(5),
    导演: thedata.match(pattern3)[0].substring(3),
    主演: thedata.match(pattern4)[0].substring(3, thedata.match(pattern4)[0].length-1),
    简介: thedata.match(pattern5)[0].substring(4),
    海报: thedata.match(pattern2)[0].substring(5) + '.webp'
  };
  answer.push(temp);
  //console.log(temp);
}

MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  console.log("Connected successfully to server");

  insertDocuments(db, answer, function() {
    db.close();
  });
});