import { useSocket } from "@/context/SocketContext";
import apiClient from "@/lib/api-client";
import { useAppStore } from "@/store";
import { UPLOAD_FILE_ROUTE } from "@/utils/constants";
import React, { useRef, useState } from "react";
import { GrAttachment } from "react-icons/gr";
import { IoSend } from "react-icons/io5";

function MessageBar() {
  const fileInputRef = useRef();
  const socket = useSocket();
  const [message, setMessage] = useState("");
  const { selectedChatType, selectedChatData } = useAppStore();
  const { userInfo } = useAppStore();

  const handleSendMessage = async () => {
    if (selectedChatType === "contact") {
      socket.emit("sendMessage", {
        sender: userInfo._id,
        content: message,
        recipent: selectedChatData._id,
        messageType: "text",
        fileUrl: undefined,
      });
    } else if (selectedChatType === "group") {
      socket.emit("sendGroupMessage", {
        sender: userInfo._id,
        content: message,
        messageType: "text",
        fileUrl: undefined,
        groupId: selectedChatData._id,
      });
    }
  };

  const handleAttachmentClick = () => {
    fileInputRef.current.click();
  };

  const handleAttachmentChange = async (e) => {
    try {
      const file = e.target.files[0];
      // console.log(file);

      if (file) {
        const accessToken = userInfo.accessToken;
        // console.log("accessToken:", accessToken);
        const formData = new FormData();
        formData.append("file", file);
        const response = await apiClient.post(
          UPLOAD_FILE_ROUTE,
          formData,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              // "Content-Type": "application/json",
            },
          },
          {
            withCredentials: true,
          }
        );

        // console.log("file here:", response);
        if (response.status === 200 && response.data) {
          if (selectedChatType === "contact") {
            if (response.data.data.file) {
              socket.emit("sendMessage", {
                sender: userInfo._id,
                content: undefined,
                recipent: selectedChatData._id,
                messageType: "file",
                fileUrl: response.data.data.file,
              });
            }
          } else if (selectedChatType === "group") {
            socket.emit("sendGroupMessage", {
              sender: userInfo._id,
              content: undefined,
              messageType: "file",
              fileUrl: response.data.data.file,
              groupId: selectedChatData._id,
            });
          }

          setMessage("");
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="h-[10vh] bg-[#1c1d25] flex justify-center items-center px-8 mb-5 gap-6">
      <div className="flex-1 flex bg-[#2a2b33] rounded-md items-center gap-5 pr-5">
        <input
          type="text"
          className="flex-1 p-5 bg-transparent rounded-md focus:bordr-none focus:outline-none"
          placeholder="Enter a Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button
          className="text-neutral-500 focus:border-none focus:outline-none focus:text-white duration-300 transition-all"
          onClick={handleAttachmentClick}
        >
          <GrAttachment className="text-2xl" />
        </button>
        <input
          type="file"
          className="hidden"
          ref={fileInputRef}
          onChange={handleAttachmentChange}
        />
      </div>
      <button
        className="text-neutral-500 focus:border-none focus:outline-none focus:text-white duration-300 transition-all"
        onClick={handleSendMessage}
      >
        <IoSend className="text-2xl" />
      </button>
    </div>
  );
}

export default MessageBar;

// TODO: Add the ability to send Emoji
