const { Validator } = require('node-input-validator');
const Entreprise=require('./../models/Entreprise.model');
const category=require('./../models/category.model');
const mongoose=require('mongoose');
const fs=require('fs');
const EntrepriseLike=require('./../models/EntrepriseLike.model');
exports.list=async(req,res)=>{

	try{
	
		let query=[
			{
				$lookup:
				{
				 from: "users",
				 localField: "created_by",
				 foreignField: "_id",
				 as: "creator"
				}
			},
			{$unwind: '$creator'},
			{
				$lookup:
				{
				 from: "categories",
				 localField: "category",
				 foreignField: "_id",
				 as: "category_details"
				}
			},
			{$unwind: '$category_details'},
		];

		if(req.query.keyword && req.query.keyword!=''){ 
			query.push({
			  $match: { 
			    $or :[
			      {
			        title : { $regex: req.query.keyword } 
			      },
			      {
			        'category_details.name' : { $regex: req.query.keyword } 
			      },
			      {
			        'creator.email' : { $regex: req.query.keyword } 
			      }
			    ]
			  }
			});
		}

		if(req.query.category){		
			query.push({
			    $match: { 
			    	'category_details.slug':req.query.category,
			    }	
			});
		}

		if(req.query.user_id){		
			query.push({
			    $match: { 
			    	created_by:mongoose.Types.ObjectId(req.query.user_id),
			    }	
			});
		}

		let total=await Entreprise.countDocuments(query);
		let page=(req.query.page)?parseInt(req.query.page):1;
		let perPage=(req.query.perPage)?parseInt(req.query.perPage):10;
		let skip=(page-1)*perPage;
		query.push({
			$skip:skip,
		});
		query.push({
			$limit:perPage,
		});

		query.push(
	    	{ 
	    		$project : {
    			"_id":1,
    			"createdAt":1,
	    		"title": 1,
	    		"short_description":1,
	    		"description":1,
				//"image":1,
	    		"category_details.name":1,
				"category_details.slug":1,
				"category_details._id":1,
				"creator._id":1 ,
	    		"creator.email":1 ,
	    		"creator.first_name":1,
	    		"creator.last_name":1,
	    		"comments_count":{$size:{"$ifNull":["$entreprise_comments",[]]}},
	    		"likes_count":{$size:{"$ifNull":["$entreprise_likes",[]]}}
	    		} 
	    	}
	    );
	    if(req.query.sortBy && req.query.sortOrder){
			var sort = {};
			sort[req.query.sortBy] = (req.query.sortOrder=='asc')?1:-1;
			query.push({
				$sort: sort
			});
		}else{
			query.push({
				$sort: {createdAt:-1}
			});	
		}

		let entreprises=await Entreprise.aggregate(query);
		return res.send({
	  		message:'Entreprise successfully fetched',
	  		data:{
	  			entreprises:entreprises.map(doc => Entreprise.hydrate(doc)),
	  			meta:{
	  				total:total,
	  				currentPage:page,
	  				perPage:perPage,
	  				totalPages:Math.ceil(total/perPage)
	  			}

	  		}
	  	});
	}catch(err){
		return res.status(400).send({
	  		message:err.message,
	  		data:err
	  	});
	}

}

