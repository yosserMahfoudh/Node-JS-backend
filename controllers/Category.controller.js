//const config = require("../config/auth.config");

var ObjectId = require('mongoose').Types.ObjectId;

//var bcrypt = require("bcryptjs");
const Categorie = require("../models/category.model");


exports.addCategorie= (req, res) => {
    const categorie = new Categorie({
        name : req.body.name,
        description: req.body.description
    
    });
    console.log(categorie);
    categorie.save((err, categorie) => {
        if (err) {
            return res.status(500).json({
              ok: false,
              err,
            });
          }

        return res.status(201).json({
            ok: true,
            categorie,
          });
        });


}

exports.entrepriseBycategorie = (req, res) => {
    const { name } = req.params;
    const category =  Categorie.findById(name).populate('entreprises');

     res.send(category.entreprises);
 }

exports.Listscategorie = (req, res) => {
    Categorie.find({}).exec((err, categories) => {
        if (err) {
          return res.status(500).json({
            ok: false,
            err
          })
        }
        res.json({
          ok: true,
          categories,
        });
      });
}

exports.ListscategorieOne = (req, res) => {
    const { id } = req.params;
    Categorie.findById(id)
    .exec((err, categories) => {
        if (err) {
          return res.status(500).json({
            ok: false,
            err
          })
        }
        res.json({
          ok: true,
          categories,
        });
      });
};

exports.updatecategorie = (req, res) => {

    const { id } = req.params;  
  
    Categorie.findByIdAndUpdate(
      id,
      req.body,
      { new: true },
      (err, categories) => {
        if (err) {
          return res.status(500).json({
            ok: false,
            err,
          });
        }
  
        return res.status(201).json({
          ok: true,
          categories,
        });
      }
    );
};

exports.delete = (req, res) => {
  const { id } = req.params;
    Categorie.findByIdAndRemove(id, (err, categories) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          err,
        });
      }
  
      return res.status(201).json({
        ok: true,
        categories,
      });
    });
};
