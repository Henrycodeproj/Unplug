import logo from "../../images/logo.png";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useContext, useState, useEffect, useRef } from "react";
import { accountContext } from "../Contexts/appContext";
import { AnimatePresence, motion } from "framer-motion";
import NotificationsIcon from "@mui/icons-material/Notifications";
import RecordVoiceOverIcon from "@mui/icons-material/RecordVoiceOver";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import LogoutIcon from "@mui/icons-material/Logout";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SettingsIcon from "@mui/icons-material/Settings";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import Popover from "@mui/material/Popover";
import Divider from "@mui/material/Divider";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import AccountCircle from "@mui/icons-material/AccountCircle";
import TravelExploreIcon from "@mui/icons-material/TravelExplore";
import axios from "axios";
import "../navigation/navbar.css";
import { SearchBarModal } from "./SearchBarModal";
import { Notification } from "../AuthViews/DisplayPage/Notification";
import List from '@mui/material/List';


export const Navbar = () => {
  const navigateTo = useNavigate();
  const ref = useRef();
  const { 
     userStatus,
     user, 
     logoutHandler, 
     socket, 
     posts, 
     userNotification, 
     setUserNotification,
     notificationID,
     numb,
     setNumb,
     time,
     setTime,
     lastActive, 
     setLastActive,
     unreadNotifications,
     setUnreadNotifications,
     newNotification,
     setNewNotification,
     setClicked  
    } =
    useContext(accountContext);

  //animation for framer motion
  const variants = {
    alert: { 
      opacity: 1,
      scale:[.95, 1, .95], 
      boxShadow: [
        "0 0 0 0 rgba(128, 128, 128, 0.393)",
       "0 0 0 15px rgba(128, 128, 128, 0)",
       "0 0 0 0 rgba(128, 128, 128, 0)"
      ],
      transition:{ repeat: Infinity, duration: 2 }
     },
      
    noAlert: {},
  }

  const [profile, setProfile] = useState(null);
  const [notification, setNotification] = useState(null);
  const [userInfo, setUserInfo] = useState();
  const [anchorEl, setAnchorEl] = useState(null);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState();
  const [searchClicked, setSearchClicked] = useState(false);

  const navlogoutHandler = () => {
    socket.emit("logout", { userID: user.id });
    logoutHandler();
    setProfile(false);
  };
  const searchwordHandler = (word) => {
    setSearch(word);
  };
  
  useEffect(() => {
    searchBarHandler();
  }, [search, posts]);

  const searchBarHandler = async () => {
    const data = {
      word: search,
    };
    const url = "http://localhost:3001/posts/search";
    const searchResponse = await axios.post(url, data, {
      headers: {
        authorization: localStorage.getItem("Token"),
      },
    });

    if (searchResponse.data && searchResponse.data.length >= 1) {
      setSearchResults(searchResponse.data);
      setAnchorEl(ref.current);
    } else {
      setAnchorEl(null);
    }
  };

  const searchInputCheck = () => {
    if (search) setAnchorEl(ref.current);
    else setSearchResults([]);
  };

  useEffect(() => {
    setUserInfo(user);
  }, [user]);

  const open = Boolean(profile);

  const getUserNotifications = async () => {
    console.log("caller")
    const url = `http://localhost:3001/user/${user.id}/notifications`;
    const response = await axios.get(url, {
      headers: {
        authorization: localStorage.getItem("Token"),
      }
    });
    console.log(userNotification, 'user not')
    console.log(response.data.notifications,'tess')
    setUserNotification(response.data.notifications)
  }

  useEffect(() => {
    socket.on(`${notificationID}-notification`, (data) => {
      console.log(data)
      if (!(userNotification.some(notification => notification.postId._id === data[0].postId._id))) {
        setUserNotification(prev => [...prev, data[0]])
        setUnreadNotifications(count => count + 1)
      }
    })
  return () => { 
    socket.removeListener(`${notificationID}-notification`);
  }
}, [notificationID])

  const openProfile = (e) => {
    setProfile(e.currentTarget);
  };
  const closeProfile = () => {
    setProfile(null);
  };

  const notificationOpen = Boolean(notification);

  const updateLastActive = async () => {
    const data = {user: user}
    const url = `http://localhost:3001/user/update/activity`;
    const response = await axios.post(url, data, {
        headers: {
          authorization: localStorage.getItem("Token")
        }
    })
  }

  const handleClick = async (event) => {
    setNotification(event.currentTarget)
    setUnreadNotifications(0)
    getUserNotifications()
    updateLastActive()
  };

  const handleClose = () => {
    setNotification(null);
    setTime(new Date().toISOString())
  };

  if (userStatus) {
    return (
      <nav>
        <div className="navbar-wrapper">
          <img
            className="unplug_logo"
            src={logo}
            alt="logo"
            onClick={() =>
              !userStatus ? navigateTo("/") : navigateTo("/display")
            }
          />
          <div className="profile_section">
            {searchClicked ? (
              <TravelExploreIcon
                onClick={() => setSearchClicked(false)}
                sx={{ color: "white", fontSize: "1.85rem", cursor: "pointer" }}
              />
            ) : (
              <motion.div
                initial={{
                  opacity: 0,
                  x: 20
                }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.75 }}
                exit = {{scale: 5}}
              >
                <TextField
                  ref={ref}
                  id="input-with-icon-textfield"
                  placeholder="Search Unplug"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment
                        position="start"
                        sx={{ color: "white" }}
                        className="navy_search"
                      >
                        <TravelExploreIcon
                          sx={{
                            fontSize: "1.85rem",
                            cursor: "pointer"
                          }}
                          onClick={
                            () => setSearchClicked(true)
                          }
                        />
                      </InputAdornment>
                    ),
                  }}
                  onChange={(e) => searchwordHandler(e.target.value)}
                  variant="standard"
                  color="secondary"
                  sx={{
                    "& .MuiInput-underline:before": {
                      borderBottomColor: "gray",
                      borderBottomWidth: "2px",
                    },
                    "& .MuiInput-underline:after": {
                      borderBottomColor: "white",
                    },
                    width: "100%",
                  }}
                  className="search_bar"
                  onClick={() => searchInputCheck()}
                />
              </motion.div>
            )}
            <SearchBarModal
              anchorEl={anchorEl}
              setAnchorEl={setAnchorEl}
              searchResults={searchResults}
              setSearchResults={setSearchResults}
            />
            <Badge badgeContent={unreadNotifications} color="error">
                <motion.div
                  style = {{borderRadius:"50%", width:"30.4px", height:"30.4px"}} 
                  animate={unreadNotifications > 0 ? "alert": "noAlert"}
                  variants={variants}>
                <NotificationsIcon
                  className="notification_bell"
                  onClick={(e) => handleClick(e)}
                />
                </motion.div>
              <Popover
                open={notificationOpen}
                anchorEl={notification}
                onClose={handleClose}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "left",
                }}
              >
                <div className="Notifications_container">
                
                  <List
                    sx={{
                      minWidth: "200px",
                      display: "flex",
                      alignItems: "center",
                      gap: 3,
                      justifyContent: "space-evenly",
                    }}
                  >
                    <h2>Notifications</h2>
                    <span>
                      <RecordVoiceOverIcon />
                    </span>
                  </List>
                  <Divider />
                  <Notification/>
                </div>
              </Popover>
            </Badge>
            <div>
              <IconButton
                onClick={openProfile}
                size="small"
                aria-controls={open ? "account-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={open ? "true" : undefined}
              >
                <Avatar
                  src={user && `https://ucarecdn.com/${user.profilePicture}/`}
                  sx={{
                    width: "40px",
                    height: "40px",
                    borderStyle: "solid",
                    borderColor: "white",
                  }}
                  className="navbar-avatar"
                  onClick={openProfile}
                />
              </IconButton>
              <Menu
                id="basic-menu"
                anchorEl={profile}
                open={open}
                onClose={closeProfile}
                MenuListProps={{
                  "aria-labelledby": "basic-button",
                }}
                sx={{ width: "400px" }}
              >
                <MenuItem
                  sx={{ minWidth: "180px" }}
                  onClick={() => {
                    closeProfile();
                    navigateTo(`/profile/${user.id}`, { replace: true });
                  }}
                >
                  <AccountCircleIcon
                    className="profile_menu_icon"
                    sx={{ mr: 2 }}
                  />
                  <div>Profile</div>
                </MenuItem>
                <MenuItem sx={{ minWidth: "180px" }} onClick={closeProfile}>
                  <SettingsIcon className="profile_menu_icon" sx={{ mr: 2 }} />
                  <div>Settings</div>
                </MenuItem>
                <MenuItem
                  sx={{ minWidth: "180px" }}
                  onClick={() => navlogoutHandler()}
                >
                  <LogoutIcon className="profile_menu_icon" sx={{ mr: 2 }} />
                  <div>Logout</div>
                </MenuItem>
              </Menu>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav>
      {!userStatus ? (
        <div style = {{display:"flex", alignItems:"center", gap:"5%"}}>
        <motion.div whileHover={{ scale: 1.1 }}>
          <img
            className="unplug_logo"
            style={{ maxWidth: "100%" }}
            src={logo}
            alt="logo"
            onClick={() => setClicked(false)}
          />
        </motion.div>
        <h1 style={{color:"white", fontSize:"2rem"}}>Unplug</h1>
        </div>
      ) : (
        <div>
          <img
            className="unplug_logo"
            src={logo}
            alt="logo"
            onClick={() => navigateTo("/display")}
          />
        </div>
      )}
      <div className="profile_section">
        <div>
          <Button variant="contained" color="secondary">
            <a
              href="mailto:lihenryhl.work@gmail.com"
              style={{ color: "white", textDecoration: "none" }}
            >
              Contact
            </a>
          </Button>
        </div>
      </div>
    </nav>
  );
};
