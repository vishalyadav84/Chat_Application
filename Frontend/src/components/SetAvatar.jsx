
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import axios from "axios";
import loader from "../assets/loader.gif";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { setAvatarRoute } from "../utils/APIRoutes";

export default function SetAvatar() {
  const api = "https://api.dicebear.com/7.x/personas/svg";
  const navigate = useNavigate();
  const [avatars, setAvatars] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAvatar, setSelectedAvatar] = useState(undefined);

  const toastOptions = {
    position: "bottom-right",
    autoClose: 5000,
    pauseOnHover: true,
    draggable: true,
    theme: "dark",
  };

  useEffect(() => {
    const checkUser = async () => {
      const storedUser = localStorage.getItem(
        process.env.REACT_APP_LOCALHOST_KEY
      );
      if (!storedUser) {
        navigate("/login");
      }
    };
    checkUser();
  }, [navigate]);

  const setProfilePicture = async () => {
    if (selectedAvatar === undefined) {
      toast.error("Please select an avatar", toastOptions);
      return;
    }

    const storedUser = localStorage.getItem(
      process.env.REACT_APP_LOCALHOST_KEY
    );
    if (!storedUser) {
      toast.error("User not found. Please log in again.", toastOptions);
      navigate("/login");
      return;
    }

    const user = JSON.parse(storedUser);

    try {
      const { data } = await axios.post(
        `${setAvatarRoute}/${user._id}`,
        { image: avatars[selectedAvatar] },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`, 
          },
          withCredentials: true, 
        }
      );

      if (data.isSet) {
        user.isAvatarImageSet = true;
        user.avatarImage = data.image;
        localStorage.setItem(
          process.env.REACT_APP_LOCALHOST_KEY,
          JSON.stringify(user)
        );
        navigate("/");
      } else {
        toast.error("Error setting avatar. Please try again.", toastOptions);
      }
    } catch (error) {
      console.error("Error setting avatar:", error);
      toast.error("Server error. Please try again.", toastOptions);
    }
  };

  const refreshAvatars = async () => {
    setIsLoading(true);
    try {
      const data = [];
      for (let i = 0; i < 4; i++) {
        const url = `https://api.dicebear.com/7.x/personas/svg?seed=${
          Math.random() * 1000
        }`;
        console.log("Fetching avatar:", url); 

        const response = await fetch(url, { method: "GET" });

        if (!response.ok) {
          throw new Error(
            `HTTP Error: ${response.status} - ${response.statusText}`
          );
        }

        const svgText = await response.text();
        const base64Svg = btoa(unescape(encodeURIComponent(svgText))); 

        data.push(base64Svg);
        console.log("Avatar fetched successfully");
      }

      setAvatars(data);
    } catch (error) {
      console.error("Error fetching avatars:", error);
      toast.error(`Failed to load avatars: ${error.message}`, toastOptions);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshAvatars();
  }, []);

  return (
    <>
      {isLoading ? (
        <Container>
          <img src={loader} alt="loader" className="loader" />
        </Container>
      ) : (
        <Container>
          <div className="title-container">
            <h1>Pick an Avatar as your profile picture</h1>
          </div>
          <div className="avatars">
            {avatars.map((avatar, index) => (
              <div
                key={index} 
                className={`avatar ${
                  selectedAvatar === index ? "selected" : ""
                }`}
                onClick={() => setSelectedAvatar(index)}
              >
                <img src={`data:image/svg+xml;base64,${avatar}`} alt="avatar" />
              </div>
            ))}
          </div>
          <div className="button-container">
            <button onClick={refreshAvatars} className="refresh-btn">
              Refresh Avatars
            </button>
            <button onClick={setProfilePicture} className="submit-btn">
              Set as Profile Picture
            </button>
          </div>
          <ToastContainer />
        </Container>
      )}
    </>
  );
}

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 2rem;
  background-color: #131324;
  height: 100vh;
  width: 100vw;

  .loader {
    max-inline-size: 100%;
  }

  .title-container h1 {
    color: white;
  }

  .avatars {
    display: flex;
    gap: 2rem;

    .avatar {
      border: 0.4rem solid transparent;
      padding: 0.4rem;
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      transition: 0.3s ease-in-out;

      img {
        height: 6rem;
      }
    }

    .selected {
      border: 0.4rem solid #4e0eff;
    }
  }

  .button-container {
    display: flex;
    gap: 1rem;

    button {
      padding: 1rem 2rem;
      border: none;
      font-weight: bold;
      cursor: pointer;
      border-radius: 0.4rem;
      font-size: 1rem;
      text-transform: uppercase;
    }

    .refresh-btn {
      background-color: #ff8c00;
      color: white;
      &:hover {
        background-color: #985000;
      }
    }

    .submit-btn {
      background-color: #4e0eff;
      color: white;
      &:hover {
        background-color: #100098;
      }
    }
  }
`;
