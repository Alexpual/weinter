/*************  Firebase Config (REPLACE THIS)  *************/
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "SENDER_ID",
  appId: "APP_ID"
};
/************************************************************/

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

/* ---------- USER SESSION ---------- */
let username = sessionStorage.getItem('chatUsername');
if (!username) {
  username = prompt('Enter your name:') || `Guest-${Math.floor(Math.random()*1000)}`;
  sessionStorage.setItem('chatUsername', username);
}
document.getElementById('meName').textContent = username;

/* ---------- THEME (Dark/Light) ---------- */
const themeSwitch = document.getElementById('themeSwitch');
const savedTheme = localStorage.getItem('chatTheme') || 'light';
if (savedTheme === 'dark') {
  document.body.classList.add('dark');
  themeSwitch.checked = true;
}
themeSwitch.addEventListener('change', () => {
  const dark = themeSwitch.checked;
  document.body.classList.toggle('dark', dark);
  localStorage.setItem('chatTheme', dark ? 'dark' : 'light');
});

/* ---------- ELEMENTS ---------- */
const msgInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const messagesEl = document.getElementById('chatMessages');
const logoutBtn = document.getElementById('logoutBtn');
const onlineCountEl = document.getElementById('onlineCount');
const onlineListPopover = document.querySelector('.online-list');
const userListEl = document.getElementById('userList');

/* ---------- EMOJI PICKER ---------- */
const emojiBtn = document.getElementById('emojiBtn');
const emojiPanel = document.getElementById('emojiPanel');

const EMOJIS = [
  "😀","😄","😁","😆","😊","🙂","😉","😍",
  "😘","😎","🤗","🤩","🤔","🤨","😏","🤤",
  "😴","🤯","😱","😇","🥳","😭","😅","🤣",
  "😤","🤬","👍","👎","🙏","👏","🔥","✨",
  "💯","🎉","❤️","💙","💚","💛","💜","🧡",
  "⚽","🏀","🎮","🎧","🍕","🍔","🍟","☕"
];

function renderEmojiPanel() {
  const wrapper = document.createElement('div');
  wrapper.className = 'emoji-grid';
  EMOJIS.forEach(e => {
    const b = document.createElement('button');
    b.className = 'emoji-btn';
    b.textContent = e;
    b.addEventListener('click', () => {
      msgInput.value += e;
      msgInput.focus();
    });
    wrapper.appendChild(b);
  });
  emojiPanel.innerHTML = '';
  emojiPanel.appendChild(wrapper);
}
renderEmojiPanel();

emojiBtn.addEventListener('click', () => {
  const visible = emojiPanel.style.display === 'block';
  emojiPanel.style.display = visible ? 'none' : 'block';
});
document.addEventListener('click', (e) => {
  if (!emojiPanel.contains(e.target) && e.target !== emojiBtn) {
    emojiPanel.style.display = 'none';
  }
});

/* ---------- SEND MESSAGE ---------- */
function sendMessage() {
  const text = msgInput.value.trim();
  if (!text) return;
  const payload = {
    username,
    message: text,
    ts: Date.now()
  };
  db.ref('messages').push(payload);
  msgInput.value = '';
}
sendBtn.addEventListener('click', sendMessage);
msgInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    sendMessage();
  }
});

/* ---------- LISTEN FOR NEW MESSAGES ---------- */
db.ref('messages').limitToLast(200).on('child_added', snap => {
  const m = snap.val();
  const wrap = document.createElement('div');
  wrap.className = 'msg ' + (m.username === username ? 'me' : 'other');

  const safeName = document.createElement('span');
  safeName.textContent = m.username;

  const safeMsg = document.createElement('span');
  safeMsg.textContent = m.message;

  const meta = document.createElement('div');
  meta.className = 'meta';
  meta.textContent = new Date(m.ts).toLocaleTimeString();

  const nameLine = document.createElement('div');
  nameLine.style.fontSize = '12px';
  nameLine.style.color = 'var(--muted)';
  nameLine.appendChild(safeName);

  const textLine = document.createElement('div');
  textLine.appendChild(safeMsg);

  wrap.appendChild(nameLine);
  wrap.appendChild(textLine);
  wrap.appendChild(meta);
  messagesEl.appendChild(wrap);
  messagesEl.scrollTop = messagesEl.scrollHeight;
});

/* ---------- PRESENCE (Online Users) ---------- */
const myId = sessionStorage.getItem('chatUserId') || db.ref().push().key;
sessionStorage.setItem('chatUserId', myId);

const myPresenceRef = db.ref(`presence/${myId}`);
const connectedRef = db.ref('.info/connected');

connectedRef.on('value', (snap) => {
  if (snap.val() === true) {
    // Set presence and remove on disconnect
    myPresenceRef
      .onDisconnect()
      .remove()
      .then(() => {
        myPresenceRef.set({
          name: username,
          lastActive: firebase.database.ServerValue.TIMESTAMP
        });
      });
  }
});

// Update UI for online users
db.ref('presence').on('value', (snap) => {
  const users = snap.val() || {};
  const list = Object.values(users);
  onlineCountEl.textContent = list.length;

  // Hover popover
  onlineListPopover.innerHTML = '';
  list.forEach(u => {
    const d = document.createElement('div');
    d.textContent = u.name;
    onlineListPopover.appendChild(d);
  });

  // Right panel list
  userListEl.innerHTML = '';
  Object.keys(users).forEach(id => {
    const li = document.createElement('li');
    const dot = document.createElement('span'); dot.className = 'dot';
    const name = document.createElement('span'); name.textContent = users[id].name;
    li.appendChild(dot);
    li.appendChild(name);
    userListEl.appendChild(li);
  });
});

/* ---------- LOGOUT ---------- */
logoutBtn.addEventListener('click', () => {
  // Remove presence and clear session
  myPresenceRef.remove().finally(() => {
    sessionStorage.removeItem('chatUsername');
    sessionStorage.removeItem('chatUserId');
    location.reload();
  });
});