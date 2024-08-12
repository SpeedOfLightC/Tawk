import { useAppStore } from "@/store";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import { AvatarImage } from "@/components/ui/avatar";
import { Avatar } from "@radix-ui/react-avatar";
import { FaPlus, FaTrash } from "react-icons/fa";
import { Input } from "../../components/ui/input";
// import { colors, getColor } from "@/lib/utils";
import { Button } from "../../components/ui/button";
import apiClient from "@/lib/api-client";
import {
  ADD_PROFILE_IMAGE_ROUTE,
  HOST,
  REMOVE_PROFILE_IMAGE_ROUTE,
  UPDATE_PROFILE_ROUTE,
} from "@/utils/constants";
import { toast } from "sonner";

function Profile() {
  const navigate = useNavigate();
  const { userInfo, setUserInfo } = useAppStore();
  const [firstname, setfirstname] = useState("");
  const [lastname, setlastname] = useState("");
  const [image, setImage] = useState(null);
  const [hovered, setHovered] = useState(false);
  const [selectedColors, setSelectedColors] = useState(0);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (userInfo.profileSetup === true) {
      setfirstname(userInfo.firstname);
      setlastname(userInfo.lastname);
      setSelectedColors(userInfo.color);
    }
    if (userInfo.avatar) {
      setImage(userInfo.avatar);
    }
  }, [userInfo]);

  const validateProfile = () => {
    if (!firstname) {
      toast.error("First Name is required");
      return false;
    }
    if (!lastname) {
      toast.error("Last Name is required");
      return false;
    }

    return true;
  };

  const saveChanges = async () => {
    if (!validateProfile()) return;

    try {
      const accessToken = userInfo.accessToken;

      const response = await apiClient.post(
        UPDATE_PROFILE_ROUTE,
        { firstname, lastname, selectedColors },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        },
        { withCredentials: true }
      );

      if (response.status === 200 && response.data.data) {
        setUserInfo({ ...response.data.data, accessToken });
        localStorage.setItem("accessToken", accessToken);
        toast.success(response.data.message);
        navigate("/chat");
      }
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  const handleNavigate = () => {
    if (userInfo.profileSetup === true) {
      navigate("/chat");
    } else {
      toast.error("Please setup profile first");
    }
  };

  const handleFileInputClick = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = async (e) => {
    try {
      const file = e.target.files[0];
      const accessToken = userInfo.accessToken;
      if (file) {
        const formData = new FormData();
        formData.append("avatar", file);

        // console.log(formData);

        const response = await apiClient.post(
          ADD_PROFILE_IMAGE_ROUTE,
          formData,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          },
          { withCredentials: true }
        );

        // console.log("Response: ", response);

        if (response.status === 200) {
          if (response.data.data.avatar) {
            setUserInfo({ ...userInfo, avatar: response.data.data.avatar });
            toast.success("Image updated successfully");
            if (userInfo.profileSetup === true) {
              navigate("/chat");
            }
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteImage = async (e) => {
    try {
      const accessToken = userInfo.accessToken;
      const response = await apiClient.delete(
        REMOVE_PROFILE_IMAGE_ROUTE,
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
      if (response.status === 200) {
        setUserInfo({ ...userInfo, avatar: null });
        toast.success("Image removed successfully");
        setImage(null);
      }
    } catch (error) {}
  };

  return (
    <div className="bg-[#1b1c24] h-[100vh] flex items-center justify-center flex-col gap-10">
      <div className="flex flex-col gap-10 w-[80vw] md:w-max">
        <div onClick={handleNavigate}>
          <IoArrowBack className="text-4xl lg:text-6xl text-white/90 cursor-pointer" />
        </div>
        <div className="grid grid-cols-2">
          <div
            className="h-full w-32 md:w-48 md:h-48 relative flex items-center justify-center"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            <Avatar className="h-32 w-32 md:w-48 md:h-48 rounded-full overflow-hidden">
              {image ? (
                <AvatarImage
                  src={image}
                  alt="Profile"
                  className="object-cover w-full h-full bg-black"
                />
              ) : (
                <div className="uppercase h-32 w-32 md:w-48 md:h-48 text-5xl border-[1px] flex items-center justify-center rounded-full">
                  {firstname
                    ? firstname.split("").shift()
                    : userInfo.email.split("").shift()}
                </div>
              )}
            </Avatar>

            {hovered && (
              <div
                className="absolute inset-0 fle items-center justify-center bg-black/50 rounded-full cursor-pointer"
                onClick={image ? handleDeleteImage : handleFileInputClick}
              >
                {image ? (
                  <FaTrash className="text-white text-3xl cursor-pointer" />
                ) : (
                  <FaPlus className="text-white text-3xl cursor-pointer" />
                )}
              </div>
            )}

            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleImageChange}
              name="avatar"
              accept=".png, .jpg, .jpeg, .svg, .webp"
            />
          </div>

          <div className="flex min-w-32 md:min-w-64 flex-col gap-5 text-white items-center justify-center">
            <div className="w-full">
              <Input
                placeholder="Email"
                type="email"
                disabled
                value={userInfo.email}
                className="rounded-lg p-6 bg-[#2c2e3b] border-none"
              />
            </div>
            <div className="w-full">
              <Input
                placeholder="First Name"
                type="text"
                onChange={(e) => setfirstname(e.target.value)}
                value={firstname}
                className="rounded-lg p-6 bg-[#2c2e3b] border-none"
              />
            </div>
            <div className="w-full">
              <Input
                placeholder="Last Name"
                type="text"
                onChange={(e) => setlastname(e.target.value)}
                value={lastname}
                className="rounded-lg p-6 bg-[#2c2e3b] border-none"
              />
            </div>
            {/* <div className="w-full flex gap-5">
              {colors.map((color, index) => (
                <div
                  className={`${color} h-8 w-8 rounded-full cursor-pointer transition-all duration-300 ${
                    selectedColors === index
                      ? "outline outline-white/50 outline-1"
                      : ""
                  }}`}
                  key={index}
                  onClick={(e) => setSelectedColors(index)}
                ></div>
              ))}
            </div> */}
          </div>
        </div>
      </div>
      <div className="w-full">
        <Button
          className="h-16 w-full bg-purple-700 hover:bg-purple-900 transition-all duration-300"
          onClick={saveChanges}
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
}

export default Profile;
