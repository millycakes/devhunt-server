import express, { Router } from 'express';
import { getUser, editProfile, deleteProfile,getNotis,readNoti } from '../controllers/profile';

const router: Router = express.Router();

router.get('/:user', getUser)
router.post('/edit', editProfile)
router.delete('/delete/:user', deleteProfile);
router.get('/getNotis/:user', getNotis)
router.put('/readNoti', readNoti);

export default router;