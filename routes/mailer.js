var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var mailconfig = require('../config').gmail

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
        console.log("emailto:"+emailto+typeof(emailto));
        transporter.sendMail({
            from: mailconfig.email,
            to: emailto,
            subject: '훈민정음 이메일인증 해주시지요.',
            text:'사실은 테스트이오만..'
        }, function(err,res){
            if(err){
                console.log("smpterror!"+err);
            }else{
                console.log(res);
            }
        })
}
}
    