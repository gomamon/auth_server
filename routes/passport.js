var express = require('express');
var router = express.Router();

var mysql = require('mysql');
var dbConfig = require('../config').db;
var connection = mysql.createConnection(dbConfig);

//hasing
var bkfd2Password = require("pbkdf2-password");
var hasher = bkfd2Password();

var SECRET = require('../config').jwt.certification;
var passport = require('passport');

// var passportJWT = require('passport-jwt');
// var JWTStrategy = passportJWT.Strategy;
// var extractJWT = passportJWT.ExtractJwt;
var localStrategy =require('passport-local').Strategy;
var kakaoStrategy =require('passport-kakao').Strategy;
var clientID = require('../config').kakao.key;

connection.connect();

passport.serializeUser(function (user,done){
    console.log('passport serializeUser call')
    done(null, user);
});

passport.deserializeUser(function (user, done){
    console.log('passport deserializeUser call')
    done(null, user);
});

var isAuthenticated = function (req, res, next) {
    if (req.isAuthenticated())
      return next();
    res.redirect('/signin');
};
  

function signinByThirdparty(info, done) {
    
    console.log('process : ' + info.auth_type);
    var stmt_duplicated = 'select * from user where email = ?';
  
    connection.query(stmt_duplicated, info.auth_id, function (err, result) {
      if (err) {
        return done(err);
      } else {
        if (result.length === 0) {
          var stmt_thridparty_signup = 'insert into user set email = ?, name = ?, password = ?, salt=?, role = ?';
          connection.query(stmt_thridparty_signup, [info.auth_id, info.auth_name, '', '','kakao'], function (err, result) {
            if(err){
              return done(err);
            }else{
              done(null, {
                'email': info.auth_id,
                'name': info.auth_name,
                'role' : 'kakao'
              });
            }
          });
        } else {
          console.log('Old User');
          done(null, {
            'email': result[0].email,
            'name': result[0].name,
            'role': result[0].role
          });
        }
      }
    });
  }
  


passport.use('signin-kakao', new kakaoStrategy({
        clientID: clientID,
        callbackURL : 'http://localhost:3000/oauth'
    },
    function(accessToken, refreshToken, profile, done){
        var _profile = profile._json;
        console.log('KaKao login info');
        console.log(_profile);

        signinByThirdparty({
            'auth_type': 'kakao',
            'auth_id': _profile.id+'@kakao',
            'auth_name': _profile.properties.nickname,
        }, done);
    }
));
router.get('/kakao', passport.authenticate('signin-kakao'));


router.get('/oauth',
    passport.authenticate('signin-kakao',{
        successRedirect: '/',
        failureRedirect: '/signin'
    })
)


passport.use(
    new localStrategy({
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback: true
    },
    function(req, email, password, done){
        var query = `select * from user where email="${email}"`;
        connection.query(query, (err,result)=>{
            console.log("query result: "+result);
            if(err){
                return done(err)
            }
            else if(result.length >0){
                hasher({password : password , salt : result[0].salt},(err,pass,salt,hash)=>{
                    if(err){
                        return done(err);
                    }
                    else{
                        if(hash ===result[0].password){
                            var user = {
                                'email' : result[0].email,
                                'name' : result[0].name,
                                'role' : result[0].role
                            }
                            if(user.role === "unauth")
                                return done(null, false, req.flash('err','unauth'));
                            else
                                return done(null, user);

                        }
                        else{
                            return done(null, false, req.flash('err','password'));
                        }
                    }
                });
            }    
            else{
                return done(null, false, req.flash('err','email') );
            }
        });
    })
)



router.get('/signin', function (req, res) {
    var flash = req.flash('err');
    console.log(flash);
    if (req.user !== undefined) {
        res.redirect('/');
    } 
    else {
        if(flash == null || flash == ''){
            res.render('signin', {
                title: 'signin',
                wrong: false,
                errmsg: ''
            });
        }
        else{
            var errmsg = {
                unauth :'인증안된 계정입니다! 메일함을 확인해 주세요~',
                password: '삐빕- 틀린 비밀번호를 입력하셨습니다!',
                email: '삐빕- 존재하지 않는 이메일입니다!'
            }

            res.render('signin', {
                title: 'signin',
                wrong: true,
                errmsg: errmsg[flash] ,
                errtype: flash
            });
        }
    }
  
  });

router.post('/signin', 
    passport.authenticate(
        'local',
        {
            failureRedirect: '/signin', 
            failureFlash: true
        }
    ),
    function(req,res){
        console.log("login Success!");        
        res.redirect('/');
    }
)

// module.exports = passport;
module.exports = router;
