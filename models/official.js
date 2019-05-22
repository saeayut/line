var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var OfficialSchema = new Schema({
    official_id:{
        type: String
    },
    official_token:{
        type: String
    }
});
 
module.exports = mongoose.model('official', OfficialSchema);