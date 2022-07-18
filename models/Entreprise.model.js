const mongoose=require('mongoose');
const schema = new mongoose.Schema({
 title: String,
 short_description:String,
 description:String,
 //image: {type:String,default:null},
 category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
 created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
 entreprise_comments:[{type: mongoose.Schema.Types.ObjectId, ref: 'BlogComment' }],
 entreprise_likes:[{type: mongoose.Schema.Types.ObjectId, ref: 'BlogLike' }]
},{
    timestamps:true,
    toObject: {
        virtuals: true
    },
    toJSON: {
        virtuals: true
    }
});

schema.virtual('image_url').get(function() {
  var fullUrl = req.protocol + '://' + req.get('host');
  return fullUrl+'/uploads/blog_images/'+this.image;
});

const Entreprise = mongoose.model('Blog', schema);
module.exports = Entreprise;