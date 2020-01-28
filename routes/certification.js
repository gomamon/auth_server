

var express = require('express')
var router = express.Router();

var mysql = require('mysql')
var dbconfig = require('../config').db;
var connection = mysql.createConnection(dbconfig);
connection.connect();

var jwt = require("jsonwebtoken");
var SECRET = require('../config').jwt.certification;

var redis = require('redis');
var session = require('express-session');
var redisStore = require('connect-redis')(session);
var redisConfig = require('../config').redis;
var redisclient = redis.createClient(redisConfig);




router.get('/confirmation/:token', (req, res) => {
    try{
        var decoded = jwt.verify(req.params.token, SECRET)
        console.log(decoded);
        if(decoded){
            var query = `UPDATE user SET role='auth' WHERE email = '${decoded.user}'`;
            connection.query(query,(err,result)=>{
                if(err){
                    console.log(err);
                }else{
                    console.log("query"+query);
                    res.redirect('/confirm');
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
})


router.get('/certification/done',(req,res) => {
    try{
        res.render('certification_done',{
            title: 'certification_done'
        });
    }
    catch(err){
        console.log(err);
    }
})

router.get('/confirm',(req,res) => {
    try{
        res.render('confirm',{
            title: 'confirm'
        });
    }
    catch(err){
        console.log(err);
    }
})



router.get('reset/:token', (req, res) => {
    try{
        var decoded = jwt.verify(req.params.token, SECRET)
        console.log(decoded);
        if(decoded){
            var query = `UPDATE user SET role='auth' WHERE email = '${decoded.user}'`;
            connection.query(query,(err,result)=>{
                if(err){
                    console.log(err);
                }else{
                    console.log("query"+query);
                    res.redirect('/');
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
})


module.exports = router;