import { useAppStore } from "@/store";
import { HOST } from "@/utils/constants";
import { createContext, useContext, useEffect, useRef } from "react";
import { io } from "socket.io-client";

const socketContext = createContext(null);

export const useSocket = () => {
  return useContext(socketContext);
};

export const SocketProvider = ({ children }) => {
  const socket = useRef();
  const { userInfo } = useAppStore();

  useEffect(() => {
    if (userInfo) {
      socket.current = io(HOST, {
        withCredentials: true,
        query: {
          userId: userInfo._id,
        },
      });

      socket.current.on("connect", () => {
        console.log("Connected to socket server");
      });

      const handleRecieveMessage = (message) => {
        const { selectedChatType, selectedChatData, addMessage } =
          useAppStore.getState();

        if (
          selectedChatType !== undefined &&
          (selectedChatData._id === message.sender._id ||
            selectedChatData._id === message.recipent._id)
        ) {
          // console.log("message rcvd: ", message);

          addMessage(message);
        }
      };

      const handleRecieveGroupMessage = (message) => {
        const { selectedChatType, selectedChatData, addMessage } =
          useAppStore.getState();

        if (
          selectedChatType !== undefined &&
          selectedChatData._id === message.groupId
        ) {
          // console.log("message rcvd: ", message);

          addMessage(message);
        }
      };

      socket.current.on("recieveMessage", handleRecieveMessage);
      socket.current.on("recieveGroupMessage", handleRecieveGroupMessage);

      return () => {
        socket.current.disconnect();
      };
    }
  }, [userInfo]);

  return (
    <socketContext.Provider value={socket.current}>
      {children}
    </socketContext.Provider>
  );
};
