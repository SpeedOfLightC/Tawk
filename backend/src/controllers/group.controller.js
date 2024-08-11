import { Group } from "../models/group.model.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";

const createGroup = asyncHandler(async (req, res) => {
    const { name, members } = req.body;

    const userId = req.user._id;

    if (!name || !members) {
        throw new ApiError(400, 'Name and members are required');
    }

    const validMembers = await User.find({
        _id: { $in: members }
    })

    if (validMembers.length !== members.length) {
        throw new ApiError(400, 'Invalid members');
    }

    const newGroup = new Group({
        name, members, admin: userId
    })

    await newGroup.save();


    return res.status(201).json(
        new ApiResponse(201, newGroup, 'Group created successfully')
    )
})

const getUserGroups = asyncHandler(async (req, res) => {
    const userId = new mongoose.Types.ObjectId(req.user._id);
    const groups = await Group.find({
        $or: [{ admin: userId }, { members: userId }],
    }).sort({ updatedAt: -1 });

    return res.status(201).json(
        new ApiResponse(201, groups, 'Groups fetched successfully')
    )
})


const getGroupMessages = asyncHandler(async (req, res) => {
    const { groupId } = req.params;
    const group = await Group.findById(groupId).populate({
        path: "messages", 
        populate: {
            path: "sender", select: "firstname lastname email _id avatar"
        }
    });

    if(!group) {
        throw new ApiError(404, 'Group not found');
    }

    const messages = group.messages;

    return res.status(201).json(
        new ApiResponse(201, messages, 'Groups fetched successfully')
    )
})


export { createGroup, getUserGroups, getGroupMessages }