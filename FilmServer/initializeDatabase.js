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
    console.log("Inserted some movies into the movieDescriptions");
    callback(result);
  });
}

var insertCinemas = function(db, document, callback) {
  // Get the movieDescriptions collection
  var collection = db.collection('cinemaItems');
  // Insert some movieDescriptions
  collection.insertMany(document, function(err, result) {
    assert.equal(err, null);
//    assert.equal(2, result.result.n);
//    assert.equal(2, result.ops.length);
    console.log("Inserted some cinemas into the cinemaItems");
    callback(result);
  });
}

var insertScreeningItem = function(db, document, callback) {
  // Get the movieDescriptions collection
  var collection = db.collection('screeningItems');
  // Insert some movieDescriptions
  collection.insertOne(document, function(err, result) {
    assert.equal(err, null);
//    assert.equal(2, result.result.n);
//    assert.equal(2, result.ops.length);
    console.log("Inserted one screeningItem into the screeningItems");
    callback(result);
  });
}


var findMovieId = function(db, movieName, callback) {
  var cursor = db.collection('movieDescriptions').find({"originalName": movieName});
  cursor.toArray(function(err, docs) {
    assert.equal(err, null);
    console.log("Found the movieId");
//    console.log(docs)
    callback(docs);
  });
};

var findCinemaId = function(db, cinema, callback) {
//  console.log(cinema);
  var cursor = db.collection('cinemaItems').find({"cinema": cinema});
  cursor.toArray(function(err, docs) {
    assert.equal(err, null);
    console.log("Found the cinemaId");
//    console.log(docs)
    callback(docs);
  });
};

var dataLine = fs.readFileSync('../codeForDatabase/name.txt').toString();
//console.log(dataLine.length);
var namePattern = new RegExp("正在热映(.)*\\.txt", "g");
var result = dataLine.match(namePattern);

//console.log(result);

var pattern1 = new RegExp("原名(.)*", "g");
var pattern2 = new RegExp("中文名(.)*", "g");
var pattern3 = new RegExp("导演(.)*", "g");
var pattern4 = new RegExp("主演(.)*", "g");
var pattern5 = new RegExp("简介(.)*", "g");
var pattern6 = new RegExp("地址(.)*", "g");
var pattern7 = new RegExp("影院(.)*", "g");
var pattern8 = new RegExp("场次(.)*", "g");
var pattern9 = new RegExp("放映厅(.)*", "g");


var path;
var thedata;
var finalMovieList = [];
var tempCinemaList = [];
var tempScreeningList = [];
var tempMovieItem;
var tempCinemaItem;
var tempScreeningItem;

for (var i = 0; i < result.length; i++) {
  path = result[i];
  thedata = fs.readFileSync('../oriData/movies/' + path).toString();
  tempMovieItem = {
    originalName: thedata.match(pattern1)[0].substring(4),
    chineseName: thedata.match(pattern2)[0].substring(5),
    director: thedata.match(pattern3)[0].substring(4),
    mainCharacters: thedata.match(pattern4)[0].substring(4, thedata.match(pattern4)[0].length-1),
    introduction: thedata.match(pattern5)[0].substring(4),
    image: thedata.match(pattern2)[0].substring(5) + '.webp'
  };
  tempCinemaItem = {
    cinema: thedata.match(pattern7)[0].substring(4),
    address: thedata.match(pattern6)[0].substring(4),
    screeningRoom: thedata.match(pattern9)[0].substring(5)
  };
  tempScreeningItem = {
    movieName: thedata.match(pattern1)[0].substring(4),
    cinema: thedata.match(pattern7)[0].substring(4),
    screeningRoom: thedata.match(pattern9)[0].substring(5),
    screening: thedata.match(pattern8)[0].substring(4)
  };
  finalMovieList.push(tempMovieItem);
  tempCinemaList.push(tempCinemaItem);
  tempScreeningList.push(tempScreeningItem);
}

//console.log(finalMovieList);
//console.log(tempCinemaList);
//console.log(tempScreeningList);

var finalCinemaList = [];
var finalScreeningList = [];

var isUnique;

for (i = 0; i < tempCinemaList.length; i++) {
  isUnique = true;
  for (var j = 0; j < finalCinemaList.length; j++) {
    if (tempCinemaList[i].cinema == finalCinemaList[j].cinema) {
//      console.log("same cinema");
      isUnique = false;
      if (finalCinemaList[j].screeningList.indexOf(tempCinemaList[i].screeningRoom) == -1) {
        finalCinemaList[j].screeningList.push(tempCinemaList[i].screeningRoom);
//        console.log("more list: ");
//        console.log(finalCinemaList[j]);
      } else {
        break;
      }
    }
  }
  
  if (isUnique) {
    tempCinemaItem = {
      cinema: tempCinemaList[i].cinema,
      address: tempCinemaList[i].address,
      screeningList: []
    };
    tempCinemaItem.screeningList.push(tempCinemaList[i].screeningRoom);
//    console.log("add item");
//    console.log(tempCinemaItem);
    finalCinemaList.push(tempCinemaItem);
  }

}

//console.log(finalCinemaList);

var patternDate = new RegExp("....-..-..", "g");
var patternHour = new RegExp("..:..", "g");

for (i = 0; i < tempScreeningList.length; i++) {
//  console.log(tempScreeningList[i].screening.match(patternDate)[0]);
//  console.log(tempScreeningList[i].screening.match(patternHour));
  tempScreeningItem = {
    movieName: tempScreeningList[i].movieName,
    cinema: tempScreeningList[i].cinema,
    screeningRoom: tempScreeningList[i].screeningRoom,
    screeningList: []
  }
  tempDate = tempScreeningList[i].screening.match(patternDate)[0];
  tempHourList = tempScreeningList[i].screening.match(patternHour);
  for (j = 0; j < tempHourList.length; j++) {
    tempScreeningItem.screeningList.push(tempDate + " " + tempHourList[j]);
  }
  
  finalScreeningList.push(tempScreeningItem);
}

//console.log(finalScreeningList);

// 做好了电影描述、电影院的数据
// 电影Item的数据得在（电影描述、电影院建表）之后，才能建表

// 建表：电影描述
var firstPromise = new Promise(function(resolve, reject) {
  MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    console.log("Connected successfully to server for movie");

    insertDocuments(db, finalMovieList, function() {
      db.close();
      console.log("success movie");
      resolve();
    });
  });
});

var secondPromise = new Promise(function(resolve, reject) {
  // 建表：电影院
  MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    console.log("Connected successfully to server for cinema");

    insertCinemas(db, finalCinemaList, function() {
      db.close();
      console.log("success cinema");
      resolve();
    });
  });
});

function toDoInsertScreeningItem() {
  for (i = 0; i < finalScreeningList.length; i++) {
    (function a(n) {
      MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        console.log("Connected successfully to server for screening");

        findMovieId(db, finalScreeningList[n].movieName, function(movie) {
          findCinemaId(db, finalScreeningList[n].cinema, function(cinema) {
            var movieId = movie[0]._id;
            var cinemaId = cinema[0]._id;
            var tempScreeningItem = {};
            Object.assign(tempScreeningItem, finalScreeningList[n]);
            tempScreeningItem.movieId = movieId;
            tempScreeningItem.cinemaId = cinemaId;
            insertScreeningItem(db, tempScreeningItem, function() {
              db.close();
              console.log("success screening");
            });
          });    
        });
      });
    })(i);
  }
};

firstPromise.then(secondPromise).then(toDoInsertScreeningItem);

console.log('success');





