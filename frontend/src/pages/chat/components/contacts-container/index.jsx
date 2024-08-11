import React, { useEffect } from "react";
import ProfileInfo from "./components/ProfileInfo";
import NewDm from "./components/NewDm";
import apiClient from "@/lib/api-client";
import { GET_DM_CONTACTS_ROUTE, GET_USER_GROUPS_ROUTE } from "@/utils/constants";
import { useAppStore } from "@/store";
import ContactList from "@/components/ContactList";
import CreateGroup from "./components/CreateGroup";

function ContactsContainer() {
  const { directMessagesContacts, setDirectMessagesContacts, groups, setGroups } =
    useAppStore();

  useEffect(() => {
    const getContacts = async () => {
      try {
        const response = await apiClient.get(GET_DM_CONTACTS_ROUTE, {
          withCredentials: true,
        });

        // console.log(response);

        if (response.data.data) {
          setDirectMessagesContacts(response.data.data);
        }
      } catch (error) {
        console.log(error);
      }
    };

    const getGroups = async () => {
      try {
        const response = await apiClient.get(GET_USER_GROUPS_ROUTE, {
          withCredentials: true,
        });

        if (response.data.data) {
          setGroups(response.data.data);
        }
      } catch (error) {
        console.log(error);
      }
    };

    getContacts();
    getGroups();
  }, []);


  return (
    <div className="relative md:w-[35vw] lg:w-[30vw] xl:w-[20vw] bg-[#1b1c24] border-r-2 border-[#2f303b] w-full">
      <div className="pt-3">
        <h1 className="poppins-medium text-4xl m-2">Tawk</h1>
      </div>
      <div className="my-5">
        <div className="flex items-center justify-between pr-10">
          <Title text="Direct Messages" />
          <NewDm />
        </div>
        <div className="max-h[38vh] overflow-y-auto scrollbar-hidden">
          <ContactList contacts={directMessagesContacts} />
        </div>
      </div>
      <div className="my-5">
        <div className="flex items-center justify-between pr-10">
          <Title text="Groups" />
          <CreateGroup />
        </div>
        <div className="max-h[38vh] overflow-y-auto scrollbar-hidden">
          <ContactList contacts={groups} isGroup={true} />
        </div>
      </div>
      <ProfileInfo />
    </div>
  );
}

export default ContactsContainer;

const Title = ({ text }) => {
  return (
    <h6 className="uppercase tracking-widest text-neutral-400 pl-10 font-light text-opacity-90 text-sm">
      {text}
    </h6>
  );
};

// TODO: reorder the messages and groups based on the last message sent
