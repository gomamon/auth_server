var express = require('express');
var router = express.Router();

//hasing
var bkfd2Password = require('pbkdf2-password');
var hasher = bkfd2Password();

//database
var mysql = require('mysql');
var dbConfig = require('../config').db;
var connection = mysql.createConnection(dbConfig);

//redis
const redis = require('redis');
const redisConfig = require('../config').redis;
const redisClient = redis.createClient(dbConfig);

connection.connect();


router.get('/', (req, res)=>{
	redisClient.get("NAME", (err, result) =>{
		console.log(result);
	})
	res.render('signin', {
		title: "signin",
		wrong: false
	});

});


router.post('/', async function(req, res){
	var data = req.body;
	var query = `select * from user where email="${data.email}"`;

	connection.query(query, (err,result)=>{
		console.log("query result: "+result);
		if(err){
			console.log("db error!"+ err);
		}
		else if(result.length >0){
			hasher({password : data.password , salt : result[0].salt},(err,pass,salt,hash)=>{
				if(hash ===result[0].password){
					console.log(data.email+" signin success!");
					res.render('index', {
						title: "index",
					});
				}
				else{
					res.render('signin', {
						title: "signin",
						wrong: true
					});
				}
			});
		}
		else{
			res.render('signin', {
				title: "signin",
				wrong: true
			});
		}
	});

})


module.exports = router;
