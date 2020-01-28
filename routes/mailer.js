var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var mailconfig = require('../config').gmail

//token
var jwt = require("jsonwebtoken");
var randtoken = require("rand-token");
var jwtconfig = require('../config').jwt

//redis
var redis = require('redis');
var session = require('express-session');
var redisStore = require('connect-redis')(session);
var redisConfig = require('../config').redis;
var redisclient = redis.createClient(redisConfig);


var smptAuth = {
    user: mailconfig.email,
    pass: mailconfig.password
}

var transporter = nodemailer.createTransport(
    smtpTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        auth: smptAuth
    })
)


function getRandomStr() {
	var arr  = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var result = '';				
    for(var i = 0; i < 6; i++) {
        result += arr.charAt(Math.floor(Math.random() * arr.length));
    }
    console.log(result);
    return result
}
	

module.exports = {
    sendEmail: (emailto, type)=>{ 

        var confirmToken = jwt.sign(
            {
                user : emailto,
                rand : getRandomStr(),
            },
            jwtconfig.certification,
            {
                expiresIn: '10m',
            }
        )
        var resetToken = jwt.sign(
            {
                user : emailto,
                rand : getRandomStr(),
            },
            jwtconfig.reset,
            {
                expiresIn: '1d',
            }
        )

        var subjects = {
            confirm : '고마몬 이메일인증 해주시지요.',
            reset : '고마몬 비밀번호 초기화'
        }
        var url = {
            confirm : `http://localhost:3000/confirmation/${confirmToken}`,
            reset : `http://localhost:3000/reset/password/${resetToken}`
        }
        var contents = {
            confirm : `해당 링크를 누르면 자네는 고마몬의 진정한 회원이 될수있지... <a href="${url[type]}">${url[type]}</a>`,
            reset : `해당 링크를 누르면 자네의 비밀번호를 다시 설정할 수 있을 걸세 <a href="${url[type]}">${url[type]}</a>`,
        }

        console.log("emailto:"+emailto+typeof(emailto));
        transporter.sendMail({
            from: mailconfig.email,
            to: emailto,
            subject: subjects[type],
            html: contents[type],
        }, function(err,res){
            if(err){
                console.log("smpterror!"+err);
            }else{
                // redisclient.sadd(url[type],'');
                console.log(res);
            }
        })
    }
}
    

