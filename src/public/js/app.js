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

// 브라우저의 form에서 내용을 input 받을 시
// input의 내용을 server(back-end)로 송신
function handleSubmit(event) {
  event.preventDefault();
  const input = messageForm.querySelector("input");
  socket.send(makeMessage("new_message", input.value));
  input.value = ""; // 메세지를 보낼 때마다 비워주기
}

function handleNickSubmit(event) {
  event.preventDefault();
  const input = nickForm.querySelector("input");
  socket.send(makeMessage("nickname", input.value));
}

messageForm.addEventListener("submit", handleSubmit);
nickForm.addEventListener("submit", handleNickSubmit);
