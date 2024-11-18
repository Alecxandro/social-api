import User from "../models/User.js";
import jwt from 'jsonwebtoken'


const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

export const registerUser = async (req,res) =>{
    try {
        const { username, email, password } = req.body
        
        const existingUser = await User.findOne({ email });

        if (existingUser) return res.status(400).json({ message: 'User already registered'})

        const user = await User.create({ username, email, password });
        const token = createToken(user._id);

        res.status(201).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            token
         });
    } catch (error) {
        res.status(500).json({ message: `Error registraring user. Details: ${error.message}` })

    }
}

export const loginUser = async (req, res) => {
    try {
        const { email, password }  = req.body

        const user = await User.findOne( { email }).select('+password')
        if  (!user) return res.status(400).json({ message: 'Invalid password or e-mail'})
        
            
        const isMatch = await user.matchPassword(password)
        if (!isMatch) return res.status(400).json({ message: 'Invalid password or e-mail'})

        const token = createToken(user._id)

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token
         });

    } catch (error) {
        res.status(500).json({ message: `Error logging user. Details: ${error.message}` })
    }
}

export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
        res.status(200).json(user)
    } catch (error) {
        res.status(500).json( { message: `Error getting user data. Details: ${ error.message }`})
    }
}