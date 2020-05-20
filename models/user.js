var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    userId:{
        type:String
    },
    messages:{
        type:Array
    },
    userProfile:{
        type:Array
    },
    official_profile:{
        type:String  
    },
    official_Token:{
        type:String
    },
    destination:{
        type:String
    },
    unread:{
        type:Number
    },
    transaction:{
        type:Array
    }
});
 
module.exports = mongoose.model('user', userSchema);