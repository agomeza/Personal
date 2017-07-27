var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('client-sessions');
var io = require('socket.io');  
var app = express();
//app.use(express.session({secret: 'VGTUSNT17'}));


//Mongo
var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/RunEz');

var index = require('./routes/index');
var users = require('./routes/users');



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use("/styles",express.static(__dirname + "/public/stylesheets"));
app.use("/fonts",express.static(__dirname + "/public/fonts"));
app.use("/js",express.static(__dirname + "/public/js"));
app.use("/img",express.static(__dirname + "/public/img"));
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//Make our db accessible to our router
app.use(function(req,res,next){
    req.db = db;
    next();
});

app.post('/Send', function(req, res){ // Specifies which URL to listen for
	  // req.body -- contains form data
	console.log("Received");
	});
app.use('/', index);
app.use('/users', users);
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


module.exports = app;