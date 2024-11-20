import express from 'express'
import { createPost, getOnePost, getPosts, likePost, unlikePost, addComment, favoritePost, unfavoritePost, editPost, deletePost, deleteComment } from '../controllers/postController.js'
import { protect } from '../middlewares/authMiddleware.js'

const router = express.Router()

router.post('/create', protect, createPost)
.get('/', protect, getPosts)
.get('/:id', protect, getOnePost)
.put('/:id', protect, editPost)
.delete('/:id', protect, deletePost)
.put('/:id/like', protect, likePost)
.put('/:id/unlike', protect, unlikePost)
.post('/:id/favorite', protect, favoritePost)
.post('/:id/unfavorite', protect, unfavoritePost)

//comments routes
router.post('/:id/comment', protect, addComment)
router.delete('/:postId/comment/:commentId', protect, deleteComment)
export default router