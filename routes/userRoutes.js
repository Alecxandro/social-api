import express from 'express';
import { followUser, unfollowUser, updateUser, deleteUser } from '../controllers/userController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/:id/follow', protect, followUser)
  .post('/:id/unfollow', protect, unfollowUser)
  .put('/edit', protect, updateUser)
  .delete('/delete', protect, deleteUser)

  export default router