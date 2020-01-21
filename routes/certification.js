

var express = require('express')
var router = express.Router();

var mysql = require('mysql')
var dbconfig = require('../config').db;
var connection = mysql.createConnection(dbconfig);
connection.connect();


var jwt = require("jsonwebtoken");
var SECRET = require('../config').jwt;


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