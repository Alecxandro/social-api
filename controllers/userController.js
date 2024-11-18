import User from '../models/User.js'

export const followUser = async (req, res) => {
    try {
       const { id: targetId } = req.params
       const userId = req.user.id  

       if (userId === targetId) return res.status(400).json({ message: 'You cannot follow yourself' })

       const user = await User.findById(userId)
       if (!user) return res.status(404).json({ message: 'User not found' })

       const targetUser = await User.findById(targetId)
       if (!targetUser) return res.status(404).json({ message: 'User not found' })

       if (!user.following.includes(targetId)) {
           user.following.push(targetId)
           targetUser.followers.push(userId)

           await user.save()
           await targetUser.save()
       }

       return res.status(200).json({ message: 'Followed successfully!' })
    } catch (error) {
        return res.status(500).json({ message: `Error on following. Details: ${error.message}` }) 
    }
}

export const unfollowUser = async (req, res) => {
    try {
      const { id: targetId } = req.params;
      const userId = req.user.id; 
  
      const user = await User.findById(userId);
      const targetUser = await User.findById(targetId);
  
      if (!targetUser) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      user.following = user.following.filter((id) => id.toString() !== targetId);
      targetUser.followers = targetUser.followers.filter((id) => id.toString() !== userId);
  
      await user.save();
      await targetUser.save();
  
      res.status(200).json({ message: 'Unfollowed successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

export const updateUser = async (req, res) => {
  try {
    let userId = req.user.id
    const { username, email, name, bio, age } = req.body

    const user = await User.findById(userId)
    if (!user) return res.status(404).json({ message: 'User not found' })

    
    if (username) {
      const existingUsername = await User.findOne({ username, _id: { $ne: userId } })
      if (existingUsername) {
        return res.status(400).json({ message: 'Username already taken' })
      }
    }

    if (email) {
      const existingEmail = await User.findOne({ email, _id: { $ne: userId } })
      if (existingEmail) {
        return res.status(400).json({ message: 'Email already registered' })
      }
    }

    
    const updates = {}
    if (username) updates.username = username
    if (email) updates.email = email.toLowerCase()
    if (name) updates.name = name
    if (bio) updates.bio = bio
    if (age) updates.age = age

    // Update user with validation
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    )

    return res.status(200).json({
      message: 'User updated successfully',
      user: updatedUser
    })
  } catch (error) {
    return res.status(500).json({ 
      message: `Error updating user: ${error.message}` 
    })
  }
}
  
export const deleteUser = async (req, res) => {
    try {
        const userId = req.user.id

        const user = await User.findById(userId)
        if (!user) return res.status(404).json({ message: 'User not found' })

        await user.deleteOne()

        return res.status(200).json({ message: 'User deleted successfully' })
    } catch (error) {
        return res.status(500).json({ message: `Error on deleting user. Details: ${error.message}` })
    }
}
