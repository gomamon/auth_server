var express = require('express');
var router = express.Router();


var mysql = require('mysql');
var dbConfig = require('../config').db;
var connection = mysql.createConnection(dbConfig);


//hasing
var bkfd2Password = require("pbkdf2-password");
var hasher = bkfd2Password();


var SECRET = require('../config').jwt;
var passport = require('passport');

// var passportJWT = require('passport-jwt');
// var JWTStrategy = passportJWT.Strategy;
// var extractJWT = passportJWT.ExtractJwt;
var localStrategy =require('passport-local').Strategy;
var kakaoStrategy =require('passport-kakao').Strategy;
var clientID = require('../config').kakao.key;

connection.connect();

passport.serializeUser(function (user,done){
    done(null, user);
});

passport.deserializeUser(function (user, done){
    done(null, user);
});

var isAuthenticated = function (req, res, next) {
    if (req.isAuthenticated())
      return next();
    res.redirect('/signin');
};
  

// function signinByThirdparty(info, done) {
//     console.log('process : ' + info.auth_type);
//     var stmt_duplicated = 'select *from `user` where `user_id` = ?';
  
//     connection.query(stmt_duplicated, info.auth_id, function (err, result) {
//       if (err) {
//         return done(err);
//       } else {
//         if (result.length === 0) {
//           var stmt_thridparty_signup = 'insert into `user` set `user_id`= ?, `nickname`= ?';
//           connection.query(stmt_thridparty_signup, [info.auth_id, info.auth_name], function (err, result) {
//             if(err){
//               return done(err);
//             }else{
//               done(null, {
//                 'user_id': info.auth_id,
//                 'nickname': info.auth_name
//               });
//             }
//           });
//         } else {
//           //  TODO 기존유저 로그인 처리
//           console.log('Old User');
//           done(null, {
//             'user_id': result[0].user_id,
//             'nickname': result[0].nickname
//           });
//         }
//       }
//     });
//   }
  


passport.use('signin-kakao', new kakaoStrategy({
        clientID: clientID,
        callbackURL : 'http://localhost:3000/oauth'
    },
    (accessToken, refreshToken, profile, done) => {
        console.log(profile);
        console.log("hihi");
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
                            return done(null, user);
                        }
                        else{
                            return done(null, false, {message: 'Incorrect Password!'});
                        }
                    }
                });
            }    
            else{
                return done(null, false, { message: 'Incorrect Email!' });
            }
        });
    })
)





// passport.use(new JWTStrategy({
//         jwtFromRequest : extractJWT.fromAuthHeaderAsBearerToken(),
//         secretOrKey : SECRET
//     },
//     function (jwtPayload, done){
//         return UserModel
//     }
    
//     ))

router.get('/signin', function (req, res) {

    if (req.user !== undefined) {
      res.redirect('/');
    } else {
      res.render('signin', {
        title: 'signin',
        wrong: false
      })
    }
  
  });

router.post('/signin', passport.authenticate('local',{failureRedirect: '/siginin', failureFlash: true}),
    function(req,res){
        console.log("login Success!");        
        res.redirect('/');
    }
)

module.exports = passport;
module.exports = router;
