import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";


const options = {
    httpOnly: true,
    secure: true
}


const generateAcessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAcessToken();
        const refreshToken = user.generateRefreshToken();

        // console.log("HERE after Token Generation");


        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, 'Token generation failed');
    }
}


const signUpUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // console.log("Email: ", email);


    if (!email || !password) {
        throw new ApiError(400, 'Email and password are required');
    }

    // Check if user already exists
    const existedUser = await User.findOne({
        $or: [{ email }]
    })

    if (existedUser) {
        throw new ApiError(400, 'User already exists');
    }

    const user = await User.create({
        email,
        password
    })

    const createdUser = await User.findById(user._id).select(
        '-password -refreshToken'
    );

    if (!createdUser) {
        throw new ApiError(500, 'User creation failed');
    }

    // console.log("HERE");

    return res.status(200)
        .json(new ApiResponse(200, createdUser, 'User created successfully please login'));
})


const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError(400, 'Email and password are required');
    }

    const user = await User.findOne({
        $or: [{ email }]
    })

    if (!user) {
        throw new ApiError(400, 'User Does not exist');
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(400, 'Invalid password');
    }

    const { accessToken, refreshToken } = await generateAcessAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    return res.status(201)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(201,
                {
                    user: loggedInUser
                },
                'User logged in successfully')
        )
})

const logOutUser = asyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: ""
            }
        },
        {
            new: true
        }
    );

    return res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(200, user, "User Logged Out Successfully")
        )
})


const getUserInfo = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    return res.status(200)
        .json(
            new ApiResponse(200, user, 'User Info Fetched Successfully')
        )
})


const refreshAccessToken = asyncHandler(async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        const { accessToken, newRefreshToken } = await generateAcessAndRefreshToken(user._id);

        return res.status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(200, { accessToken, newRefreshToken }, "Access Token Refreshed Successfully")
            )
    } catch (error) {
        throw new ApiError(500, 'Token generation failed');
    }
})


const updateProfile = asyncHandler(async (req, res) => {
    const { firstname, lastname, selectedColors } = req.body;

    // console.log(firstname, lastname, selectedColors);


    if (!firstname || !lastname || (selectedColors == undefined)) {
        throw new ApiError(400, "All The Fields are required!!")
    }



    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                firstname,
                lastname,
                color: selectedColors,
                // avatar: avatar.url,
                profileSetup: true
            }
        },
        {
            new: true
        }
    ).select("-password -refreshToken");

    // console.log("firstname:", user.firstname);
    

    if (!user) {
        throw new ApiError(500, user, "Profile update failed");
    }

    // console.log("DATABSE UPDATED");

    return res.status(200)
        .json(
            new ApiResponse(200, user, "Profile Updated Successfully")
        )
})

const addProfileImage = asyncHandler(async (req, res) => {

    // console.log(req.file);

    const avatarLocalPath = req.file?.path;

    // console.log(avatarLocalPath);

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    console.log("Avatar Url: ", avatar.url);

    if (!avatar.url) {
        throw new ApiError(500, "Avatar upload failed");
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        {
            new: true
        }
    ).select("-password -refreshToken")

    return res.status(200)
        .json(
            new ApiResponse(200, user, "Profile Image Updated Successfully")
        )
})


const removeProfileImage = asyncHandler(async (req, res) => {

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                avatar: ""
            }
        },
        {
            new: true
        }
    );

    return res.status(200)
        .json(
            new ApiResponse(200, user, "Profile Image Removed Successfully")
        )
})


export {
    signUpUser,
    loginUser,
    logOutUser,
    getUserInfo,
    refreshAccessToken,
    updateProfile,
    addProfileImage,
    removeProfileImage
}