
const axios = require('axios');
const fs = require('fs');

module.exports = {
    getProfile : async (officialToken,userId) => {
        try {
            return await axios({ 
                method: 'GET',
                url: 'https://api.line.me/v2/bot/profile/'+userId,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer {'+officialToken+'}'
                }
            })
        } catch (error) {
            console.error(error)
        }
    },
    sendMessageToUser : async (data) => {
        console.log(data);
        
        try {
            if(data.type == "text") {
                return await axios({ 
                    method: 'POST',
                    url: 'https://api.line.me/v2/bot/message/push',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer {'+data.official_token+'}'
                    },
                    data: {
                        to: data.userId,
                        messages: [{type: 'text',text: data.msg}]
                    }
                })
            }
/////////////////img //////////////
            if(data.type == "image") 
            {
                return await axios(
                { 
                    method: 'POST',
                    url: 'https://api.line.me/v2/bot/message/push',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer {'+data.official_token+'}'
                    },
                    data: {
                        to: data.userId,
                        messages: [{
                            type: "image",
                            originalContentUrl: "https://i.pinimg.com/564x/aa/bc/1c/aabc1c298dc58ed968c03c4e6526fb3f.jpg",
                            previewImageUrl: "https://i.pinimg.com/564x/aa/bc/1c/aabc1c298dc58ed968c03c4e6526fb3f.jpg"

                        }]
                    }
                })
            }
        } 
        catch (error) 
        {
            console.error(error)
        }
    },
    sendMessageToAll : async (data) => {
        try {
            if(data.type == "text") {
                return await axios({ 
                    method: 'POST',
                    url: 'https://api.line.me/v2/bot/message/push',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer {'+data.official_token+'}'
                    },
                    data: {
                        to: data.userId,
                        messages: [{
                            type: 'text',
                            text: data.msg
                        }]
                    }
                })
            }

            if(data.type == "image") {
                return await axios({ 
                    method: 'POST',
                    url: 'https://api.line.me/v2/bot/message/push',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer {'+data.official_token+'}'
                    },
                    data: {
                        to: data.userId,
                        messages: [{
                            type: "image",
                            originalContentUrl: "https://jlowrax.cf/uploads"+data.image,
                            previewImageUrl: "https://i.pinimg.com/564x/aa/bc/1c/aabc1c298dc58ed968c03c4e6526fb3f.jpg"
                        }]
                    }
                })
            }
        } catch (error) {
            console.error(error)
        }
    },
    getImage : async (data) => {
        try {
            return await axios({ 
                method: 'POST',
                url: 'https://api.line.me/v2/bot/message/'+data.id+"/content",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer {'+data.official_token+'}'
                },
                responseType: 'stream',
            }).then(response => {
                response.data.pipe(fs.createWriteStream('images/'+data.id+'.jpg'))
            });
        } catch (error) {
            console.error(error)
        }
    }
}
