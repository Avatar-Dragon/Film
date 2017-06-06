var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
//var jwt = require('jwt-simple');

var index = require('./routes/index');
var users = require('./routes/users');
var test = require('./routes/test');
var images = require('./routes/images');
var movies = require('./routes/movies');
var cinemas = require('./routes/cinemas');
var screenings = require('./routes/screenings');
var orders = require('./routes/orders');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/user', users);
app.use('/test', test);
app.use('/images', images);
app.use('/movies', movies);
app.use('/cinemas', cinemas);
app.use('/screenings', screenings);
app.use('/orders', orders);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

//app.use(jwt.init())
//app.set('jwtTokenSecret', 'FILM_SECRET_STRING');
//console.log(app.get('jwtTokenSecret'));
//console.log(app);

module.exports = app;
