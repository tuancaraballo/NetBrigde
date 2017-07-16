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

var _ = require('underscore');
var PORT = process.env.PORT || 3000;

// --> dependency for firebase database
var firebase = require("firebase");

  var config = {
    apiKey: "AIzaSyCopE3i8lSqk7bMZJBOml7uV223XExfYe8",
    authDomain: "unagifinal.firebaseapp.com",
    databaseURL: "https://unagifinal.firebaseio.com",
    projectId: "unagifinal",
    storageBucket: "",
    messagingSenderId: "784732129608"
  };
firebase.initializeApp(config);


// --> instantiating database
var database = firebase.database();


var app = express();


// -> Creates a new acccount in Firebase
function createNewAccount(username, data, group = "student") {
  firebase.database().ref(group+ '/' + username).set(data);
}

function authMiddleware(req, res, next) {
	var user = firebase.auth().currentUser;
	if( user !== null) {
		//--> here you can read more data from db and put it into the
		// the request
		req.user = user;
		next();
	} else{
		res.redirect('/login');
	}
}

/* Schema for mentoMap 

var data = {yourname : "Brother"};

app.get('/indexFeed', function(req, res){
    res.render('indexFeed.html', data);
});



var mentorMap = {};

var collection = {"name": "La bestia",
                  "last": "Tran"}
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

addMessage("pedro", "pepe", "Hola pepe como estas");
addMessage("tomas", "alina", "Hola pepe como estas");
// find all messages for a mentor
function findMessage(name){
  var listPrivateMessage = [];

  listOfMessage.forEach(function(element){
      if(element.mentor == name){
        listPrivateMessage.push(element);
      }
  }, this);
    return listPrivateMessage; 
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


app.post('/login', function(req, res){

  // --> Comment this code if you want to turn off firebase
	var email = _.pick(req.body, 'email')['email'];
	var password =  _.pick(req.body, 'password')['password'];

	firebase.auth().signInWithEmailAndPassword(email, password).then(function() {
	
		return res.redirect('/studentdashboard');
	
	}).catch(function(error) {
  		// Handle Errors here.
  		var errorCode = error.code;
  		var errorMessage = error.message;

  		return res.status(404).send({message: errorMessage});
	});


    //res.render('login.html', {"yourname": "Modu"});
});

app.get('/sendMessage', function(req, res){
    res.render('sendMessage.html', {"yourname": "Modu"});
});

app.get('/contactus', function(req, res){
    res.render('contactus.html', {"yourname": "Modu"});
});

// TODO: change to the right html to render
app.get('/mentordashboard', function(req, res){
	var response = { message: 'success' };
	res.status(200).send(response);
    // res.render('contactus.html', {"yourname": "Modu"});
});

// TODO: change to the right html to render
app.get('/studentdashboard', function(req, res){
	var response = { message: 'success' };
	res.status(200).send(response);
    // res.render('contactus.html', {"yourname": "Modu"});
});



// -> obtains te username from the user's email
function getUsernameFromEmail(email){
	console.log('Email inside the function -- ' + email);
	var index = email.indexOf("@");
	console.log('INDEX  ' + index);
    var username= email.substring(0,index);
    console.log('username   ' + username);
    return username;

}

// -> creates a mentor's account
app.post('/newmentor', function(req, res){
	// TODO: do some data sanitazion before adding to database
	var emailJSON = _.pick(req.body, 'email');
	var username = getUsernameFromEmail(emailJSON['email']);
	var mentorData = _.pick(req.body, 'fullname', 'email', 'password', 'role', 'gender', 'age', 'hometown');	
	createNewAccount(username, mentorData, "mentors"); 
	return res.redirect('/mentordashboard');
});

// -> creates a student's account
app.post('/newstudent', function(req, res){
	// TODO: do some data sanitazion before adding to database
	var email = _.pick(req.body, 'email')['email'];
	var password =  _.pick(req.body, 'password')['password'];
	var username = getUsernameFromEmail(email);
	var studentData = _.pick(req.body, 'fullname', 'email', 'gender', 'age', 'hometown', 'school', 'major');
	createNewAccount(username, studentData, "students"); 
	
	firebase.auth().createUserWithEmailAndPassword(email, password).then(function(){
		return res.redirect('/studentdashboard');
	}
	).catch(function(error) {
  		// Handle Errors here.
  		var errorCode = error.code;
  		var errorMessage = error.message;

  		return res.status(404).send(errorMessage);
	});

	
});

app.get('/indexFeed', function(req, res){
    res.render('indexFeed.html', {"yourname": "Modu"});
});

app.post('/passdata', function(req, res){
    req.session.mydata = "tochi";
    res.send(req.body);
});


app.get('/getList', function(req, res){
    
    res.jsonp(listUsers);
});

app.get('/getAllMessage', function(req, res){
    //save username for the session
    var mentorRequest = req.query.name;
    var listOfPrivateMessages = findMessage(mentorRequest);
    res.jsonp(listOfPrivateMessages);
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

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
});



