var express = require('express')
var router = express.Router();
var bodyParser = require('body-parser')
var mysql = require('mysql')
var dbconfig = require('../config').db;
var urlencodedParser = bodyParser.urlencoded({ extended: false})
var connection = mysql.createConnection(dbconfig);
var bkfd2Password = require('pbkdf2-password');
var hasher = bkfd2Password();
var SECRET = require('../config').jwt;
var mailer = require('./mailer')


connection.connect();

router.get('/', function(req,res, next){
    if(req.session.user){
        var token = req.session.user;
		var decoded = jwt.verify(token, SECRET);
		if(decoded){
			res.status(200).redirect('/');
		}else{
            res.render('signup', {
                title: "signup",
                dup : false
            });
        }
    }else{
        res.render('signup', {
            title: "signup",
            dup : false
        });
	}
	
});


router.post('/', async function(req, res){
    var result = req.body;
    const data ={
        "email" : result.email,
        "name" : result.name,
        "password" : result.password
    }

    var query1 = `SELECT COUNT(*) FROM user WHERE email="${data.email}"`;
    console.log('data in post:',data);
    connection.query(query1, (err,result) => {
        if(!err){
            console.log("result:: "+ result[0]['COUNT(*)']);
            if(result[0]['COUNT(*)'] > 0){
                res.render('signup', {
                    title: "signup",
                    dup : true
                });
                return;
            }
            else{
                hasher({password: data.password }, (err, pass, salt, hash) =>{
                    if(err){
                        console.log("hasing error! : " + err);
                    }
                    else{
                        var query2 = `INSERT INTO user(email, password, name, role,salt) VALUES("${data['email']}","${hash}","${data['name']}", "unauth" ,"${salt}")`;
                        console.log("addUser query:"+ query2);
                        connection.query(query2,(err,result)=>{
                            mailer.sendEmail(data['email']);
                            res.redirect('/');
                            return;
                        });   
                    }
                    
                });
                
            }
            
        }
        else{
            console.log("error!"+err);
        }
    });
});


module.exports = router;
