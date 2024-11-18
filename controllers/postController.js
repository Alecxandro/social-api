import Post from '../models/Post.js'

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

  export const addComment = async (req, res) => {
    try {
        const { id: postId } = req.params
        const { content } = req.body
        const { userId } = req.user.id

        const post = await Post.findById(postId)
        if (!post) return res.status(404).json({ message: 'Post not found' })

        const comment = await Comment.create({ content, author: userId, post: postId })

        post.comments.push(comment._id)
        await post.save()

        res.status(201).json(comment)
    } catch (error) {
        return res.status(500).json({ message: `Error on adding comment. Details: ${error.message}` })
    }
  }


export const getOnePost = async (req, res) => {
    try {
        const { id: postId } = req.params
        const userId = req.user.id
        
        const post = await Post.findOne({ _id: postId, author: userId })
        if (!post) return res.status(404).json({ message: 'Post not found' })

        return res.status(200).json(post)
    } catch (error) {
        return res.status(500).json({ message: `Error on getting post. Details: ${error.message}` })
    }
}

export const getPosts = async (req, res) => {
    try {
        const userId = req.user.id
        const posts = await Post.find({ author: userId })
        if (!posts.length) return res.status(404).json({ message: 'No posts found' })
        return res.status(200).json(posts)
    } catch (error) {
        return res.status(500).json({ message: `Error on getting posts. Details: ${error.message}` })
    }
}