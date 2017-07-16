var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var mongo = require('mongodb');
var session = require('express-session');

var index = require('./routes/index');
var users = require('./routes/users');
var mustacheExpress = require('mustache-express');

var app = express();

var collection = {"name": "La bestia",
                  "last": "Tran"}

// view engine setup
//app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'jade');

// Register '.html' extension with The Mustache Express
app.engine('html', mustacheExpress());

app.set('view engine', 'mustache');
app.set('views', __dirname + '/views');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ secret: 'keyboard cat', cookie: { maxAge: 60000, saveUninitialized: false  }}))
//app.use('/', index);
//app.use('/users', users);

app.get('/', function(req, res){
    res.render('index.html', {"yourname": "Modu"});
});

app.get('/login', function(req, res){
    res.render('login.html', {"yourname": "Modu"});
});

app.get('/sendMessage', function(req, res){
    res.render('sendMessage.html', {"yourname": "Modu"});
});

app.get('/contactus', function(req, res){
    res.render('contactus.html', {"yourname": "Modu"});
});

app.get('/createAccount', function(req, res){
    res.render('createAccount.html', {"yourname": "Modu"});
});


app.get('/indexFeed', function(req, res){
    res.render('indexFeed.html', {"yourname": "Modu"});
});

app.post('/passdata', function(req, res){
    req.session.mydata = "tochi";
    res.send(req.body);
});

//var user = {"name":"", "last":""};
var listUsers = [];
//listUsers.push(user);


function addUser(name, last, role){
  listUsers.push({"name": name, "last":last, "role": role});
}

addUser("pedro", "Gomez", "student");
addUser("hhh", "ttt", "mentor");
addUser("dd", "aaa", "mentor");

var listOfMessage = [];

function addMessage(mentor, sender, text){
  listOfMessage.push({"mentor": mentor, "sender": sender, "text": text});
}


function findUser(name){
  var myUserFromList = null;

  listUsers.forEach(function(element) {
    if(element.name == name){
      myUserFromList = element; 
    }
  }, this);
  return myUserFromList;
}

app.get('/getList', function(req, res){
    
    res.jsonp(listUsers);
});

app.get('/getUser', function(req, res){
    var nameParams = req.query.name;
    console.log(nameParams);
    var result = findUser(nameParams);
    res.jsonp(result);
});

app.get('/mentor/:id', function(req, res){
    var temp = req.params.id + req.session.mydata;
    //res.send(req.params);
    res.send(temp);
});

// send message to mentor
app.post('/sendMessage', function(req, res){
    //req.session.mydata = "tochi";
    var tempMentor = req.body.mentor;
    var studentName = req.body.student;
    var tempText = req.body.text;
    console.log(tempMentor, studentName, tempText);
    addMessage(tempMentor, studentName, tempText);

    res.send(`${tempMentor} sent to ${studentName}`);

});

// // catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   var err = new Error('Not Found');
//   err.status = 404;
//   next(err);
// });

// // error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
});


//module.exports = app;


