var express = require('express');
var router = express.Router();
// var db = require('../db');

// var connection = db.init();
// connection.connect();

router.use('/signin', require('./signin'));
router.use('/signup', require('./signup'));


/* GET home page. */
router.get('/', function(req, res, next) {
	//res.render('index', { title: 'Express' });
	res.render('index', {
		title: "hello"
	});

	connection.query("SELECT * FROM user", (err, rows) => {
		if (!err) {
			console.log(rows);
		}
		else{
			console.log('error!');
		}
	});

	// db((err, connection) => {
		// connection.query("SELECT * FROM user", (err, rows, fields) => {
		//   if (!err) {
		// 	console.log(rows);
		//   }
		//   else{
		// 	  console.log('error!');
		//   }
		// });
	// });

});


module.exports = router;
