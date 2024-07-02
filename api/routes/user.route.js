import express from 'express';
import { deleteUser, getUser, getUsers, signout, test, updateUser } from '../controllers/user.controller.js';
import { verifyToken } from '../utils/verifyUser.js';


const router = express.Router();

router.get('/test',test);
router.put('/update/:userId',verifyToken, updateUser);//When a PUT request is made to a URL that matches this pattern, such as /update/123, the updateUser function is triggered to handle the request
//first we will verify the token if token is verified then user is going to addes to the request object and then we will call the updateUser function
//and then we go to the next function which is updateUser
router.delete('/delete/:userId', verifyToken, deleteUser);
router.post('/signout', signout);
router.get('/getusers', verifyToken, getUsers);
router.get('/:userId', verifyToken, getUser);
export default router;