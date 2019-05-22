var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 80;
var mongoose = require('mongoose');
const request = require('request')
const bodyParser = require('body-parser')

//Model mongodb
const official = require('models/official');

mongoose.connect('mongodb://linebotdb:linebotdb123@mongodb-2624-0.cloudclusters.net:10003/lineBitDB?authSource=admin', {useNewUrlParser: true});
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log("Connection Successful!");
    
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
    
    var accessToken = ""
    
    app.use(express.static(__dirname));
    app.use(bodyParser.urlencoded({ extended: false }))
    app.use(bodyParser.json())
    
    app.get('/', (req, res) => {
        res.sendFile(__dirname + '/index.html');
    });

    app.use('/', express.static('public'))
      
    app.post('/webhook', (req, res) => {
        console.log(req.body);
        
        res.sendStatus(200)
    })
    
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