exports.details=async(req,res)=>{
	try{

		let entreprise_id=req.params.entreprise_id;

		if(!mongoose.Types.ObjectId.isValid(entreprise_id)){
			return res.status(400).send({
		  		message:'Invalid entreprise id',
		  		data:{}
		  	});
		}

		let entreprise=await Entreprise.findOne({_id:entreprise_id})
		 .populate('category')
		.populate('created_by');
		let query=[
			{
				$lookup:
				{
				 from: "users",
				 localField: "created_by",
				 foreignField: "_id",
				 as: "creator"
				}
			},
			{$unwind: '$creator'},
			{
				$lookup:
				{
				 from: "categories",
				 localField: "category",
				 foreignField: "_id",
				 as: "category_details"
				}
			},
			{$unwind: '$category_details'},
			{
				$match:{
					'_id':mongoose.Types.ObjectId(entreprise_id)
				}
			},
			{ 
	    		$project : {
    			"_id":1,
    			"createdAt":1,
	    		"title": 1,
	    		"short_description":1,
	    		"description":1,
				//"image":1,
	    		"category_details.name":1,
				"category_details.slug":1,
				"category_details._id":1,
				"creator._id":1 ,
	    		"creator.email":1 ,
	    		"creator.first_name":1,
	    		"creator.last_name":1,
	    		"comments_count":{$size:{"$ifNull":["$entreprise_comments",[]]}},
	    		"likes_count":{$size:{"$ifNull":["$entreprise_likes",[]]}}
	    		} 
	    	}
		];

		let entreprises=await Entreprise.aggregate(query);

		if(entreprises.length>0){
			let entreprise=entreprises[0];
			let current_user=req.user;
			let liked_by_current_user=false;
			if(current_user){
				let entreprise_like=await EntrepriseLike.findOne({
					entreprise_id:entreprise._id,
					user_id:current_user._id
				});
				if(entreprise_like){
					liked_by_current_user=true;
				}
			}

			return res.status(200).send({
				message:'entreprise successfully fetched',
				data:{
					entreprise: Entreprise.hydrate(entreprise) ,
					meta:{
						liked_by_current_user:liked_by_current_user
					}
				}
			});
		}else{
			return res.status(400).send({
				message:'No entreprise found',
				data:{}
			});	
		}



	}catch(err){
		return res.status(400).send({
	  		message:err.message,
	  		data:err
	  	});
	}
}
exports.create=async (req,res)=>{

	/*if(req.files && req.files.image){
		req.body['image']=req.files.image;
	}*/
	const v = new Validator(req.body, {
		title:'required|minLength:5|maxLength:100',
		short_description:'required',
		description:'required',
		category: 'required',
		//image:'required|mime:jpg.jpeg,png'
	});
	const matched = await v.check();
	if (!matched) {
		return res.status(422).send(v.errors);
	}

	try{

	   /* if(req.files && req.files.image){
            var image_file= req.files.image;
            var image_file_name=Date.now()+'-blog-image-'+image_file.name;
            var image_path=publicPath+'/uploads/blog_images/'+image_file_name;
            await image_file.mv(image_path);
		}
*/
	  	const newEntreprise = new Entreprise({
	  	 title:req.body.title,
		 short_description:req.body.short_description,
	  	 description:req.body.description,
	  	 category:req.body.category,
	  	 created_by:req.user._id,
	  	// image:image_file_name
	  	});
	  	let entrepriseData=await newEntreprise.save();
	  	
		let query=[
			{
				$lookup:
				{
				 from: "users",
				 localField: "created_by",
				 foreignField: "_id",
				 as: "creator"
				}
			},
			{$unwind: '$creator'},
			{
				$lookup:
				{
				 from: "categories",
				 localField: "category",
				 foreignField: "_id",
				 as: "category_details"
				}
			},
			{$unwind: '$category_details'},
			{
				$match:{
					'_id':mongoose.Types.ObjectId(entrepriseData._id)
				}
			},
			{ 
	    		$project : {
    			"_id":1,
    			"createdAt":1,
	    		"title": 1,
	    		"short_description":1,
	    		"description":1,
				//"image":1,
	    		"category_details.name":1,
				"category_details.slug":1,
				"category_details._id":1,
				"creator._id":1 ,
	    		"creator.email":1 ,
	    		"creator.first_name":1,
	    		"creator.last_name":1,
	    		"comments_count":{$size:{"$ifNull":["$entreprise_comments",[]]}},
	    		"likes_count":{$size:{"$ifNull":["$entreprise_likes",[]]}}
	    		} 
	    	}
		];

		let entreprises=await Entreprise.aggregate(query);

	  	
	  	return res.status(201).send({
	  		message:'entreprise created successfully',
	  		data:Entreprise.hydrate(entreprises[0]) 
	  	});



	}catch(err){

		return res.status(400).send({
	  		message:err.message,
	  		data:err
	  	});

	}
}

