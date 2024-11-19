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

        
        if (!posts.length) {
            posts = await Post.find({
                author: { $in: user.following }
            })
            .populate('author', 'username name')
            .limit(postsPerPage)
            .sort({ createdAt: -1 })  
            .sort({ random: 1 })      
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
            
            {
                $addFields: {
                    random: { $rand: {} }
                }
            },
            
            {
                $addFields: {
                    likesCount: { $size: "$likes" },
                    commentsCount: { $size: "$comments" },
                    isFavorited: { $in: [userId, "$favorites"] },
                    
                    
                    timeDecayScore: {
                        $divide: [
                            { $subtract: ["$createdAt", oneHourAgo] },
                            3600000  
                        ]
                    },
                    
                    
                    engagementVelocity: {
                        $divide: [
                            { $add: [
                                { $size: "$likes" },
                                { $multiply: [{ $size: "$comments" }, 2] }
                            ]},
                            { $add: [
                                { $subtract: [new Date(), "$createdAt"] },
                                1  
                            ]}
                        ]
                    }
                }
            },
            
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
                                        { $gt: ["$createdAt", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)] } 
                                    ]
                                }
                            }
                        }
                    ],
                    as: "userInteractions"
                }
            },
            
            {
                $addFields: {
                    relevanceScore: {
                        $add: [
                            
                            { $multiply: [{ $size: "$likes" }, 1] },
                            { $multiply: [{ $size: "$comments" }, 2] },
                            
                            
                            { $multiply: ["$engagementVelocity", 1000] },
                            
                            
                            { $multiply: ["$timeDecayScore", 2] },
                            
                            
                            { $multiply: [{ $size: "$userInteractions" }, 0.5] },
                            
                            
                            { $multiply: ["$random", 3] },
                            
                            
                            {
                                $cond: [
                                    "$isFavorited",
                                    -2,
                                    0
                                ]
                            },
                            
                            
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
         
            {
                $sort: { relevanceScore: -1 }
            },
          
            {
                $limit: postsPerPage
            },
      
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
