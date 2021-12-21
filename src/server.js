import express from "express";
import http from "http";
// import WebSocket from "ws";
import { Server } from "socket.io";
import { instrument } from "@socket.io/admin-ui";

const app = express();

// view engine : pug 설정 [pug 페이지 렌더링]
app.set("view engine", "pug");
app.set("views", __dirname + "/views");
// /public으로 이동시 __dirname + "/puiblic" 폴더 보여주기
app.use("/public", express.static(__dirname + "/public"));
// route 생성 : home("/")으로 이동시 request와 respone을 받고
// res.render("home") => home을 렌더링
app.get("/", (req, res) => res.render("home"));
// 어떠한 url을 입력해도 home으로 redirect 시켜주기
app.get("/*", (req, res) => res.redirect("/"));

// http 패키지를 이용한 express application 서버 구축(http 서버)
const httpServer = http.createServer(app);
// SecketIo 패키지를 이용한 io 서버 구축
const wsServer = new Server(httpServer, {
  cors: {
    origin: ["https://admin.socket.io"],
    credentials: true,
  },
});

instrument(wsServer, {
  auth: false,
});

// adapter의 get() 함수와 조건문을 통해서 sid의 key와 rooms의 key가
// 일치하지 않는 key(public rooms)를 찾아 publicRooms 배열에 저장 후 반환
// sid의 key와 rooms의 key가 같은 경우는 privateRooms임.(클라이언트 고유sid?)
function publicRooms() {
  const sids = wsServer.sockets.adapter.sids;
  const rooms = wsServer.sockets.adapter.rooms;
  const publicRooms = [];
  rooms.forEach((_, key) => {
    if (sids.get(key) === undefined) {
      publicRooms.push(key);
    }
  });
  return publicRooms;
}

// rooms에 접속한 인원의 수를 세주는 함수
function countRoom(roomName) {
  return wsServer.sockets.adapter.rooms.get(roomName)?.size;
}

wsServer.on("connection", (socket) => {
  socket["nickname"] = "Annonymous";
  socket.onAny((event) => {
    console.log(`Socket Event: ${event}`);
  });
  socket.on("enter_room", (roomName, nickname, done) => {
    socket["nickname"] = nickname;
    socket.join(roomName); // room_name으로 입장
    done();
    socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName));
    wsServer.sockets.emit("room_change", publicRooms());
  });
  socket.on("disconnecting", () => {
    socket.rooms.forEach((room) =>
      socket.to(room).emit("bye", socket.nickname, countRoom(room) - 1)
    );
  });
  socket.on("disconnect", () => {
    wsServer.sockets.emit("room_change", publicRooms());
  });
  socket.on("new_message", (msg, room, done) => {
    socket.to(room).emit("new_message", `${socket.nickname}: ${msg}`);
    done();
  });
  socket.on("nickname", (nickname) => (socket["nickname"] = nickname));
});

/*
// ws 패키지를 이용한 WebSocket 서버 구축(ws 서버)
const wss = new WebSocket.Server({ server });
// 각 브라우저에서의 접속을 확인하기 위한 fake database 생성
 const sockets = [];

// on 메소드 : backend에 연결된 사람의 정보 제공
wss.on("connection", (socket) => {
  sockets.push(socket); // sockets[]에 연결된 브라우저의 정보 저장
  socket["nickname"] = "Anonymous"; // nickname을 정하지 않은 브라우저 접속시 할당
  console.log("Connected to Browser ✔");
  // 브라우저가 꺼질시 발생하는 이벤트(frontend -> backend 송신)
  socket.on("close", () => console.log("Disconnected from Browser ❌"));
  // 브라우저에서 메시지 송신 시 sockets 배열에 각 브라우저들의
  // socket 정보를 저장해서 서버를 통해 브라우저와 통신
  socket.on("message", (msg) => {
    // 브라우저에서 송신된 메시지(string)을 JS object형으로 형변환
    const message = JSON.parse(msg);
    switch (message.type) {
      case "new_message": // 송신된 데이터가 new_message일 경우
        sockets.forEach((aSocket) =>
          aSocket.send(`${socket.nickname} : ${message.payload}`)
        );
        break;
      case "nickname": // 송신된 데이터가 nickname일 경우
        socket["nickname"] = message.payload;
        break;
    }
  });
}); */

const handleListen = () =>
  console.log(`Listening on http://localhost:3000 even ws://localhost:3000`);

httpServer.listen(3000, handleListen);
