const router=require('express').Router();
const entrepriseController=require('../controllers/Entreprise.controller')
const middleware=require('../helpers/middleware');

router.get('/list',entrepriseController.list)
router.get('/:entreprise_id',middleware.api,entrepriseController.details)
router.post('/create',middleware.auth,entrepriseController.create);
router.put('/:entreprise_id/update',middleware.auth,entrepriseController.update)
router.delete('/:entreprise_id/delete',middleware.auth,entrepriseController.delete)
router.post('/:entreprise_id/toggle-like',middleware.auth,entrepriseController.toggle_like)
module.exports=router;