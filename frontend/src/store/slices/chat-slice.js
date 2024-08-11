export const createChatSlice = (set, get) => (
    {
        directMessagesContacts: [],
        selectedChatType: undefined,
        selectedChatData: undefined,
        selectedChatMessages: [],
        isUploading: false,
        isDownloading: false,
        fileUploadProgress: 0,
        fileDownloadProgress: 0,
        groups: [],
        setGroups: groups => set({ groups }),
        setIsUploading: isUploading => set({ isUploading }),
        setIsDownloading: isDownloading => set({ isDownloading }),  
        setFileUploadProgress: fileUploadProgress => set({ fileUploadProgress }),
        setFileDownloadProgress: fileDownloadProgress => set({ fileDownloadProgress }),
        setDirectMessagesContacts: directMessagesContacts => set({ directMessagesContacts }),
        setSelectedChatType: selectedChatType => set({ selectedChatType }),
        setSelectedChatData: selectedChatData => set({ selectedChatData }),
        setSelectedChatMessages: selectedChatMessages => set({ selectedChatMessages }),
        closeChat: () => set({
            selectedChatData: undefined,
            selectedChatType: undefined,
            selectedChatMessages: []
        }),
        addGroup: (group) => {
            const groups = get().groups;
            set({groups: [group, ...groups]})
        },
        addMessage: (message) => {
            const selectedChatMessages = get().selectedChatMessages;
            const selectedChatType = get().selectedChatType;

            set({
                selectedChatMessages: [...selectedChatMessages, {
                    ...message,
                    recipent: selectedChatType === "group" ? message.recipent : message.recipent._id,
                    sender: selectedChatType === "group" ? message.sender : message.sender._id
                }]
            })
        }
    }
)