var express = require('express');
var router = express.Router();

var redis = require('redis');
var session = require('express-session');
var redisStore = require('connect-redis')(session);
var redisConfig = require('../config').redis;
var redisclient = redis.createClient(redisConfig);



router.get('/', function(req,res){
    // redisclient.del(req.sessionID , function(err, response){
    //     console.log("response:",response);
    //     if(response == 1){
    //         res.redirect('/');
    //     }
    //     else{
    //         console.log('cannot delete');
    //     }
    // })
    req.session.destroy(function(err){
        if(err){
            console.log(err);
        }else{
            res.redirect('/');
        }

    });
    
});

module.exports = router;