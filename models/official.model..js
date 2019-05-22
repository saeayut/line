const mongoose = require('../mongoose');
 
//Attributes of the Course object
var OfficialSchema = new mongoose.Schema({
    official_id:{
        type: String
    },
    official_token:{
        type: String
    }
});
 
mongoose.model('Official', OfficialSchema);