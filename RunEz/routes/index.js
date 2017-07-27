var express = require('express');
var router = express.Router();
var moment = require('moment');
var session = require('client-sessions');
var crypto = require('crypto'),
algorithm = 'aes-256-ctr';
var ObjectId = require('mongodb').ObjectID;
function encrypt(text){
var cipher = crypto.createCipher(algorithm,'VGTU')
var crypted = cipher.update(text,'utf8','hex')
crypted += cipher.final('hex');
return crypted;
}

router.use(session({
	  cookieName: 'session',
	  secret: 'VGTU2017RUNEZ',
	  duration: 30 * 60 * 1000,
	  activeDuration: 5 * 60 * 1000,
	}));

//function requireLogin (req, res, next) {
//	  if (!req.user) {
//	    res.redirect('/login');
//	  } else {
//	    next();
//	  }
//	};
	

function queryCollectionRaces(collection,race_id, callback){
	collection.find({ '_id': ObjectId(race_id) },{},function(err, result) {
        if (err) {
            console.log(err);
        } else if (result.length > 0) {
            callback(result);
        }
    });
}
 
function isAdmin (req, res, next) {
	if (!req.session.user) {
	  res.redirect('/');
	} else if (!req.session.user[0].isAdmin) {
	  res.redirect('/');
	} else {
	  next();
	}
}

/* GET home page. */
router.get('/', function(req, res, next) {
	var db = req.db;
	var u = "";
    if (typeof req.session.user !== 'undefined') {
    	u = req.session.user[0];
    }
    var options = {
    	    "sort": { "date": 1 },
    	  };
    var dateTime = new Date();
    var collection = db.get('racecollection');
    collection.find({ },options,function(e,docs){
    	res.render('index', { title: 'RunEz',"racelist" : docs,"user" : u, "moment" : moment });
    });
  
});



router.get('/about', function(req, res, next) {
	var u = "";
    if (typeof req.session.user !== 'undefined') {
    	u = req.session.user[0];
    }
	  res.render('about', { title: 'RunEz',"user" : u });
	});


router.get('/history', function(req, res, next) {
	var db = req.db;
	var u = "";
    if (typeof req.session.user !== 'undefined') {
    	u = req.session.user[0];
    }
    var collection = db.get('userraces');
    collection.find({'userInfo.user_id': ObjectId(u._id)},{},function(e,docs){
    	res.render('history', { title: 'RunEz',"racelist" : docs,"user" : u });
    });
	});


router.get('/deleteRaceUser', function(req, res, next) {
	var db = req.db;
	var u = "";
	var raceId = req.body.raceId;
	var ObjectId = require('mongodb').ObjectID;
    if (typeof req.session.user !== 'undefined') {
    	u = req.session.user[0];
    }
    var collection = db.get('userraces');
 // Submit to the DB
//    collection.remove({ 'userInfo.user_id': ObjectId(u._id)}, '_id': ObjectId(raceId) });
//    });
});




router.post('/addRaceUser', function(req, res, next) {
	var db = req.db;
	var u = "";
	 var raceName = req.body.inputName;
	    var raceCountry = req.body.inputCountry;
	    var raceCity = req.body.inputCity;
	    var raceDate = req.body.inputDate;
	    var distance = req.body.distance;
	//db.userraces.insert({'race' : { 'city' : 'Vilnius','country' : 'Lithuania','name': 'We Run Vilnius','date' : ISODate('2017-06-04T10:00:00Z')},'userInfo':{'user_id': ObjectId("58d18128d2674a6da4c759e0"),'time':'55:00'}})

	var ObjectId = require('mongodb').ObjectID;
    if (typeof req.session.user !== 'undefined') {
    	u = req.session.user[0];
    }
    
    var collectionUR = db.get('userraces');
    	       collectionUR.insert({
    	       	"race" : {
    	       		"city" : raceCity,
    	               "country" : raceCountry,
    	               "name" : raceName,
    	               "date" : raceDate,
    	       	},"userInfo" : {
    	       		"distance" : distance,
    	               "time" : '',
    	               "user_id" : ObjectId(u._id),
    	       	}
    	       }, function (err, doc) {
    	           if (err) {
    	               // If it failed, return error
    	               res.send("There was a problem adding the information to the database.");
    	           }
    	           else {
    	               // And forward to success page
    	               res.redirect("history");
    	           }
    	       });
    
});

router.get('/users',isAdmin, function(req, res, next) {
	var db = req.db;
	var u = "";
    if (typeof req.session.user !== 'undefined') {
    	u = req.session.user[0];
    }
    var collection = db.get('users');
    collection.find({},{},function(e,docs){
    	res.render('users', { title: 'RunEz',"users" : docs,"user" : u });
    });
	});

