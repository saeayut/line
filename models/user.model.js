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