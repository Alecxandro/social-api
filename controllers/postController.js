import Post from '../models/Post.js'
import mongoose from 'mongoose'

export const createPost = async (req, res) => {
    try {
        const { content } = req.body
        const userId = req.user.id  

        const post = await Post.create({ content, author: userId })

        return res.status(201).json(post)
    } catch (error) {
        return res.status(500).json({ message: `Error on creating post. Details: ${error.message}` })
    }
}

export const likePost = async (req, res) => {
    try {
     const { id: postId } = req.params
     const userId = req.user.id

     const post = await Post.findById(postId)

     if (!post) return res.status(404).json({ message: 'Post not found' })

     if (!post.likes.includes(userId)) {
        post.likes.push(userId)
        await post.save()
    }
     await post.save()

     res.status(200).json({ message: 'Post liked successfully!' })
    } catch (error) {
        return res.status(500).json({ message: `Error on liking post. Details: ${error.message}` })
    }
}

export const unlikePost = async (req, res) => {
    try {
        const { id: postId } = req.params
        const userId = req.user.id

        const post = await Post.findById(postId)
        if (!post) return res.status(404).json({ message: 'Post not found' })

        post.likes = post.likes.filter(id => id.toString() !== userId)
        await post.save()

        res.status(200).json({ message: 'Post unliked successfully!' })
    } catch (error) {
        return res.status(500).json({ message: `Error on unliking post. Details: ${error.message}` })
    }
}


export const favoritePost = async (req, res) => {
    try {
      const { id: postId } = req.params;
      const { userId } = req.user.id;
  
      const post = await Post.findById(postId);
  
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }
  
      if (!post.favorites.includes(userId)) {
        post.favorites.push(userId);
        await post.save();
      }
  
      res.status(200).json({ message: 'Post favorited' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  export const unfavoritePost = async (req, res) => {
    try {
      const { id: postId } = req.params;
      const { userId } = req.user.id;
  
      const post = await Post.findById(postId);
  
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }
  
      post.favorites = post.favorites.filter((id) => id.toString() !== userId);
      await post.save();
  
      res.status(200).json({ message: 'Post unfavorited' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };


export const getOnePost = async (req, res) => {
    try {
        const { id: postId } = req.params
        
        const post = await Post.findById(postId)
            .populate('author', 'username name')  
            .populate('comments.author', 'username name')  
        
        if (!post) return res.status(404).json({ message: 'Post not found' })

        return res.status(200).json(post)
    } catch (error) {
        return res.status(500).json({ message: `Error on getting post. Details: ${error.message}` })
    }
}

export const getPosts = async (req, res) => {
    try {
        const posts = await Post.find()
            .populate('author', 'username name')  
            .populate('comments.author', 'username name')  
            .sort({ createdAt: -1 })  
        
        if (!posts.length) return res.status(404).json({ message: 'No posts found' })
        return res.status(200).json(posts)
    } catch (error) {
        return res.status(500).json({ message: `Error on getting posts. Details: ${error.message}` })
    }
}

export const editPost = async (req, res) => {
  try {
   const { id: postId } = req.params
   const { content } = req.body
   const userId = req.user.id

   const post = await Post.findById(postId)
   if (!post) return res.status(404).json({ message: 'Post not found' })

   if (post.author.toString() !== userId) return res.status(401).json({ message: 'You are not authorized to edit this post' })
   post.content = content
   await post.save()

   return res.status(200).json(post)
  } catch (error) {
    return res.status(500).json({ message: `Error on editing post. Details: ${error.message}` })
  }
}

export const deletePost = async (req, res) => {
  try {
    const { id: postId } = req.params
    const userId = req.user.id

    const post = await Post.findById(postId)
    if (!post) return res.status(404).json({ message: 'Post not found' })

    if (post.author.toString() !== userId) return res.status(401).json({ message: 'You are not authorized to delete this post' })

    await post.deleteOne()
    return res.status(200).json({ message: 'Post deleted successfully' })
  } catch (error) {
    return res.status(500).json({ message: `Error on deleting post. Details: ${error.message}` })
  }
}


export const addComment = async (req, res) => {
  try {
      const { id: postId } = req.params
      const { content } = req.body
      const userId = req.user.id

      const post = await Post.findById(postId)
      if (!post) return res.status(404).json({ message: 'Post not found' })

      const authorId = new mongoose.Types.ObjectId(userId)

      post.comments.push({
        content,
        author: authorId,
        createdAt: new Date()   
      })

      await post.save()

      const newComment = post.comments[post.comments.length - 1]
      await post.populate('comments.author', 'username name')
      
      res.status(201).json(newComment)
  } catch (error) {
      console.error('Full error:', error)
      return res.status(500).json({ message: `Error on adding comment. Details: ${error.message}` })
  }
}

export const deleteComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params
    const userId = req.user.id

    const post = await Post.findById(postId)
    if (!post) return res.status(404).json({ message: 'Post not found' })

    const comment = post.comments.id(commentId)
    if (!comment) return res.status(404).json({ message: 'Comment not found' })

    
    if (comment.author.toString() !== userId && post.author.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized: You can only delete your own comments or comments on your posts' })
    }

    comment.deleteOne()
    await post.save()

    return res.status(200).json({ message: 'Comment deleted successfully' })
  } catch (error) {
    return res.status(500).json({ message: `Error on deleting comment. Details: ${error.message}` })
  }
}
