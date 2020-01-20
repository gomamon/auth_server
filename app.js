
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
// var logger = require('morgan');
var multer = require('multer');
var bodyParser = require('body-parser');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var signinRouter = require('./routes/signin');
var signupRouter = require('./routes/signup');
var signoutRouter = require('./routes/signout');
var upload = multer();
var app = express();


//redis
var redis = require('redis');
var session = require('express-session');
var redisStore = require('connect-redis')(session);
var redisConfig = require('./config').redis;
var client = redis.createClient(redisConfig);

var passport = require('passport');


app.use(session({
  secret: 'secret_key',
  store: new redisStore({
    host: redisConfig.host,
    port: redisConfig.port,
    client: client,
    prefix : "session",
    db : 0
  }),
  saveUninitialized:false, 
  resave : true 
  }
));



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '/public')));


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(upload.array());

app.use(passport.initialize());



app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/',signinRouter);
app.use('/signup',signupRouter);
app.use('/signout',signoutRouter);

app.set('views', __dirname + '/views');
// public 경로 설정
app.set('public', __dirname + '/public');

app.use(express.static(__dirname + '../public'));
app.use('/static', express.static('public'));
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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
//app.listen(port, () => console.log(`This app listening on port ${port}!`))

