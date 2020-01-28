var express = require('express')
var router = express.Router();

var mysql = require('mysql')
var dbconfig = require('../config').db;
var connection = mysql.createConnection(dbconfig);
connection.connect();

var jwt = require("jsonwebtoken");
var SECRET = require('../config').jwt;

var bkfd2Password = require('pbkdf2-password');
var hasher = bkfd2Password();

var mailer = require('./mailer')


router.get('/reset/password/:token', (req, res) => {
    try{
        var decoded = jwt.verify(req.params.token, SECRET.reset)
        var email = decoded.user;
        console.log(decoded);
        if(decoded){
            var query = `SELECT COUNT(*) FROM user WHERE email = "${email}"`;
            connection.query(query,(err,result)=>{
                console.log(result);
                if(err){
                    console.log(err);
                }else{
                    if(result[0]['COUNT(*)']>0){
                        res.cookie('reset_token', req.params.token);
                        res.render('reset_from_key', {
                            title: "reset password",
                            email : email
                        });
                    }
                    else{
                        res.redirect('/');
                    }
                }
            });   
        }else{
            render('/err',{
                message : "jwt token is expired!"
            })
        };
    } catch(err){
        console.log(err);
    }
});





router.post('/reset/submit-password', (req, res) => {
    var token = req.cookies.reset_token;
    var decoded = jwt.verify(token, SECRET.reset);
    var email = decoded.user;
    console.log("token!!!!!!!"+token+"email!!!!!"+email);

    var query1 = `select * from user where email="${email}"`;
    var password = req.body.password;
    console.log("pass:"+password);
    connection.query(query1, (err,result) => {
        console.log("query result" + result);
        if(err){
            console.log("db connection err : "+err);
        }
        else{
            if(result.length > 0){
                hasher({password: password }, (err, pass, salt, hash) =>{
                    if(err){
                        console.log("hasing error! : " + err);
                    }
                    else{
                        var query2 = `UPDATE user SET password='${hash}', salt='${salt}' WHERE email = '${email}'`;
                        console.log("addUser query:"+ query2);
                        connection.query(query2,(err,result)=>{
                            if(!err){
                                console.log("here!"+result);
                                res.clearCookie('reset_token')
                                res.redirect("/reset/password-done");
                                return;
                            }else{
                                console.log("dberror! "+err);
                                return;
                            }
                        });   
                    }
                    
                });
            }
            
        }
    })
})



router.get('/reset/password-done', (req,res) => {
    res.render('reset_from_key_done',{
        title: "complete reset your password"
    })
})

router.post('/reset', (req,res)=>{
    var email = req.body.email;
    var query = `select * from user where email="${email}"`;

    connection.query(query, (err,result) => {
        console.log("query result" + result);
        if(err){
            console.log("db connection err : "+err);
        }
        else{
            if(result.length > 0){
                mailer.sendEmail(email, "reset");
                res.render("reset_done", {
                    title : "reset"
                })
            }
        }
    })
})

router.get('/reset', (req,res) => {
    res.render("reset",{
        title: "reset"
    });
})


module.exports = router;