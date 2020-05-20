const fs = require('fs');
var express = require('express');
var app = express();
const http = require('http');
const https = require('https');
var port = process.env.PORT || 80;
const bodyParser = require('body-parser')
const formidable = require('formidable')

const core = require('./core')
const func = require('./func')

let user = {
    email:'test@test.com',
    pass:'test'
}

// Starting both http & https servers
const httpServer = http.createServer(app);

var io = require('socket.io')(httpServer);

app.use(express.static(__dirname));
app.use(bodyParser.urlencoded({
    extended: false
}))
app.use(bodyParser.json())

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.use('/', express.static('public'))
app.get('/settings' , async (req,res) => {

})

app.post('/edituserinfo' , async (req,res) => {
    const userFindOne = await core.userFindOne(req.body.userId)
    const data = {
        displayName:userFindOne.userProfile[0].displayName,
        pictureUrl:userFindOne.userProfile[0].pictureUrl,
        statusMessage:userFindOne.userProfile[0].statusMessage,
        firstname:req.body.firstname,
        lastname:req.body.lastname,
        idline:req.body.idline,
        phonenumber:req.body.phonenumber,
        bank:req.body.bank,
        promotion:req.body.promotion
    }

    const userSave = await core.updateUserProfile(req.body.userId,data)
    
    res.json({res:"SUCCESS"})
})

app.post('/transaction', async(req,res) => {
    const userFindOne = await core.userFindOne(req.body.userId)
    if(userFindOne) res.json(userFindOne.transaction)
})

app.post('/transactionadd' , async(req,res) => {
    const userUpdateTransaction = await core.updateUserTransaction(req.body.userId,{cmd:req.body.cmd,amount:req.body.amount,date:req.body.date})
    res.json({res:"SUCCESS"})
})

app.get('/promotion' , async (req,res) => {
    const promotion = await core.promotion()
    res.json(promotion)
})

app.post('/promotionadd' , async (req,res) => {
    const promotionAdd = await core.promotionAdd(req.body.title)
    res.json({res:promotionAdd})
})

app.post('/promotionedit' , async (req,res) => {
    const promotionEdit = await core.promotionEdit(req.body.id,req.body.title)
    res.json({res:"SUCCESS"})
})

app.post('/promotiondelete' , async (req,res) => {
    const promotionDelete = await core.promotionDelete(req.body.id)
    res.json({res:"SUCCESS"})
})

app.get('/official' , async (req,res) => {
    const official = await core.OfficialFind()
    res.json(official)
})

app.post('/officialadd' , async (req,res) => {
    const officialAdd = await core.OfficialAdd(req.body)
    res.json({res:officialAdd})
})

app.post('/officialdelete' , async (req,res) => {
    const officialDelete = await core.OfficialDelete(req.body.id)
    res.json({res:"SUCCESS"})
})

app.post('/login',function(req,res){
    const email = req.body.email
    const pass = req.body.pass
    
    if(email == user.email && pass == user.pass){
        res.json({res:"SUCCESS"})
    } else {
        res.json({res:"ERROR"})
    }
})

app.get('/main',function(req,res){
    res.sendFile(__dirname + '/public/main.html');
})

app.post('/login',function(req,res){
    const email = req.body.email
    const pass = req.body.pass
    
    if(email == user.email && pass == user.pass){
        res.sendFile(__dirname + '/public/main.html');    
    } else {
        res.sendFile(__dirname + '/public/index.html');
    }
    
})

app.post('/upload', function(req, res) {
    var form = new formidable.IncomingForm();

    form.parse(req);

    form.on('fileBegin', function (name, file){
        var fileName = new Date().getTime() + "_" + file.name
        file.path = __dirname + '/uploads/' + fileName;

        res.send(fileName)
    });
});

app.get('/userDirect' ,async (req,res) => {

    const user = []
    const userFind = await core.userFind()

    userFind.forEach(element => {

        const last = element.messages[element.messages.length - 1]
        var lasttext = ""
        var lasttimestamp = ""
        if(last.user) {
            lasttext = {user:last.user.text}; 
            lasttimestamp = last.user.timestamp
        }
        if(last.administrator) {
            lasttext = {administrator:last.administrator.text}; 
            lasttimestamp = last.administrator.timestamp
        }
        
        user.push({
            userId:element.userId,
            userProfile:{
                displayName:element.userProfile[0].displayName,
                pictureUrl:element.userProfile[0].pictureUrl,
                statusMessage:element.userProfile[0].statusMessage,
            },
            lasttext:lasttext,
            lasttimestamp:lasttimestamp,
            official_profile:element.official_profile,
            official_token:element.official_Token,
            destination:element.destination,
            unread:element.unread
        })
    });
    
    res.json(user)
})

