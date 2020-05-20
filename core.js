var mongoose = require('mongoose');

//Models mongodb
var official = require('./models/official');
var user = require('./models/user');
var promotion =require('./models/promotion');

mongoose.connect('mongodb://localhost/lineoa', {
    useNewUrlParser: true
});
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log("Connection Successful!");
})
module.exports = {
    OfficialFind : async (destination) => {
        try {
            const result = await official.find({
            }).exec();
            return result;
        } catch (err) {
            return 'error occured';
        }
    },
    OfficialFindOne : async (destination) => {
        try {
            const result = await official.findOne({
                official_id: destination
            }).exec();
            return result;
        } catch (err) {
            return 'error occured';
        }
    },
    OfficialAdd : async (data) => {
        try {
            officialAdd = new official({
                official_id:data.id,
                official_token:data.token,
                official_profile:data.name
            })
            const create = await officialAdd.save()
            return create
        } catch (error) {
            return 'error occured'
        }
    },
    OfficialDelete : async (id) => {
        try {
            const deleteOne = await official.deleteOne({
                _id:id
            })
            return deleteOne
        } catch (error) {
            return 'error occured'
        }
    },
    createUser : async (data) => {
        try {
            userCreate = new user({
                userId:data.userId,
                userProfile:{
                    displayName:data.userProfile.displayName,
                    pictureUrl:data.userProfile.pictureUrl,
                    statusMessage:data.userProfile.statusMessage,
                },
                messages:{
                    user:{
                        text:data.messages.user.text,
                        timestamp:data.timestamp
                    }
                },
                official_profile:data.official_profile,
                official_Token:data.official_Token,
                destination:data.destination,
                unread:0
            })
            const create = await userCreate.save()
            return create
        } catch (error) {
            return 'error occured'
        }
    },
    updateUserMsg : async (userId,data) => {
        try {
            const update = await user.updateOne({
                userId:userId
            } , { 
                $set: {
                    messages:data
                },
                $inc:{
                    unread: +1
                }
            })

            return update
        } catch (error) {
            return 'error occured'
        }
    },
    updateUserProfile : async (userId,data) => {

        try {
            const update = await user.updateOne({
                userId:userId
            } , { $set: { userProfile:data}})

            return update
        } catch (error) {
            return 'error occured'
        }
    },
    updateUserTransaction : async (userId,data) => {
        try {
            const update = await user.updateOne({
                userId:userId
            } , { $push: { transaction:data}})

            return update
        } catch (error) {
            return 'error occured'
        }
    },
    updateAdmin : async (userId,data) => {
        try {
            const update = await user.updateOne({
                userId:userId
            } , { 
                $set: {
                    messages:data
                }
            })
            return update
        } catch (error) {
            return 'error occured'
        }
    },
    userFind : async () => {
        try {
            const result = await user.find({
            }).exec();
            
            return result;
        } catch (err) {
            return 'error occured';
        }       
    }, 
    userFindOne : async (userId) => {
        try {
            const result = await user.findOne({
                userId:userId
            }).exec();
            return result;
        } catch (err) {
            return 'error occured';
        }       
    },
    userRead : async (userId) => {
        try {
            const update = await user.updateOne({
                userId:userId
            } , { 
                $set: {
                    unread:0
                }
            })
            return update
        } catch (error) {
            return 'error occured'
        }
    },
    promotion : async (title) => {
        try {
            const result = await promotion.find({
            }).sort({_id:-1}).exec();
            return result;
        } catch (err) {
            return 'error occured';
        }
    },
    promotionAdd : async (title) => {
        try {
            promotionAdd = new promotion({
                title:title
            })
            const create = await promotionAdd.save()
            return create
        } catch (error) {
            return 'error occured'
        }
    },
    promotionEdit : async (id,title) => {
        try {
            const update = await promotion.updateOne({
                _id:id
            } , { 
                $set: {
                    title:title
                }
            })
            return update
        } catch (error) {
            return 'error occured'
        }
    },
    promotionDelete : async (id) => {
        try {
            const deleteOne = await promotion.deleteOne({
                _id:id
            })
            return deleteOne
        } catch (error) {
            return 'error occured'
        }
    }
}