router.get('/raceInfo', function(req, res, next) {
	var db = req.db;
	var u = "";
	var race_id = req.query.race;
    if (typeof req.session.user !== 'undefined') {
    	u = req.session.user[0];
    }
    var collection = db.get('racecollection');
    collection.find({'_id': ObjectId(race_id)},{},function(e,docs){
    	res.send({"raceinf" : docs});
    });
	});


router.post('/addRaces',isAdmin, function(req, res, next) {
	// Set our internal DB variable
    var db = req.db;
    // Get our form values. These rely on the "name" attributes
    var raceName = req.body.inputName;
    var raceCountry = req.body.inputCountry;
    var raceCity = req.body.inputCity;
    var raceDate = req.body.inputDate;
    var raceTenkm = req.body.tenkm;
    var raceHalfMar = req.body.halfmar;
    var raceMarath = req.body.marathon;
    var raceLink = req.body.inputLink;
    
    // Set our collection
    var collection = db.get('racecollection');

    // Submit to the DB
    collection.insert({
        "location" : {
        	"country" : raceCountry,
        	"city" : raceCity
        },
        "name" : raceName,
        "link" : raceLink,
        "date" : raceDate,
        "tenkm" : raceTenkm,
        "halfmarathon" : raceHalfMar,
        "marathon" : raceMarath
    }, function (err, doc) {
        if (err) {
            // If it failed, return error
            res.send("There was a problem adding the information to the database, "+ err + ' , '+ doc );
        }
        else {
            // And forward to success page
            res.redirect("races");
        }
    });
});

router.get('/login', function(req, res, next) {
	  res.render('login', { title: 'RunEz' });
	});

router.get('/races', function(req, res, next) {
	var db = req.db;
	var u = "";
    if (typeof req.session.user !== 'undefined') {
    	u = req.session.user[0];
    }
    var collection = db.get('racecollection');
    collection.find({},{},function(e,docs){
    	res.render('races', { title: 'RunEz',"racelist" : docs,"user" : u });
    });
	});

router.get('/register', function(req, res, next) {
	  res.render('register', { title: 'RunEz' });
	});

router.get('/logout', function(req, res) {
	  req.session.reset();
	  res.redirect('/login');
	});




router.post('/loginSend', function(req, res) {
	var db = req.db;
    var userEmail = req.body.inputMail;
    var passwd = encrypt(req.body.inputPassword);
    // Set our collection
    var collection = db.get('users');
    
	  collection.find({'email' : userEmail,'password' : passwd},{}, function(err, user) {
		  if (!user) {
		      res.render('login.ejs', { error: 'Invalid email or password.' });
		    } else {
		      if (passwd === user[0].password) {
		        // sets a cookie with the user's info
		        req.session.user = user;
		        res.redirect('/');
		      } else {
		        res.render('login.ejs', { error: 'Invalid email or password.' });
		      }
		    }
	  });
	  
	});

/* GET users page. */
router.get('/racelist', function(req, res) {
    var db = req.db;
    var collection = db.get('racecollection');
    collection.find().sort({date:1})({},{},function(e,docs){
        res.render('racelist', {
            "racelist" : docs
        });
    });

});


/* POST to Add User Service */
router.post('/addUser', function(req, res) {
    // Set our internal DB variable
    var db = req.db;
    // Get our form values. These rely on the "name" attributes
    var userName = req.body.inputName;
    var userEmail = req.body.inputMail;
    var pass = req.body.inputPassword;
    // Set our collection
    var collection = db.get('users');

    // Submit to the DB
    collection.insert({
        "username" : userName,
        "email" : userEmail,
        "information" : {},
        "history" : {},
        "isAdmin" : false,
        "password" : encrypt(pass)
    }, function (err, doc) {
        if (err) {
            // If it failed, return error
            res.send("There was a problem adding the information to the database.");
        }
        else {
            // And forward to success page
            res.redirect("login");
        }
    });
});

//Mail

//var smtpTransport = nodemailer.createTransport({
//    service: "gmail",
//    host: "smtp.gmail.com",
//    auth: {
//        user: "alvarogomezare@gmail.com",
//        pass: ""
//    }
//});

//app.get('/mailRace',function(req,res){
//    var mailOptions={
//        to : 'alvaro.gomez@stud.vgtu.lt',
//        subject : 'New Race',
//        text : req.query.text
//    }
//    console.log(mailOptions);
//    smtpTransport.sendMail(mailOptions, function(error, response){
//     if(error){
//            console.log(error);
//        res.end("error");
//     }else{
//            console.log("Message sent: " + response.message);
//        res.end("sent");
//         }
//});
//});




module.exports = router;
