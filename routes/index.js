var express = require('express');
var router = express.Router();



router.use('/signup', require('./signup'));


router.get('/', function(req, res, next) {
	console.log(req.user);
	if (req.user !== undefined) {
		res.render('index', {
			title: `hello ${req.user.name}`,
			name:`${req.user.name}`,
			logged_in: true
		});

	  } else {
		res.render('index',{
			title: "who are you?",
			logged_in : false
		})
	  }

})




/* GET home page. */
// router.get('/', function(req, res, next) {
// 	if(req.session.user){
// 		// var token = req.cookies.user;
// 		var token = req.session.user;
// 		var decoded = jwt.verify(token, SECRET);
// 		if(decoded){
// 			res.render('index', {
// 				title: `hello ${decoded.name}`,
// 				name:`${decoded.name}`,
// 				logged_in: true
// 			});
// 		}
// 		else{
// 			res.render('index',{
// 				title: "로그인이 만료되었습니다ㅠㅠ 다시 로그인을 해주세요!",
// 				logged_in : false
// 			});
// 		}
		
// 	}
// 	else{
// 		res.render('index',{
// 			title: "who are you?",
// 			logged_in : false
// 		})
// 	}

// });


module.exports = router;
