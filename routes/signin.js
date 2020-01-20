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
// const redis = require('redis');
// const redisConfig = require('../config').redis;
// const redisClient = redis.createClient(dbConfig);

//token
var bodyParser = require('body-parser')
var jwt = require('jsonwebtoken')
var randtoken = require('rand-token')

var refreshTokens = {}
var SECRET = require('../config').jwt


connection.connect();


router.get('/signin', (req, res)=>{

	if(req.session.user){
		var token = req.session.user;
		var decoded = jwt.verify(token, SECRET);
		if(decoded){
			res.status(200).redirect('/');
		}
		else{
			res.render('signin',{
				title: "sign in",
				header_message: "로그인 해주세요!",
				wrong: false
			});
		}
	}
	else{
		res.render('signin',{
			title: "sign in",
			header_message: "로그인 해주세요!",
			wrong: false
		});
	}

});


router.post('/signin', async function(req, res){
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
					var user = {
						'email' : result[0].email,
						'name' : result[0].name,
						'role' : result[0].role
					}
					var token = jwt.sign(user, SECRET, {expiresIn:'1440m'});
					req.session.user = token;
					req.session.save(function(){
						res.status(200).redirect('/');
					});
				}
				else{
					res.render('signin', {
						title: "signin",
						wrong: true,
						header_name: `로그인 해주세요!`
					});
					console.log('wrong');
				}
			});
		}
		else{
			res.render('signin', {
				title: "signin",
				wrong: true,
				header_name: `로그인 해주세요!`

			});
			console.log('wrong');

		}
	});

})


router.post('/token', function(req,res,next){
	var name = req.body.name;
	var role = req.body.role;
	var refreshToken = req.body.refreshToken
	if((refreshToken in refreshTokens) && (refreshTokens[refreshToken] == name)){
		var user = {
			'name' : name,
			'role' : role
		}
		var token = jwt.sign(user, SECRET, {expiresIn:300})
		res.json({token: 'JWT' + token})
	}
	else{
		res.send(401)
	}

});


router.post('/token/reject', function(req,res,next){
	var refreshToken  = req.body.refreshToken
	if(refreshToken in refreshTokens){
		delete refreshTokens[refreshToken]
	}
	res.send(204);
})

module.exports = router;
