var express = require('express');
var router = express.Router();

router.get('/', function(req,res){
    req.session.destroy(function(err){
        if(err){
            console.log(err);
            response.send('session is not destroy');
        }else{
            console.log("signout");
            req.logout();
            res.redirect('/');
        }
    })
});

module.exports = router;