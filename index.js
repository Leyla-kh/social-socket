const io = require("socket.io")(8900, {
  cors: {
    origin: "https://my-social-app-cso6.onrender.com",
  },
});

let onlineUsers = [];

const addUser = (userId, socketId) => {
  !onlineUsers.some((user) => user.userId === userId) &&
    onlineUsers.push({ userId, socketId });
};
const removeUser = (socketId) => {
  onlineUsers = onlineUsers.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return onlineUsers.find((user) => user.userId === userId);
};

// connect
io.on("connection", (socket) => {
  console.log("user connected");
  socket.on("addUser", (userId) => {
    console.log("user added");
    addUser(userId, socket.id);
    io.emit("getOnlineUsers", onlineUsers);

    console.log(onlineUsers);
  });

  // get & send message
  socket.on("sendMessage", ({ senderId, receiverId, text, senderName }) => {
    const receiver = getUser(receiverId);
    try {
      io.to(receiver.socketId).emit("getMessage", { senderId, text });
      io.to(receiver.socketId).emit("getChatNotification", {
        senderName,
        senderId,
      });
    } catch (error) {
      console.log(error);
    }
  });

  // Notifications
  socket.on("sendNotification", ({ senderName, receiverId, type }) => {
    console.log("send notif");
    const receiver = getUser(receiverId);
    try {
      io.to(receiver.socketId).emit("getNotification", { senderName, type });
    } catch (error) {
      console.log(error);
    }
  });

  //disconnect
  socket.on("disconnect", () => {
    removeUser(socket.id);
    io.emit("getOnlineUsers", onlineUsers);
  });
});
