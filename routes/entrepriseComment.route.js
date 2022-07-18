const router=require('express').Router();
const entrepriseCommentController=require('../controllers/EntrepriseComment.controller')
const middleware=require('../helpers/middleware');

router.get('/:entreprise_id/comments',entrepriseCommentController.list)
router.post('/:entreprise_id/comments/create',middleware.auth,entrepriseCommentController.create)
router.put('/comments/:comment_id/update',middleware.auth,entrepriseCommentController.update)
router.delete('/comments/:comment_id/delete',middleware.auth,entrepriseCommentController.delete)
module.exports=router;