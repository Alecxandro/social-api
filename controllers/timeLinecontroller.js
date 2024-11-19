import Post from '../models/Post.js'
import User from '../models/User.js'

export const getTimelinePosts = async (req, res) => {
    try {
        const userId = req.user.id
        const postsPerPage = 20
        const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000)

        
        const user = await User.findById(userId)
        if (!user) return res.status(404).json({ message: 'User not found' })

        
        let posts = await Post.find({
            author: { $in: user.following },
            createdAt: { $gte: thirtyMinutesAgo }
        })
        .populate('author', 'username name')
        .limit(postsPerPage)
        .sort({ random: 1 })

        // If no recent posts, get latest posts from followed users
        if (!posts.length) {
            posts = await Post.find({
                author: { $in: user.following }
            })
            .populate('author', 'username name')
            .limit(postsPerPage)
            .sort({ createdAt: -1 })  // Get the most recent posts first
            .sort({ random: 1 })      // Then randomize them
        }

        if (!posts.length) {
            return res.status(404).json({ 
                message: 'No posts found from users you follow' 
            })
        }

        return res.status(200).json(posts)
    } catch (error) {
        return res.status(500).json({ 
            message: `Error fetching timeline posts: ${error.message}` 
        })
    }
}

export const getTimelinePostsFromAllUsers = async (req, res) => {
    try {
        const postsPerPage = 30
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
        const userId = req.user.id

        const posts = await Post.aggregate([
            
            {
                $match: {
                    createdAt: { $gte: oneHourAgo }
                }
            },
            // Add randomization factor
            {
                $addFields: {
                    random: { $rand: {} }
                }
            },
            // Calculate engagement metrics
            {
                $addFields: {
                    likesCount: { $size: "$likes" },
                    commentsCount: { $size: "$comments" },
                    isFavorited: { $in: [userId, "$favorites"] },
                    
                    // Time decay factor (newer posts score higher)
                    timeDecayScore: {
                        $divide: [
                            { $subtract: ["$createdAt", oneHourAgo] },
                            3600000  // milliseconds in an hour
                        ]
                    },
                    
                    // Engagement velocity (rate of engagement)
                    engagementVelocity: {
                        $divide: [
                            { $add: [
                                { $size: "$likes" },
                                { $multiply: [{ $size: "$comments" }, 2] }
                            ]},
                            { $add: [
                                { $subtract: [new Date(), "$createdAt"] },
                                1  // Prevent division by zero
                            ]}
                        ]
                    }
                }
            },
            // Lookup user interaction history
            {
                $lookup: {
                    from: "interactions",
                    let: { postTags: "$tags", postAuthor: "$author" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$userId", userId] },
                                        { $gt: ["$createdAt", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)] } // Last 7 days
                                    ]
                                }
                            }
                        }
                    ],
                    as: "userInteractions"
                }
            },
            // Calculate comprehensive relevance score
            {
                $addFields: {
                    relevanceScore: {
                        $add: [
                            // Base engagement score
                            { $multiply: [{ $size: "$likes" }, 1] },
                            { $multiply: [{ $size: "$comments" }, 2] },
                            
                            // Velocity bonus (trending content)
                            { $multiply: ["$engagementVelocity", 1000] },
                            
                            // Time decay factor
                            { $multiply: ["$timeDecayScore", 2] },
                            
                            // User interaction history weight
                            { $multiply: [{ $size: "$userInteractions" }, 0.5] },
                            
                            // Random factor for discovery
                            { $multiply: ["$random", 3] },
                            
                            // Penalty for already favorited content
                            {
                                $cond: [
                                    "$isFavorited",
                                    -2,
                                    0
                                ]
                            },
                            
                            // Bonus for high engagement ratio
                            {
                                $cond: [
                                    { $gt: ["$engagementVelocity", 0.5] },
                                    3,
                                    0
                                ]
                            }
                        ]
                    }
                }
            },
            // Sort by final score
            {
                $sort: { relevanceScore: -1 }
            },
            // Limit results
            {
                $limit: postsPerPage
            },
            // Final projection
            {
                $project: {
                    content: 1,
                    author: 1,
                    createdAt: 1,
                    likes: 1,
                    comments: 1,
                    likesCount: 1,
                    commentsCount: 1,
                    relevanceScore: 1,
                    engagementVelocity: 1
                }
            }
        ]).exec()

        await Post.populate(posts, {
            path: 'author',
            select: 'username name'
        })

        if (!posts.length) {
            // Enhanced fallback for no recent posts
            const randomPosts = await Post.aggregate([
                {
                    $addFields: {
                        random: { $rand: {} },
                        engagementScore: {
                            $add: [
                                { $size: "$likes" },
                                { $multiply: [{ $size: "$comments" }, 2] }
                            ]
                        }
                    }
                },
                {
                    $sort: {
                        engagementScore: -1,
                        random: -1
                    }
                },
                {
                    $limit: postsPerPage
                }
            ]).exec()

            await Post.populate(randomPosts, {
                path: 'author',
                select: 'username name'
            })

            if (!randomPosts.length) {
                return res.status(404).json({
                    message: 'No posts found'
                })
            }

            return res.status(200).json(randomPosts)
        }

        return res.status(200).json(posts)
    } catch (error) {
        return res.status(500).json({
            message: `Error fetching posts: ${error.message}`
        })
    }
}
