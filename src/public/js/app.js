// io() => 자동으로 socket.io를 실행하는 서버를 찾아줌
const socket = io();

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");
const room = document.getElementById("room");

room.hidden = true; // room에 입장하기 전 요소 숨겨주기

let roomName;

function addMessage(message) {
  const ul = room.querySelector("ul");
  const li = document.createElement("li");
  li.innerText = message;
  ul.appendChild(li);
}

function handleMessageSubmit(event) {
  event.preventDefault();
  const input = room.querySelector("#msg input");
  const value = input.value;
  socket.emit("new_message", input.value, roomName, () => {
    addMessage(`You: ${value}`);
  });
  input.value = "";
}

function handleNicknameSubmit(event) {
  event.preventDefault();
  const input = room.querySelector("#name input");
  socket.emit("nickname", input.value);
}

// room에 입장시 weclome 요소를 숨기고 room 요소를 보여주는 함수
function showRoom() {
  welcome.hidden = true;
  room.hidden = false;
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName}`;
  const msgForm = room.querySelector("#msg");
  const nameForm = room.querySelector("#name");
  msgForm.addEventListener("submit", handleMessageSubmit);
  nameForm.addEventListener("submit", handleNicknameSubmit);
}

// emit() 함수를 통해 어떤 event(사용자 정의 event)든지 전송 가능
// JS Object를 string형 변환 없이도 전송 가능
// emit(${event}, ${object}, ${function})
// 끝날 떄 실행되는 function을 전송시에는 emit의 arg 리스트중 마지막에 넣어야 함
function handleRoomSubmit(event) {
  event.preventDefault();
  const roomNameInput = form.querySelector("#roomName");
  const nickNameInput = form.querySelector("#name");
  socket.emit("enter_room", roomNameInput.value, nickNameInput.value, showRoom);
  roomName = roomNameInput.value;
  roomNameInput.value = "";
  const changeNameInput = room.querySelector("#name input");
  changeNameInput.value = nickNameInput.value;
}

form.addEventListener("submit", handleRoomSubmit);

socket.on("welcome", (user, newCount) => {
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName} (${newCount})`;
  addMessage(`${user} joined! 😊`);
});

socket.on("bye", (left, newCount) => {
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName} (${newCount})`;
  addMessage(`${left} left! 😂`);
});

socket.on("new_message", addMessage);
const roomList = welcome.querySelector("ul");
roomList.innerHTML = "";
// App내 rooms이 하나도 없을시 array를 비워주는 작업
socket.on("room_change", (rooms) => {
  if (rooms.length === 0) {
    return;
  }
  rooms.forEach((room) => {
    const li = document.createElement("li");
    li.innerText = room;
    roomList.append(li);
  });
});
/* (1) WebSocket 이용한 app.js 
// WebSocket(브라우저와 서버 사이의 연결) 생성
const socket = new WebSocket(`ws://${window.location.host}`);
// html의 선택자들 받아오기
const messageList = document.querySelector("ul");
const messageForm = document.querySelector("#message");
const nickForm = document.querySelector("#nick");

// 브라우저로부터 json object를 수신, json object를 string 형변환 후
// front-end -> back-end로 송신
function makeMessage(type, payload) {
  const msg = { type, payload };
  return JSON.stringify(msg);
}

// backend에서 보내온 event를 frontend에서 받기위한 작업
socket.addEventListener("open", () => {
  // socket open 이벤트
  console.log("Connected to Server ✔");
});

// socekt message 이벤트(backend -> frontend 메시지 수신)
socket.addEventListener("message", (message) => {
  const li = document.createElement("li");
  li.innerText = message.data; // message의 data를 li에 넣어주기
  messageList.append(li);
});

socket.addEventListener("close", () => {
  // socket close 이벤트
  console.log("Disconnected from Server ❌");
});

// 브라우저의 form에서 메시지를 입력 받을 때 사용
function handleSubmit(event) {
  event.preventDefault();
  const input = messageForm.querySelector("input");
  socket.send(makeMessage("new_message", input.value));
  const li = document.createElement("li");
  li.innerText = `You : ${input.value}`; // message의 data를 li에 넣어주기
  messageList.append(li);
  input.value = ""; // 메세지를 보낼 때마다 비워주기
}

// 브라우저의 from에서 닉네임을 입력 받을 때 사용
function handleNickSubmit(event) {
  event.preventDefault();
  const input = nickForm.querySelector("input");
  socket.send(makeMessage("nickname", input.value));
}

messageForm.addEventListener("submit", handleSubmit);
nickForm.addEventListener("submit", handleNickSubmit);
*/