exports.update=async(req,res)=>{
	let entreprise_id=req.params.entreprise_id;
	if(!mongoose.Types.ObjectId.isValid(entreprise_id)){
		return res.status(400).send({
	  		message:'Invalid entreprise id',
	  		data:{}
	  	});
	}
	Entreprise.findOne({_id:entreprise_id}).then(async(entreprise)=>{
		if(!entreprise){
			return res.status(400).send({
		  		message:'No blog found',
		  		data:{}
		  	});
		}else{
			let current_user=req.user;

			if(entreprise.created_by!=current_user._id){
				return res.status(400).send({
			  		message:'Access denied',
			  		data:{}
			  	});
			}else{

				try{
					let rules={
						title:'required|minLength:5|maxLength:100',
						short_description:'required',
						description:'required',
						category: 'required'
					};
					/*if(req.files && req.files.image){
						req.body['image']=req.files.image;
						rules['image']='required|mime:jpg.jpeg,png'
					}*/
					const v = new Validator(req.body, rules);
					const matched = await v.check();
					if (!matched) {
						return res.status(422).send(v.errors);
					}

				    /*if(req.files && req.files.image){
			            var image_file= req.files.image;
			            var image_file_name=Date.now()+'-entreprise-image-'+image_file.name;
			            var image_path=publicPath+'/uploads/entreprise_images/'+image_file_name;
			            await image_file.mv(image_path);

			            let old_path=publicPath+'/uploads/entreprise_images/'+entreprise.image;
			            if(fs.existsSync(old_path)){
			            	fs.unlinkSync(old_path);
			            }

					}else{
						var image_file_name=entreprise.image;
					}
                          */

					await Entreprise.updateOne({_id:entreprise_id},{
				  	 title:req.body.title,
					 short_description:req.body.short_description,
				  	 description:req.body.description,
				  	 category:req.body.category,
				  	// image:image_file_name
					});



					let query=[
					{
						$lookup:
						{
						 from: "users",
						 localField: "created_by",
						 foreignField: "_id",
						 as: "creator"
						}
					},
					{$unwind: '$creator'},
					{
						$lookup:
						{
						 from: "categories",
						 localField: "category",
						 foreignField: "_id",
						 as: "category_details"
						}
					},
					{$unwind: '$category_details'},
					{
						$match:{
							'_id':mongoose.Types.ObjectId(entreprise_id)
						}
					},
					{ 
			    		$project : {
		    			"_id":1,
		    			"createdAt":1,
			    		"title": 1,
			    		"short_description":1,
			    		"description":1,
						"image":1,
			    		"category_details.name":1,
						"category_details.slug":1,
						"category_details._id":1,
						"creator._id":1 ,
			    		"creator.email":1 ,
			    		"creator.first_name":1,
			    		"creator.last_name":1,
			    		"comments_count":{$size:{"$ifNull":["$entreprise_comments",[]]}},
			    		"likes_count":{$size:{"$ifNull":["$entreprise_likes",[]]}}
			    		} 
			    	}
				];

				let entreprises=await Entreprise.aggregate(query);
			  	return res.status(200).send({
			  		message:'entreprise successfully updated',
			  		data: Entreprise.hydrate(entreprises[0]) 
			  	});




				}catch(err){
					return res.status(400).send({
				  		message:err.message,
				  		data:err
				  	});
				}


			}

		}

	}).catch((err)=>{
		return res.status(400).send({
	  		message:err.message,
	  		data:err
	  	});
	})
}

exports.delete=async (req,res)=>{
	let entreprise_id=req.params.entreprise_id;
	if(!mongoose.Types.ObjectId.isValid(entreprise_id)){
		return res.status(400).send({
	  		message:'Invalid entrepriseid',
	  		data:{}
	  	});
	}

	Entreprise.findOne({_id: entreprise_id}).then(async (entreprise)=>{
		if(!entreprise){
			return res.status(400).send({
		  		message:'No blog found',
		  		data:{}
		  	});
		}else{
			let current_user=req.user;
			if(entreprise.created_by!=current_user._id){
				return res.status(400).send({
			  		message:'Access denied',
			  		data:{}
			  	});
			}else{

				/*let old_path=publicPath+'/uploads/entreprise_images/'+entreprise.image;
				if(fs.existsSync(old_path)){
					fs.unlinkSync(old_path);
				}
*/
				await Entreprise.deleteOne({_id:entreprise_id});
				return res.status(200).send({
			  		message:'entreprise successfully deleted',
			  		data:{}
			  	});
			}

		}
	}).catch((err)=>{
		return res.status(400).send({
	  		message:err.message,
	  		data:err
	  	});
	})
}

exports.toggle_like=async(req,res)=>{
	let entreprise_id=req.params.entreprise_id;
	if(!mongoose.Types.ObjectId.isValid(entreprise_id)){
		return res.status(400).send({
	  		message:'Invalid entreprise id',
	  		data:{}
	  	});
	}

	Entreprise.findOne({_id:entreprise_id}).then(async(entreprise)=>{
		if(!entreprise){
			return res.status(400).send({
		  		message:'No entreprise found',
		  		data:{}
		  	});
		}else{
			let current_user=req.user;

			EntrepriseLike.findOne({
				entreprise_id:entreprise_id,
				user_id:current_user._id
			}).then(async (entreprise_like)=>{
				try{
					if(!entreprise_like){
						let entrepriseLikeDoc=new EntrepriseLike({
							entreprise_id:entreprise_id,
							user_id:current_user._id
						});
						let likeData=await entrepriseLikeDoc.save();
						await Entreprise.updateOne({
							_id:entreprise_id
						},{
							$push:{entreprise_likes:likeData._id}
						})
						return res.status(200).send({
					  		message:'Like successfully added',
					  		data:{}
					  	});

					}else{

						await EntrepriseLike.deleteOne({
							_id:entreprise_like._id
						});

						await Entreprise.updateOne({
							_id:entreprise_like.entreprise_id
						},{
							$pull:{entreprise_likes:entreprise_like._id}
						})

						return res.status(200).send({
					  		message:'Like successfully removed',
					  		data:{}
					  	});


					}
				}catch(err){
					return res.status(400).send({
				  		message:err.message,
				  		data:err
				  	});
				}

			}).catch((err)=>{
				return res.status(400).send({
			  		message:err.message,
			  		data:err
			  	});
			})

		}
	}).catch((err)=>{
		return res.status(400).send({
	  		message:err.message,
	  		data:err
	  	});
	})



}




