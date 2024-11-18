import express from 'express'
import { createPost, getOnePost, getPosts, likePost, unlikePost, addComment, favoritePost, unfavoritePost } from '../controllers/postController.js'
import { protect } from '../middlewares/authMiddleware.js'

const router = express.Router()

router.post('/create', protect, createPost)
.get('/', protect, getPosts)
.get('/:id', protect, getOnePost)
.post('/:id/like', protect, likePost)
.post('/:id/unlike', protect, unlikePost)
.post('/:id/favorite', protect, favoritePost)
.post('/:id/unfavorite', protect, unfavoritePost)

//comments routes
router.post('/:id/comment', protect, addComment)

export default router