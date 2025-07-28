import asyncHandler from "../utilities/asyncHandler.utility.js";
import jwt from 'jsonwebtoken';
import ErrorHandler from "../utilities/ErrorHandler.utility.js";
import User from "../models/user.model.js";

const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.refreshToken || req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            throw new ErrorHandler(401, "Unauthorized: No token provided");
        }

        const decodedToken = jwt.verify(token, process.env.REFRESH_TOKEN_KEY);
        const user = await User.findById(decodedToken?._id).select("-password");

        if (!user) {
            throw new ErrorHandler(401, "Invalid token: User not found");
        }

        req.user = user;
        next();
    } catch (error) {
        throw new ErrorHandler(401, error.message || "Invalid token");
    }
});

export default verifyJWT;
