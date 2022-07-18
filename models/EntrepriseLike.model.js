const mongoose=require('mongoose');
const bcrypt=require('bcrypt');
const schema = new mongoose.Schema({
	entreprise_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Entreprise' },
	user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
},{
    timestamps:true,
});


const  EntrepriseLike = mongoose.model(' EntrepriseLike', schema);
module.exports = EntrepriseLike;