const mongoose = require('mongoose');
const review=require("./reviews.js");
const user=require("./users.js");
//structure of collection(table)
const ListingSchema=new mongoose.Schema({
    title:{
        type:String,
        require:true,
    },
    description:{
      type:String,
      require:true,
    },
    image:{
        type:String,
        default:"https://wallpapercave.com/wp/bMcfGb3.jpg",
        set:(v)=>v===""?"https://wallpapercave.com/wp/bMcfGb3.jpg":v,
    },
    price:{
        type:Number,
    },
    location:{
        type:String,
    },
    country:{
        type:String,
    },
    reviews:[{
           type:mongoose. Schema.Types.ObjectId, 
           ref: 'review',
    }],
    owner:{
         type:mongoose. Schema.Types.ObjectId, 
         ref: 'user',
    }
});

ListingSchema.pre("findOneAndDelete",async function(){
    const listing=await this.model.findOne(this.getQuery());
    if(listing){
        await review.deleteMany({_id:{$in:listing.reviews}});
    }
});

// giving collection a name(table)
const Listing =mongoose.model("Listing",ListingSchema);

module.exports=Listing;