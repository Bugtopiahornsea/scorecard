const TOTAL_HOLES = 13;
let players = [];
let scores = {};
let history = JSON.parse(localStorage.getItem("prehistoric_par_history") || "[]");

function addPlayer() {
  const nameInput = document.getElementById("playerName");
  const name = nameInput.value.trim();
  if (!name) return;
  if (players.includes(name)) return alert("Player already added.");
  players.push(name);
  scores[name] = Array(TOTAL_HOLES).fill("");
  nameInput.value = "";
  renderScorecard();
}

function updateScore(player, hole, value) {
  scores[player][hole] = value;
  renderScorecard();
}

function getTotal(player) {
  return scores[player].reduce((sum, v) => sum + (+v || 0), 0);
}

function renderScorecard() {
  const container = document.getElementById("scorecard");
  if (players.length === 0) {
    container.innerHTML = "";
    return;
  }

  let html = '<table><thead><tr><th>Player</th>';
  for (let i = 0; i < TOTAL_HOLES; i++) {
    html += `<th>Hole ${i + 1}</th>`;
  }
  html += "<th>Total</th></tr></thead><tbody>";

  players.forEach(player => {
    html += `<tr><td>${player}</td>`;
    for (let i = 0; i < TOTAL_HOLES; i++) {
      html += `<td><input type="number" min="1" max="10" value="${scores[player][i] || ''}" 
        onchange="updateScore('${player}', ${i}, this.value)" /></td>`;
    }
    html += `<td>${getTotal(player)}</td></tr>`;
  });

  html += "</tbody></table>";
  container.innerHTML = html;
}

function saveGame() {
  const saved = {
    date: new Date().toLocaleString(),
    players: [...players],
    scores: JSON.parse(JSON.stringify(scores))
  };
  history.unshift(saved);
  localStorage.setItem("prehistoric_par_history", JSON.stringify(history));
  alert("Game saved!");
  renderHistory();
}

function renderHistory() {
  const historyDiv = document.getElementById("history");
  if (!history.length) return;
  let html = "<h2>Previous Games</h2>";
  history.forEach(game => {
    html += `<div class="history-game"><h3>${game.date}</h3><ul>`;
    game.players.forEach(player => {
      const total = game.scores[player].reduce((sum, v) => sum + (+v || 0), 0);
      html += `<li>${player}: ${total} strokes</li>`;
    });
    html += "</ul></div>";
  });
  historyDiv.innerHTML = html;
}

renderHistory();
