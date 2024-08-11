import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Message } from "../models/message.model.js";

const searchContacts = asyncHandler(async (req, res) => {

    const { searchTerm } = req.body;

    // console.log("Searchterm: ", searchTerm);

    if (!searchTerm) {
        return res.status(400).json(new ApiResponse(400, "Search term is required"));
    }

    const sanitizedSearchTerm = searchTerm.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
    );

    const regex = new RegExp(sanitizedSearchTerm, "i");

    const contacts = await User.find(
        {
            $and: [
                { _id: { $ne: req.user._id } },
                {
                    $or: [{ firstname: regex }, { lastname: regex }, { email: regex }]
                }
            ]
        }
    ).select("-password -refreshToken")

    // console.log(contacts);


    return res.status(200)
        .json(new ApiResponse(200, contacts, "Contacts fetched successfully"));

})


const getContactsForDmList = asyncHandler(async (req, res) => {

    let userId = req.user._id;

    userId = new mongoose.Types.ObjectId(userId);

    const contacts = await Message.aggregate([
        {
            $match: {
                $or: [{ sender: userId }, { recipent: userId }]
            },
        },
        {
            $sort: {
                timestamp: -1
            },
        },
        {
            $group: {
                _id: {
                    $cond: {
                        if: { $eq: ["$sender", userId] },
                        then: "$recipent",
                        else: "$sender"
                    },
                },
                lastMessageTime: {
                    $first: "$timestamp"
                },
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "_id",
                foreignField: "_id",
                as: "contactInfo"
            }
        },
        {
            $unwind: "$contactInfo"
        },
        {
            $project: {
                _id: 1,
                lasrMessageTime: 1,
                email: "$contactInfo.email",
                firstname: "$contactInfo.firstname",
                lastname: "$contactInfo.lastname",
                avatar: "$contactInfo.avatar",
                color: "$contactInfo.color"
            }
        },
        {
            $sort: { lastMessageTime: -1 }
        }
    ]);

    return res.status(200)
        .json(new ApiResponse(200, contacts, "Contacts fetched successfully"));

})


const getAllContacts = asyncHandler(async (req, res) => {

    const users = await User.find(
        {
            _id: { $ne: req.user._id }
        },
        "firstname lastname _id email"
    )

    const contacts = users.map((user) => ({
        label: user.firstname ? `${user.firstname} ${user.lastname}` : user.email,
        value: user._id,
    }))

    return res.status(200)
        .json(new ApiResponse(200, contacts, "Contacts fetched successfully"));
})


export {
    searchContacts,
    getContactsForDmList,
    getAllContacts
};