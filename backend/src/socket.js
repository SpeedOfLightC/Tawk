import { Server } from 'socket.io';
import { Message } from './models/message.model.js';
import { Group } from './models/group.model.js';

const setupSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: process.env.CORS_ORIGIN,
            credentials: true
        }
    })

    const userSocketMap = new Map();

    const disconnect = (socket) => {
        console.log(`Client disconnected: ${socket.id}`);
        for (const [userId, socketId] of userSocketMap.entries()) {
            if (socketId === socket.id) {
                userSocketMap.delete(userId);
                break;
            }
        }
    }

    const sendMessage = async (message) => {
        try {
            const senderSocketId = userSocketMap.get(message.sender);
            const recipentSocketId = userSocketMap.get(message.recipent);

            const createdMessage = await Message.create(message);

            if (!createdMessage) {
                throw new ApiError(500, "Failed to send message");
            }

            const messageData = await Message.findById(createdMessage._id)
                .populate("sender", "id email, firstname lastname avatar color")
                .populate("recipent", "id email, firstname lastname avatar color")

            if (recipentSocketId) {
                io.to(recipentSocketId).emit("recieveMessage", messageData);
            }

            if (senderSocketId) {
                io.to(senderSocketId).emit("recieveMessage", messageData);
            }

        } catch (error) {
            throw new ApiError(500, "Failed to send message");
        }
    }

    const sendGroupMessage = async (message) => {
        try {
            const { groupId, sender, content, messageType, fileUrl } = message;

            const createdMessage = await Message.create({
                sender,
                recipent: null,
                content,
                messageType,
                fileUrl
            })

            const messageData = await Message.findById(createdMessage._id)
                .populate("sender", "id email, firstname lastname avatar color")
                .exec();

            await Group.findByIdAndUpdate(
                groupId,
                {
                    $push: {
                        messages: createdMessage._id
                    }
                },
            );

            const group = await Group.findById(groupId)
                .populate("members")

            const finalData = { ...messageData._doc, groupId: group._id }

            if (group && group.members) {
                group.members.forEach((member) => {
                    const memberSocketId = userSocketMap.get(member._id.toString());
                    if (memberSocketId) {
                        io.to(memberSocketId).emit("recieveGroupMessage", finalData);
                    }

                })
                const adminSocketId = userSocketMap.get(group.admin._id.toString());
                if (adminSocketId) {
                    io.to(adminSocketId).emit("recieveGroupMessage", finalData);
                }
            }

        } catch (error) {
            console.log(error);
        }
    }

    io.on("connection", (socket) => {
        const userId = socket.handshake.query.userId;

        if (userId) {
            userSocketMap.set(userId, socket.id);
            console.log(`User connected: ${userId} with socket ID ${socket.id}`);
        } else {
            console.log(`User ID not provided during connection`);
        }

        socket.on("sendMessage", sendMessage);
        socket.on("sendGroupMessage", sendGroupMessage);
        socket.on("disconnect", () => disconnect(socket));

    })
}


export default setupSocket;