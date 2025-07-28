import asyncHandler from '../utilities/asyncHandler.utility.js'
import ErrorHandler from '../utilities/ErrorHandler.utility.js';
import ResponseHandler from '../utilities/ResponseHandler.utility.js'
import User from '../models/user.model.js'
import { uploadOnCloudinary } from '../utilities/Cloudinary.utility.js'

export const signup = asyncHandler(async (req, res) => {
    const {fullname, username, email, password} = req.body
    if([fullname, username, email, password].some(item => item.trim() === '')) throw new ErrorHandler(401, "All fields are required");

    if(password.length < 6) throw new ErrorHandler(400, "Password length must greater than 6 characters");

    const existingUser = await User.findOne({
        $or: [{username}, {email}]
    });
    if(existingUser) throw new ErrorHandler(400, "username or email already exists");

    const avatarPath = req.file?.path
    if(!avatarPath) throw new ErrorHandler(400, 'Bad Request: avatar file is missing');
    
    const avatar = await uploadOnCloudinary(avatarPath);
    if(!avatar) throw new ErrorHandler(501, 'Failed to upload avatar on cloud');

    const user = await User.create({
        username: username.toLowerCase(),
        fullname,
        email,
        password,
        avatar: avatar.url
    });
    if(!user) throw new ErrorHandler(500, "Failed to create user in Database");

    return res.status(200).json(new ResponseHandler(200, "User registered successfully"));
});

export const login = asyncHandler(async (req, res) => {
    const {username, password} = req.body
    let refreshToken = ''
    if([username, password].some(item => item.trim() === '')) throw new ErrorHandler(400, "All fields are required");

    const user = await User.findOne({username: username});
    if(!user) throw new ErrorHandler(404, "User not found");

    const check = await user.isPasswordCorrect(password);
    if(check) {
        try {
            refreshToken = user.generateRefreshToken()
            await user.save({validateBeforeSave: false})
        } catch (error) {
            console.log('Error occured: ', error)
            throw new ErrorHandler(500, "Failed to create tokens")
        }
    } else {
        throw new ErrorHandler(400, "Incorrect password")
    }

    const options = {
        httpOnly: true,
        secure: true
    }

    res.status(200).cookie("refreshToken", refreshToken, options).json(
        new ResponseHandler(200,'user logged in successfully', {"refreshToken": refreshToken})
    )
});

export const logout = asyncHandler(async (req, res) => {
    // console.log("Logging out user:", req.user);

    const result = await User.updateOne({ _id: req.user._id }, { $unset: { refreshToken: "" } });
    // console.log("DB Update result:", result);

    const options = {
        httpOnly: true,
        secure: true,
    };

    res.status(200)
        .clearCookie('accessToken', options)
        .clearCookie('refreshToken', options)
        .json({
            statusCode: 200,
            message: 'User logged out',
        });
});

export const checkAuth = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select('-password -refreshToken');
    if (!user) {
        throw new ErrorHandler(401, 'Not authorized');
    }

    res.status(200).json(
        new ResponseHandler(200, 'User is authenticated', user)
    );
});
