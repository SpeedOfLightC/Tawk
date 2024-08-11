import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import apiClient from "@/lib/api-client";
import { useAppStore } from "@/store";
import { GET_GROUP_MESSAGES_ROUTE, GET_MESSAGES_ROUTE, MESSAGES_ROUTES } from "@/utils/constants";
import moment from "moment";
import React, { useEffect, useRef, useState } from "react";

function MessageContainer() {
  const scrollRef = useRef();
  const {
    selectedChatType,
    selectedChatData,
    userInfo,
    selectedChatMessages,
    setSelectedChatMessages,
  } = useAppStore();

  const [showImage, setShowImage] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    const getMessages = async () => {
      try {
        const response = await apiClient.post(
          GET_MESSAGES_ROUTE,
          { id: selectedChatData._id },
          { withCredentials: true }
        );

        // console.log(response);
        if (response.data.data) {
          setSelectedChatMessages(response.data.data);
        }
      } catch (error) {
        console.log(error);
      }
    };

    const getGroupMessages = async () => {
      try {
        const response = await apiClient.get(
          `${GET_GROUP_MESSAGES_ROUTE}/${selectedChatData._id}`,
          { withCredentials: true }
        );

        // console.log(response);
        if (response.data.data) {
          setSelectedChatMessages(response.data.data);
        }
      } catch (error) {
        console.log(error);
      }
    }

    if (selectedChatData._id) {
      if (selectedChatType === "contact") {
        getMessages();
      }
      else if (selectedChatType === "group") {
        getGroupMessages();
      }
    }
  }, [selectedChatData, selectedChatType, setSelectedChatMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedChatMessages]);

  const checkIfImage = (filePath) => {
    if (
      filePath.includes(".jpg") ||
      filePath.includes(".jpeg") ||
      filePath.includes(".png") ||
      filePath.includes(".gif")
    ) {
      return true;
    }

    return false;
  };

  const renderMessages = () => {
    let lastDate = null;
    return selectedChatMessages.map((message, index) => {
      const messageDate = moment(message.createdAt).format("YYYY-MM-DD");
      const showDate = messageDate !== lastDate;
      lastDate = messageDate;
      return (
        <div key={index}>
          {showDate && (
            <div className="text-center text-gray-500 my-2">
              {moment(message.createdAt).format("LL")}
            </div>
          )}
          {selectedChatType === "contact" && renderDmMessages(message)}
          {selectedChatType === "group" && renderGrouMessages(message)}
        </div>
      );
    });
  };

  const renderDmMessages = (message) => {
    return (
      <div
        className={`${
          message.sender === selectedChatData._id ? "text-left" : "text-right"
        }`}
      >
        {message.messageType === "text" && (
          <div
            className={`${
              message.sender !== selectedChatData._id
                ? "bg-[#8417ff]/5 text-[#8417ff]/90 border-[#8417ff]/50"
                : "bg-[#2a2b33]/5 text-white/80 border-[#ffffff]/20"
            } border inline-block p-4 rounded my-1 max-w-[50%] break-words ml-9`}
          >
            {message.content}
          </div>
        )}
        {message.messageType === "file" && (
          <div
            className={`${
              message.sender !== selectedChatData._id
                ? "bg-[#8417ff]/5 text-[#8417ff]/90 border-[#8417ff]/50"
                : "bg-[#2a2b33]/5 text-white/80 border-[#ffffff]/20"
            } border inline-block p-4 rounded my-1 max-w-[50%] break-words`}
          >
            {
              checkIfImage(message.fileUrl) && (
                <div
                  className="cursor-pointer"
                  onClick={() => {
                    setShowImage(true);
                    setImageUrl(message.fileUrl);
                  }}
                >
                  <img
                    src={message.fileUrl}
                    height={300}
                    width={300}
                    alt="Sent Image"
                  />
                </div>
              ) // TODO: Add other type of file upload feature also
            }
          </div>
        )}

        <div className="text-xs text-green-600 ">
          {moment(message.createdAt).format("LT")}
        </div>
      </div>
    );
  };

  const renderGrouMessages = (message) => {
    return (
      <div
        className={`mt-5 ${
          message.sender._id !== userInfo._id ? "text-left" : "text-right"
        }`}
      >
        {message.messageType === "text" && (
          <div
            className={`${
              message.sender._id === userInfo._id
                ? "bg-[#8417ff]/5 text-[#8417ff]/90 border-[#8417ff]/50"
                : "bg-[#2a2b33]/5 text-white/80 border-[#ffffff]/20"
            } border inline-block p-4 rounded my-1 max-w-[50%] break-words`}
          >
            {message.content}
          </div>
        )}
        {message.messageType === "file" && (
          <div
            className={`${
              message.sender._id === userInfo._id
                ? "bg-[#8417ff]/5 text-[#8417ff]/90 border-[#8417ff]/50"
                : "bg-[#2a2b33]/5 text-white/80 border-[#ffffff]/20"
            } border inline-block p-4 rounded my-1 max-w-[50%] break-words`}
          >
            {
              checkIfImage(message.fileUrl) && (
                <div
                  className="cursor-pointer"
                  onClick={() => {
                    setShowImage(true);
                    setImageUrl(message.fileUrl);
                  }}
                >
                  <img
                    src={message.fileUrl}
                    height={300}
                    width={300}
                    alt="Sent Image"
                  />
                </div>
              ) // TODO: Add other type of file upload feature also
            }
          </div>
        )}
        {message.sender._id !== userInfo._id ? (
          <div className="flex items-center justify-start gap-3">
            <Avatar className="h-8 w-8 rounded-full overflow-hidden">
              {message.sender.avatar && (
                <AvatarImage
                  src={message.sender.avatar}
                  alt="Profile"
                  className="object-cover w-full h-full bg-black"
                />
              )}
              <AvatarFallback className="uppercase h-8 w-8 text-lg flex items-center justify-center rounded-full">
                {message.sender.firstname
                  ? message.sender.firstname.split("").shift()
                  : message.sender.email.split("").shift()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-white/60">{`${message.sender.firstname} ${message.sender.lastname}`}</span>
            <span className="text-xs text-white/60">
              {moment(message.timestamp).format("LT")}
            </span>
          </div>
        ) : (
          <div className="text-xs text-white/60">
            {moment(message.timestamp).format("LT")}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hidden p-4 px-8 md:w-[65vw] lg:w-[70vw] xl:w-[80vw] w-full">
      {renderMessages()}
      <div ref={scrollRef}></div>
      {/* {showImage && (
        <div className="fixed z-[1000] top-0 left-0 h-[100vh] w-[100vw] flex items-center justify-center backdrop-blur-lg flex-col">
          <div>
            <img
              src={imageUrl}
              alt="sent image"
              className="h-[80vh] w-full bg-cover"
            />
          </div>
          <div className="flex gap-5 fixed top-0 mt-5">
            <button
              className="bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer trall
            duration-300"
            onClick={() => downloadFile(imageUrl)}
            >
              <IoMdArrowRoundDown />
            </button>
          </div>
        </div>
      )} */}
    </div>
  );
}

export default MessageContainer;
