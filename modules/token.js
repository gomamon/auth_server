const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
const randtoken = require('rand-token')
const refreshTokens = {}
const SECRET = require('../config').jwt


// router.post('/token', function(req,res,next){
//     var name = req.body.name;
//     var role = req.body.role;
//     var refreshToken = req.body.refreshToken;
//     if((refreshToken in refreshTokens) && (refreshTokens[refreshToken] == name)){
//         var user = {
//             'username' : name,
//             'role' : role
//         }
//         var token = jwt.sign(user, SECRET, {expiresIn:300})
//         res.json({token: 'JWT'+token})
//     }
//     else{
//         res.send(401)
//     }
// })


// router.post('token/reject', function(req,res,next){
//     var refershToken = req.body.refreshToken
//     if(refershToken in refreshTokens){
//         delete refershTokens[refreshToken]
//     }

//     res.send(204);
// })


// var passport = require('passport')
// var JwtStrategy = require('passport-jwt').Strategy





// token start
					// var user = {
					// 	'email' : result[0].email,
					// 	'name' : result[0].name,
					// 	'role' : result[0].role,
					// }
					// var token = jwt.sign(user, SECRET, {expiresIn:'1m'})
					// res.cookie("user", token);
					// res.json({token: token});
					// token end