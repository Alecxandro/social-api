import express from 'express'
import { getTimelinePosts, getTimelinePostsFromAllUsers } from '../controllers/timeLinecontroller.js'
import { protect } from '../middlewares/authMiddleware.js'

const router = express.Router()

router.get('/', protect, getTimelinePosts)
router.get('/all', protect, getTimelinePostsFromAllUsers)

export default router