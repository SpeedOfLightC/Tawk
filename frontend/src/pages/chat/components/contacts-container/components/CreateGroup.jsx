import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import apiClient from "@/lib/api-client";
import {
  CREATE_GROUP_ROUTE,
  GET_ALL_CONTACTS_ROUTE,
  SEARCH_CONTACTS_ROUTE,
} from "@/utils/constants";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { useAppStore } from "@/store";
import { Button } from "@/components/ui/button";
import MultipleSelector from "@/components/ui/multipleselect";

function CreateGroup() {
  const {
    selectedChatType,
    selectedChatData,
    setSelectedChatType,
    setSelectedChatData,
    userInfo,
    addGroup,
  } = useAppStore();
  const [newGroupModal, setNewGroupModal] = useState(false);
  const [searchedContacts, setSearchedContacts] = useState([]);
  const [allContacts, setAllContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [groupName, setGroupName] = useState("");

  useEffect(() => {
    const getData = async () => {
      const accessToken = userInfo.accessToken;
      const response = await apiClient.get(
        GET_ALL_CONTACTS_ROUTE,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        },
        {
          withCredentials: true,
        }
      );
      setAllContacts(response.data.data);
    };

    getData();
  }, []);

  const createGroup = async () => {
    try {
      const accessToken = userInfo.accessToken;
      if (groupName.length > 0 && selectedContacts.length > 0) {
        const response = await apiClient.post(
          CREATE_GROUP_ROUTE,
          {
            name: groupName,
            members: selectedContacts.map((contact) => contact.value),
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          },
          { withCredentials: true }
        );

        if (response.status === 201) {
          setGroupName("");
          setSelectedContacts([]);
          setNewGroupModal(false);
          addGroup(response.data.data);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <FaPlus
              className="text-neutral-400 font-light text-opacity-90 text-sm hover:text-neutral-100 cursor-pointer transition-all duration-300"
              onClick={() => setNewGroupModal(true)}
            />
          </TooltipTrigger>
          <TooltipContent className="bg-[#1c1b1e] border-none mb-2 p-3 text-white">
            <p>Create New Group</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <Dialog open={newGroupModal} onOpenChange={setNewGroupModal}>
        <DialogContent className="bg-[#181920] border-none text-white w-400px h-400px flex flex-col">
          <DialogHeader>
            <DialogTitle>Please fill up the details for new group</DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          <div>
            <Input
              placeholder="Channel Name"
              className="rounded-lg p-6 bg-[#2c2e3b] border-none"
              onChange={(e) => setGroupName(e.target.value)}
              value={groupName}
            />
          </div>
          <div>
            <MultipleSelector
              className="rounded-lg bg-[#2c2e3b] border-none py-2 text-white"
              defaultOptions={allContacts}
              placeholder="Search Contacts"
              value={selectedContacts}
              onChange={setSelectedContacts}
              emptyIndicator={
                <p className="text-center text-lg leading-10 text-gray-600">
                  No Results found
                </p>
              }
            />
          </div>
          <div>
            <Button
              className="w-full bg-purple-700 hover:bg-purple-900 transition-all duration-300"
              onClick={createGroup}
            >
              Create Channel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default CreateGroup;
