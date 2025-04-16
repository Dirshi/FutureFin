const BASE_URL = "http://localhost:3000";
let currentUser = "";

// ✅ Register function
function register() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  fetch(BASE_URL + "/api/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  })
  .then(res => res.json())
  .then(data => {
    document.getElementById("loginMsg").textContent = data.message;
  });
}

// ✅ Login function
function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  fetch(BASE_URL + "/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  })
  .then(res => res.json())
  .then(data => {
    if (data.user) {
      currentUser = data.user.username;
      document.getElementById("userDisplay").textContent = currentUser;
      switchScreen("gameScreen");
      loadMarketAssets();
    } else {
      document.getElementById("loginMsg").textContent = data.message;
    }
  });
}

// ✅ Switch to a different screen
function switchScreen(screenId) {
  document.querySelectorAll(".screen").forEach(div => div.classList.remove("active"));
  document.getElementById(screenId).classList.add("active");
}

// ✅ Load market assets from server
function loadMarketAssets() {
  fetch(BASE_URL + "/api/market")
    .then(res => res.json())
    .then(data => {
      const list = document.getElementById("marketAssets");
      list.innerHTML = "";
      data.forEach(asset => {
        const item = document.createElement("div");
        item.textContent = `📊 ${asset.name} – $${asset.price}`;
        list.appendChild(item);
      });
    });
}

// ✅ Handle scenario decision buttons
function chooseDecision(choice) {
  const result = document.getElementById("scenarioResult");
  if (choice === "invest-ai") {
    result.innerHTML = "<p style='color: green;'>Your AI investment boosts productivity and increases market returns!</p>";
  } else if (choice === "retrain-workforce") {
    result.innerHTML = "<p style='color: orange;'>Your workforce is better prepared, but profits grow slower.</p>";
  }
}
