var express = require('express')
var router = express.Router();

var mysql = require('mysql')
var dbconfig = require('../config').db;
var connection = mysql.createConnection(dbconfig);

var bkfd2Password = require('pbkdf2-password');
var hasher = bkfd2Password();

var mailer = require('./mailer')


connection.connect();

router.get('/signup', function(req,res, next){

    console.log(req.user);

    if(req.user !== undefined){
        res.redirect('/');
    }
    else{
        res.render('signup', {
            title: "signup",
            dup : false
        });
    }
});


router.post('/signup', async function(req, res){
    var result = req.body;
    const data ={
        "email" : result.email,
        "name" : result.name,
        "password" : result.password
    }

    var query1 = `SELECT COUNT(*) FROM user WHERE email="${data.email}"`;
    console.log('data in post:',data);
    connection.query(query1, async (err,result) => {
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
                hasher({password: data.password }, async (err, pass, salt, hash) =>{
                    if(err){
                        console.log("hasing error! : " + err);
                    }
                    else{
                        var query2 = `INSERT INTO user(email, password, name, role,salt) VALUES("${data['email']}","${hash}","${data['name']}", "unauth" ,"${salt}")`;
                        console.log("addUser query:"+ query2);
                        connection.query(query2,async (err,result)=>{
                            mailer.sendEmail(data['email'],'confirm');
                            res.redirect('/certification/done');
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

router.get('/sendmail', function(req, res){

});


module.exports = router;
