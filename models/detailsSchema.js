var mongoose = require('mongoose')
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose')

User = mongoose.Schema()
var DetailsSchema = new Schema({
    writtenby :{
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username:String,
      
    },
    title : {
        type: String,
        required :true,
        
    },
    date : {
        type : Date ,
        default: Date.now,
       
        
    },
    img:{
        type:{ data: Buffer, contentType: String }
    },
    main : {
        type:String,
        required:true,
    }
})

DetailsSchema.plugin(passportLocalMongoose); 
var Details= mongoose.model("Details", DetailsSchema);
module.exports =Details; 