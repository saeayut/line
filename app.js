var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 80;
var mongoose = require('mongoose');
const bodyParser = require('body-parser')
// getting-started.js

mongoose.connect('mongodb+srv://linedb:-a629MswXJbQg.s@cluster0-icq9o.gcp.mongodb.net/linedb', {useNewUrlParser: true});
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log("Connection Successful!");
    
    // define Schema
    var UserSchema = mongoose.Schema({
      userId: String,
      displayName: String,
      pictureUrl: String,
      statusMessage: String,
      message:String
    });
 
    // compile schema to model
    var User = mongoose.model('User', UserSchema, 'user');
 
    var token = {
        'U0dcf28bfe4889f1a9fb7c5d5bb5dd1fc':'9BdaPhMtv8sNU6ChVdexU4mv5S5gjoEUmnjqhxk6gBx6K54kaNVX+Lt36z/GNJ3eL9fj3kijruAY4KU4Q4LWayGSzAXUBRd1HO1ni+4Qwi6BvJKeJoJ6/lR2jIE4gFrwLi1pRnzS1w9PJT+XN/QTagdB04t89/1O/w1cDnyilFU=',
        'U1d2ad49e2bc1f6a66b3725e03dc0ae9a':'hxzyp5amkxq+/Kt0j7JiuWfZimNby6H03L9x6cpJgLOKjsKsNY23yvh7rc5WTb51SDgetYsEhjDNoj+mQb0M/30g8+UQM+WPbwSAbTeBK6t2lHNcsbmW8q4WopXRTeEOhR5e8su6b8l4SVZ2ULBa/AdB04t89/1O/w1cDnyilFU='
    }
    
    var official = {
        'U0dcf28bfe4889f1a9fb7c5d5bb5dd1fc':'over99',
        'U1d2ad49e2bc1f6a66b3725e03dc0ae9a':'ISC Partner'
    }
    
    io.on('connection', function (socket) {
      socket.on('s2c', function (msg) {
        io.emit('s2c', msg);
      });
    
      socket.on('s2u', function (msg) {
        let headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer {'+msg.official_token+'}'
        }
        let body = JSON.stringify({
            to: msg.userId,
            messages: [{
                type: 'text',
                text: msg.msg
            }]
        })
        request.post({
            url: 'https://api.line.me/v2/bot/message/push',
            headers: headers,
            body: body
        }, (err, res, body) => {
            console.log('status = ' + res.statusCode);
        });
      });
      
    });
    
    const request = require('request')
    
    var accessToken = ""
    
    app.use(express.static(__dirname));
    app.use(bodyParser.urlencoded({ extended: false }))
    app.use(bodyParser.json())
    
    app.get('/', (req, res) => {
        res.sendFile(__dirname + '/index.html');
    });

    app.use('/', express.static('public'))
      
    app.post('/webhook', (req, res) => {
        let reply_token = req.body.events[0].replyToken
        let msg = req.body.events[0].message.text
        // reply(reply_token, msg)

        if(req.body.events[0].source.userId) io.emit(req.body.events[0].source.userId,req.body.events[0].message.text)
        getProfile(token[req.body.destination],req.body.events[0].source.userId,function(err, body){
            if(err){
                console.log(err);
            } else {
                var json = JSON.parse(body)
                // createUser(json.userId,json.displayName,json.pictureUrl,json.statusMessage,msg)
                io.emit('s2c',{ data:req.body.events[0] , displayName:json.displayName , official:{name:official[req.body.destination],token:token[req.body.destination]}})
            }
        })
        res.sendStatus(200)
    })
    
    createUser = function(userId,displayName,pictureUrl,statusMessage,message){
        var user = new User({
            userId: userId,
            displayName: displayName,
            pictureUrl: pictureUrl,
            statusMessage: statusMessage,
            message:message
        });

        // save model to database
        user.save(function (err, user) {
            if (err) return console.error(err);
            console.log(user.userId + " saved to user collection.");
        });
    }
    // function reply(reply_token,msg) {
    //     let headers = {
    //         'Content-Type': 'application/json',
    //         'Authorization': 'Bearer {'+accessToken+'}'
    //     }
    //     let body = JSON.stringify({
    //         replyToken: reply_token,
    //         messages: [{
    //             type: 'text',
    //             text: msg
    //         }]
    //     })
    //     request.post({
    //         url: 'https://api.line.me/v2/bot/message/reply',
    //         headers: headers,
    //         body: body
    //     }, (err, res, body) => {
    //         console.log('status = ' + res.statusCode);
    //     });
    // }

    function getProfile(officialToken,userId,callback){
        let headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer {'+officialToken+'}'
        }
        request.get({
            url: 'https://api.line.me/v2/bot/profile/'+userId,
            headers: headers,
        }, (err, res, body) => {
            callback(null,body)
        });
    }
});

http.listen(port, function () {
    console.log('listening on *:' + port);
});