import { useState, useContext, useRef } from "react";
import Tooltip from "@mui/material/Tooltip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextareaAutosize from "@mui/material/TextareaAutosize";
import Button from "@mui/material/Button";
import SendIcon from "@mui/icons-material/Send";
import "./SendMessage.css";
import { accountContext } from "../Contexts/appContext";
import axios from "axios";
import { TextAreaEmojis } from "./TextAreaEmojis";
import { motion } from "framer-motion";

export const SendMessage = ({ userInformation }) => {
  const { user, setRecentMessages, socket, recentMessages } =
    useContext(accountContext);
  const [sendMessageOpen, setSendMessageOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [currentPostConvoID, setCurrentPostConvoID] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  const ref = useRef();

  console.log(userInformation, 'userinfo')

  const handleClickOpen = async () => {
    setSendMessageOpen(true);
    const Url = "http://localhost:3001/conversation/create";
    const data = { user1: user.id, user2: userInformation._id };
    const newConvoId = await axios.post(Url, data, {
      headers: {
        authorization: localStorage.getItem("Token"),
      },
    });
    if (newConvoId) setCurrentPostConvoID(newConvoId.data._id);
  };

  const handleClose = () => {
    setSendMessageOpen(false);
  };

  const saveNewMessage = (data) => {
    console.log(data, 'da new messages section')
    const newMessage = {
      _id: data.chatId,
      recieverInfo: [
        {
          _id: data.recipientId,
          username: data.recipientUsername,
          profilePicture: data.recipientProfilePicture
        },
      ],
      senderInfo: [
        {
          _id: data.senderId,
          username: data.senderUsername,
          profilePicture: data.senderProfilePicture
        },
      ],
    };

    !recentMessages.some((chat) => chat._id === newMessage._id) &&
      setRecentMessages((prevChats) => [...prevChats, newMessage]);

    return !recentMessages.some((chat) => chat._id === newMessage._id);
  };

  const sendChatMessage = async () => {
    handleClose();
    const Url = "http://localhost:3001/message/send";
    const data = {
      chatId: currentPostConvoID,
      message: message,
      senderId: user.id,
      senderUsername: user.username,
      senderProfilePicture: user.profilePicture,
      recipientId: userInformation._id,
      recipientUsername: userInformation.username,
      recipientProfilePicture: userInformation.profilePicture
    };
    const res = await axios.post(Url, data, {
      headers: {
        authorization: localStorage.getItem("Token"),
      },
    });
    setMessage("");
    saveNewMessage(data);
    socket.emit("messages", data);
  };

  return (
    <>
      <motion.span
        whileHover={{ scale: 1.2 }}
        style={{
          height: "1em",
          width: "1em",
        }}
      >
        <Tooltip
          title={`Send ${
            userInformation.username.charAt(0).toUpperCase() + userInformation.username.slice(1)
          } a Message`}
        >
          <SendIcon
            className="send_message_icon"
            onClick={() => handleClickOpen()}
            sx={{
              fontSize: "20px",
              color: "rgb(68, 68, 68)",
              cursor: "pointer",
              transform: "rotate(-20deg)",
            }}
          />
        </Tooltip>
      </motion.span>
      <Dialog
        open={sendMessageOpen}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          <div
            style={{
              borderBottomStyle: "solid",
              borderWidth: ".5px",
            }}
          >
            To: {userInformation.username.charAt(0).toUpperCase() + userInformation.username.slice(1)}
          </div>
        </DialogTitle>
        <DialogContent>
          <h3 style={{ color: "black" }}>Your Message:</h3>
          <TextareaAutosize
            aria-label="empty textarea"
            placeholder="Write your message here"
            style={{ width:"100%", height: "auto" }}
            minRows={10}
            onChange={(e) => setMessage(e.target.value)}
            ref={ref}
          />
          <TextAreaEmojis
            input={ref.current}
            anchor={anchorEl}
            setAnchor={setAnchorEl}
            setMessage={setMessage}
          />
        </DialogContent>
        <DialogActions sx={{ padding: "0 24px 20px" }}>
          <Button
            className="outlined_submit_button"
            variant="outlined"
            color="secondary"
            onClick={() => sendChatMessage()}
          >
            Send
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
