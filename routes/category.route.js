const controllercategorie = require("../controllers/Category.controller");
//const Router=require('express')
const express=require('express');
const Router = express.Router();

 
 //crud menu routes
Router.post("/categories/add", controllercategorie.addCategorie);
Router.get("/categories", controllercategorie.Listscategorie);
Router.put("/categories/updatecategorie/:id", controllercategorie.updatecategorie);
Router.get("/categories/getOne/:id", controllercategorie.ListscategorieOne);
Router.delete("/categories/delete/:id", controllercategorie.delete);

 module.exports=Router;