app.get('/userDirect/:id' ,async (req,res) => {
    const userFindOne = await core.userFindOne(req.params.id)
    res.json(userFindOne)
})

app.post('/webhook', async (req, res, next) => {
    let id = req.body.events[0].message.id
    let userId = req.body.events[0].source.userId
    let type = req.body.events[0].message.type
    let timestamp = req.body.events[0].timestamp
    let destination = req.body.destination
	
	console.log(destination)
    try {
        if(destination){
            const officialInfo = await core.OfficialFindOne(destination)
            if(officialInfo){
                console.log(1)
                const profile = await func.getProfile(officialInfo.official_token, userId)
                const userFindOne = await core.userFindOne(userId)

                let msg = ""
                
                if(type == "text"){
                    msg = {type:'text',id:req.body.events[0].message.id,text:req.body.events[0].message.text}
                } else if(type == "image") {
                    const getImage = await func.getImage({id:id,official_token:officialInfo.official_token})
                    msg = {type:'image',id:req.body.events[0].message.id}
                } else if(type == "sticker"){
                    msg = {type:'sticker',id:req.body.events[0].message.id,stickerId:req.body.events[0].message.stickerId,packageId:req.body.events[0].message.packageId}
                }
                
                console.log(userId + " " + JSON.stringify(msg));

                if(userFindOne){
                    userFindOne.messages.push({
                        'user':{
                            'text':msg,
                            'timestamp':timestamp,
                        }
                    })

                    var newmsg = userFindOne.messages
                    const userSave = await core.updateUserMsg(userId,newmsg)
                    
                } else {
                    let data = {
                        'userId':userId,
                        'userProfile':{
                            'displayName':profile.data.displayName,
                            'pictureUrl':profile.data.pictureUrl,
                            'statusMessage':profile.data.statusMessage,
                        },
                        'messages':{
                            'user':{
                                'text':msg,
                                'timestamp':timestamp,
                            }
                        },
                        'official_profile':officialInfo.official_profile,
                        'official_Token':officialInfo.official_token,
                        'destination':destination
                    }

                    const createUser = await core.createUser(data)

                }

                io.emit(userId,{userId:userId,
                    text:msg,
                    timestamp:timestamp,
                    userProfile:{
                        'displayName':profile.data.displayName,
                        'pictureUrl':profile.data.pictureUrl,
                        'statusMessage':profile.data.statusMessage,
                    },
                })

                io.emit('s2direct',{
                    userId:userId,
                    text:msg,
                    timestamp:timestamp,
                    userProfile:{
                        'displayName':profile.data.displayName,
                        'pictureUrl':profile.data.pictureUrl,
                        'statusMessage':profile.data.statusMessage,
                    },
                    official_profile:officialInfo.official_profile,
                    official_token:officialInfo.official_token
                })          
            } 
        }
    } catch (e) {
        next(e)
    }

    res.sendStatus(200)
})

io.on('connection', async (socket) => {

    socket.on('s2direct' , async (res) => {
        io.emit('s2direct',res)
    })

    socket.on('s2u', async (res) => {
        
        const userFindOne = await core.userFindOne(res.userId)
        if(userFindOne){

            if(res.type == "text"){
                userFindOne.messages.push({
                    'administrator':{
                         'text':{type:'text',text:res.msg},
                         'timestamp':new Date().getTime(),
                     } 
                })
            }

            if(res.type == "image"){
                userFindOne.messages.push({
                    'administrator':{
                         'text':{type:'image',image:res.image},
                         'timestamp':new Date().getTime(),
                     } 
                 })
            }

            var newmsg = userFindOne.messages
            
            const userSave = await core.updateAdmin(res.userId,newmsg)
            
        } 
        const sendMessageToUser = await func.sendMessageToUser(res)
        
    });


    socket.on('read', async (res) => {
        const userRead = await core.userRead(res)
    })

    socket.on('s2a', async (res) => {
        const userFind = await core.userFind()
    
        userFind.forEach(async element => {
            var params = {type:'text',userId:element.userId,official_token:element.official_Token,msg:res.text}
            const sendToAll = await func.sendMessageToAll(params)

            const userFindOne = await core.userFindOne(element.userId)
            userFindOne.messages.push({
                'administrator':{
                    'text':{type:'text',text:res.text},
                    'timestamp':new Date().getTime(),
                }
            })

            var newmsg = userFindOne.messages
            
            const userSave = await core.updateAdmin(element.userId,newmsg)
        });

    })
    // const userFind = await core.userFind()

    // userFind.forEach(element => {
    //     socket.on(element.userId, async (res) => {
    //         console.log(res);
    //     })
    // })
});

httpServer.listen(80, () => {
	console.log('HTTP Server running on port 80');
});