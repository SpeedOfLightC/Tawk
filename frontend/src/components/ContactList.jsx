import { useAppStore } from "@/store";
import { Avatar, AvatarImage } from "@/components/ui/avatar";

function ContactList({ contacts, isGroup = false }) {
  const {
    selectedChatData,
    selectedChatType,
    setSelectedChatData,
    setSelectedChatType,
    setSelectedChatMessages,
  } = useAppStore();

  const handleClick = (contact) => {
    // console.log(contact.firstname);

    if (isGroup) {
      // console.log("HERE");
      setSelectedChatType("group");
    }
    else setSelectedChatType("contact");
    
    setSelectedChatData(contact);

    if (selectedChatData && selectedChatData._id !== contact._id) {
      setSelectedChatMessages([]);
    }
  };

  return (
    <div className="mt-5">
      {contacts.map((contact) => (
        <div
          key={contact._id}
          className={`pl-10 py-2 transition-all duration-300 cursor-pointer ${
            selectedChatData && selectedChatData._id === contact._id
              ? "bg-[#8417ff] hover:bg-[#8417ff]"
              : "hover:bg-[#f1f1f111]"
          }`}
          onClick={() => handleClick(contact)}
        >
          <div className="flex gap-5 items-center justify-start text-neutral-300">
            {!isGroup && (
              <Avatar className="h-10 w-10 rounded-full overflow-hidden">
                {contact.avatar ? (
                  <AvatarImage
                    src={contact.avatar}
                    alt="Profile"
                    className="object-cover w-full h-full bg-black"
                  />
                ) : (
                  <div className="uppercase h-12 w-12 text-lg border-[1px] flex items-center justify-center rounded-full">
                    {contact.firstname
                      ? contact.firstname.split("").shift()
                      : contact.email.split("").shift()}
                  </div>
                )}
              </Avatar>
            )}
            {isGroup && (
              <div className="bg-[#ffffff22] h-10 w-10 flex items-center justify-center rounded-full">
                #
              </div>
            )}
            {isGroup ? (
              <span>{contact.name}</span>
            ) : (
              <span>{`${contact.firstname} ${contact.lastname}`}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default ContactList;
