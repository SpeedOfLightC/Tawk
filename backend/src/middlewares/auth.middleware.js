import jwt from "jsonwebtoken"
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";


export const verifyRfreshToken = async (req, res, next) => {
    try {
        const incomingRefreshToken = token.cookies.refreshToken || req.body.refreshToken;

        if (!incomingRefreshToken) {
            throw new ApiError(401, 'Unauthorized User');
        }

        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decodedToken._id);

        if (!user) {
            throw new ApiError(401, 'Unauthorized User');
        }

        req.user = user;
        next();
    } catch (error) {

    }
}

export const verifyAccessToken = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies["accessToken"];
        // console.log("Token: ", token);
        if (!token) {
            // console.log("Token: ", token);
            throw new ApiError(401, "Unauthorized Request");
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id).select(
            "-password -refreshToken"
        )

        if (!user) {
            throw new ApiError(401, "Unauthorized Request");
        }
        
        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Access Token")
    }
})