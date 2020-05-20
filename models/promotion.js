var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PromotionSchema = new Schema({
    title:{
        type: String
    }
});
 
module.exports = mongoose.model('promotion', PromotionSchema);