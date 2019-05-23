var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TextSchema = new Schema({
    userProfile:{
        type:Array
    },
    text:{
        type:String
    },
    official_Token:{
        type:String
    },
    destination:{
        type:String
    }
});
 
module.exports = mongoose.model('text', TextSchema);