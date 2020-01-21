var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var mailconfig = require('../config').gmail

//token
var jwt = require("jsonwebtoken");
var randtoken = require("rand-token");
var jwtconfig = require('../config').jwt.certification

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

module.exports = {
    sendEmail: (emailto)=>{ 
        var emailToken = jwt.sign(
            {
                user : emailto
            },
            jwtconfig,
            {
                expiresIn: '1d',
            }
        )

        var url =`http://localhost:3000/confirmation/${emailToken}`;

        console.log("emailto:"+emailto+typeof(emailto));
        transporter.sendMail({
            from: mailconfig.email,
            to: emailto,
            subject: '훈민정음 이메일인증 해주시지요.',
            html:`해당 링크를 누르면 자네는 훈민정음의 진정한 회원이 될수있지... <a href="${url}">${url}</a>`
        }, function(err,res){
            if(err){
                console.log("smpterror!"+err);
            }else{
                console.log(res);
            }
        })
    }
}
    