import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { useAppStore } from "@/store";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FiEdit2 } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { IoPowerSharp } from "react-icons/io5";
import apiClient from "@/lib/api-client";
import { LOGOUT_ROUTE } from "@/utils/constants";
import { toast } from "sonner";

function ProfileInfo() {
  const { userInfo, setUserInfo } = useAppStore();
  const navigate = useNavigate();

  const handleLogOut = async () => {
    try {
      const accessToken = userInfo.accessToken;  
      // console.log(accessToken, "accessToken");
          
      const response = await apiClient.post(
        LOGOUT_ROUTE,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        },
        { withCredentials: true }
      );

      if (response.status === 200) {
        setUserInfo(null);
        localStorage.setItem("accessToken", null);
        navigate("/auth");
        toast.success("Logged out successfully");
      }
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  return (
    <div className="absolute bottom-0 h-16 flex items-center justify-between px-10 w-full bg-[#2a2b33]">
      <div className="flex gap-3 items-center justify-center">
        <div className="w-12 h-12 relative ">
          <Avatar className="h-12 w-12 rounded-full overflow-hidden">
            {userInfo.avatar ? (
              <AvatarImage
                src={userInfo.avatar}
                alt="Profile"
                className="object-cover w-full h-full bg-black"
              />
            ) : (
              <div className="uppercase h-12 w-12 text-lg border-[1px] flex items-center justify-center rounded-full">
                {userInfo.firstname
                  ? userInfo.firstname.split("").shift()
                  : userInfo.email.split("").shift()}
              </div>
            )}
          </Avatar>
        </div>
        <div>
          {userInfo.firstname && userInfo.lastname
            ? `${userInfo.firstname} ${userInfo.lastname}`
            : `${userInfo.email}`}
        </div>
      </div>
      <div className="flex gap-5">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <FiEdit2
                className="text-purple-500 text-xl font-medium"
                onClick={() => navigate("/profile")}
              />
            </TooltipTrigger>
            <TooltipContent className="bg-[#1c1b1e] border-none text-white">
              <p>Edit Profile</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <IoPowerSharp
                className="text-red-500 text-xl font-medium"
                onClick={handleLogOut}
              />
            </TooltipTrigger>
            <TooltipContent className="bg-[#1c1b1e] border-none text-white">
              <p>Logout</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}

export default ProfileInfo;
