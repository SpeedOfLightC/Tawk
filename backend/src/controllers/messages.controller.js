import { Message } from "../models/message.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getMessages = asyncHandler(async (req, res) => {

    const user1 = req.user._id;
    const user2 = req.body.id;

    if (!user2) {
        return res.status(400).json(new ApiResponse(400, "Unable to fetch messages"));
    }

    const messages = await Message.find({
        $or: [
            { sender: user1, recipent: user2 },
            { sender: user2, recipent: user1 }
        ]
    }).sort({ timestamp: 1 });

    // console.log(messages);


    return res.status(200)
        .json(new ApiResponse(200, messages, "Messages fetched successfully"));

})


const uploadFile = asyncHandler(async (req, res) => {

    // console.log(req.file);

    const fileLocalPath = req.file.path;

    if (!fileLocalPath) {
        throw new ApiError(400, "No file uploaded");
    }

    const file = await uploadOnCloudinary(fileLocalPath);

    // console.log("File Url:");

    console.log(file.url);


    if (!file.url) {
        throw new ApiError(500, "File upload failed");
    }

    return res.status(200)
        .json(new ApiResponse(200, { file: file.url }, "File Uploaded successfully"));

})


export { getMessages, uploadFile };