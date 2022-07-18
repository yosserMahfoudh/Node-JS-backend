const authRoute=require('./auth.route');
const profileRoute=require('./profile.route');
const entreprisesRoute=require('./entreprise.route');
const entreprisesCommentRoute=require('./entrepriseComment.route');
const categoryComponenetRoute= require('./category.route');

module.exports=(app)=>{
	app.get('/',function(req,res){
		res.send({
			'message':'Our first endpoint'
		});
	});
//	router.use('/users', require('./users'));
	app.use('/auth',authRoute);
	app.use('/profile',profileRoute);
	app.use('/entreprises',entreprisesRoute);
	app.use('/entreprises',entreprisesCommentRoute);
	app.use('/api', categoryComponenetRoute);

}