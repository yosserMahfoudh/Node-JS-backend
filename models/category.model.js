const mongoose=require('mongoose');
const CategorieSchema = new mongoose.Schema({
    
    name: {
        type: String,
        required: true,
        unique: true,
      },
      description: {
        type: String,
        required: false,
      },
      
  created_at: {
    type: Date,
    default: Date.now,
  }


});

const Categorie = mongoose.model('Category', CategorieSchema);
module.exports = Categorie;