// ✅ market.js – powers the Market Simulator

const BASE_URL = "http://localhost:3000";
let portfolio = {};
let tradeHistory = [];
let totalProfit = 0;

const newsSamples = [
  { text: "🧠 AI stocks are booming as governments back automation.", tag: "AI" },
  { text: "🌱 GreenTech surges as new climate bill passes.", tag: "Green" },
  { text: "⚠️ Crypto dips after global regulations increase.", tag: "Crypto" },
  { text: "💰 Tech giants announce record profits — stocks rally.", tag: "Tech" },
  { text: "📉 Inflation fears shake investor confidence.", tag: "Inflation" }
];

let currentNews = { text: "", tag: "" };

const assetThemes = {
  "GreenTech ETF": "Green",
  "SustainCorp": "Green",
  "BitCore Coin": "Crypto",
  "AI Insight Fund": "AI",
  "TechX Inc.": "Tech"
};

// 📰 Load news
function loadNews() {
  currentNews = newsSamples[Math.floor(Math.random() * newsSamples.length)];
  document.getElementById("news").textContent = currentNews.text;
}

// 📣 React to news (placeholder logic)
function reactToNews() {
  alert(`You reacted to: "${currentNews.text}"\nThis may influence market prices!`);
}

// 💼 Load available assets
function loadAssets() {
  fetch(`${BASE_URL}/api/market`)
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById("assets");
      container.innerHTML = "";
      data.forEach(asset => {
        const changeColor = asset.change > 0 ? "limegreen" : asset.change < 0 ? "tomato" : "gray";
        const sign = asset.change > 0 ? "+" : "";
        const div = document.createElement("div");
        div.className = "asset";
        div.innerHTML = `
          <div>
            <strong>${asset.name}</strong><br>
            $${asset.price.toFixed(2)}
            <span style="color:${changeColor}; font-weight:bold;">
              (${sign}${asset.change})
            </span>
          </div>
          <button onclick="buyAsset('${asset.name}', ${asset.price})">Buy</button>
        `;
        container.appendChild(div);
      });
    });
}

// ✅ Buy asset
function buyAsset(name, price) {
  if (!portfolio[name]) {
    portfolio[name] = { quantity: 0, total: 0 };
  }
  portfolio[name].quantity += 1;
  portfolio[name].total += price;
  tradeHistory.push(`🟢 Bought 1 share of ${name} @ $${price.toFixed(2)}`);
  updatePortfolio();
}

// 💸 Sell asset
function sellAsset(name, currentPrice) {
  const asset = portfolio[name];
  if (!asset || asset.quantity === 0) return;

  const avg = asset.total / asset.quantity;
  const profit = currentPrice - avg;
  const assetTag = assetThemes[name] || "General";
  const newsTag = currentNews.tag;

  let reason = "This was a neutral move.";
  if (assetTag === newsTag) {
    reason = profit >= 0
      ? "📈 Profit due to favorable news in this sector."
      : "📉 Loss due to negative sentiment from current news.";
  } else {
    reason = "💡 No direct impact from current news.";
  }

  totalProfit += profit;
  tradeHistory.push(`🔴 Sold 1 share of ${name} @ $${currentPrice.toFixed(2)} → Profit: $${profit.toFixed(2)} (${reason})`);

  alert(
    `Sold 1 share of ${name}
Buy Price: $${avg.toFixed(2)}
Sell Price: $${currentPrice.toFixed(2)}
Profit: $${profit.toFixed(2)}\n\n${reason}`
  );

  asset.quantity -= 1;
  asset.total -= avg;
  if (asset.quantity <= 0) delete portfolio[name];

  // 📤 Submit to leaderboard
  if (totalProfit >= 100 || tradeHistory.length >= 5) {
    fetch(`${BASE_URL}/api/leaderboard`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: localStorage.getItem("username") || "GuestTrader",
        type: "market",
        score: parseFloat(totalProfit.toFixed(2))
      })
    });
  }

  updatePortfolio();
}

// 🔄 Update portfolio display
function updatePortfolio() {
  fetch(`${BASE_URL}/api/market`)
    .then(res => res.json())
    .then(marketAssets => {
      const portDiv = document.getElementById("portfolio");
      const historyDiv = document.getElementById("history");
      const badgesDiv = document.getElementById("badges");

      portDiv.innerHTML = "";
      historyDiv.innerHTML = tradeHistory.slice(-5).join("<br>") || "No trades yet.";

      const keys = Object.keys(portfolio);
      if (keys.length === 0) {
        portDiv.textContent = "No assets yet.";
        document.getElementById("totalValue").textContent = "Total Value: $0";
        return;
      }

      let totalValue = 0;

      keys.forEach(key => {
        const item = portfolio[key];
        const avg = (item.total / item.quantity).toFixed(2);
        const live = marketAssets.find(a => a.name === key)?.price || 0;
        const change = live - avg;
        const percent = ((change / avg) * 100).toFixed(2);
        const color = change > 0 ? "limegreen" : change < 0 ? "tomato" : "gray";

        totalValue += item.quantity * live;

        const line = document.createElement("div");
        line.innerHTML = `
          <strong>${key}</strong><br>
          ${item.quantity} shares @ avg $${avg}<br>
          Live Price: $${live.toFixed(2)}<br>
          <span style="color:${color}; font-weight:bold;">
            ${change >= 0 ? "+" : ""}${change.toFixed(2)} (${percent}%)
          </span><br>
          <button onclick="sellAsset('${key}', ${live})">Sell</button>
        `;
        portDiv.appendChild(line);
      });

      document.getElementById("totalValue").textContent = `Total Value: $${totalValue.toFixed(2)}`;

      // 🏅 Achievements
      badgesDiv.innerHTML = "";
      if (totalProfit > 100) badgesDiv.innerHTML += `<div class="badge">💰 Profit Master!</div>`;
      if (tradeHistory.length >= 10) badgesDiv.innerHTML += `<div class="badge">📈 Active Trader</div>`;
    });
}

// 🚀 Initialize
loadNews();
loadAssets();
updatePortfolio();
setInterval(() => {
  loadAssets();
  updatePortfolio();
}, 5000);
