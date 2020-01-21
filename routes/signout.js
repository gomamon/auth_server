var express = require('express');
var router = express.Router();

router.get('/', function(req,res){
    delete req.session.user;
    req.logout();
    res.redirect('/');
});

module.exports = router;