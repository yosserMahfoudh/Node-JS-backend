const mongoose=require('mongoose');
const bcrypt=require('bcrypt');
const schema = new mongoose.Schema({
	comment:String,
	entreprise_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Entreprise' },
	user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
},{
    timestamps:true,
});


const EntrepriseComment = mongoose.model('EntrepriseComment', schema);
module.exports = EntrepriseComment;