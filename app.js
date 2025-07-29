const TOTAL_HOLES = 13;
let players = [];
let scores = {};
let history = JSON.parse(localStorage.getItem("prehistoric_par_history") || "[]");

function addPlayer() {
  const input = document.getElementById("playerName");
  const name = input.value.trim();
  if (!name) return;
  if (players.includes(name)) return alert("Player already added.");
  players.push(name);
  scores[name] = Array(TOTAL_HOLES).fill("");
  input.value = "";
  renderScorecard();
}

function updateScore(player, hole, value) {
  scores[player][hole] = value;
  renderScorecard(); // This auto-updates total after each change
}

function getTotal(player) {
  return scores[player].reduce((sum, v) => sum + (+v || 0), 0);
}

function renderScorecard() {
  const container = document.getElementById("scorecard");
  if (!players.length) {
    container.innerHTML = "";
    return;
  }

  let html = `<div class="table-scroll"><table><thead><tr><th>Player</th>`;
  for (let i = 0; i < TOTAL_HOLES; i++) {
    html += `<th>Hole ${i + 1}</th>`;
  }
  html += `<th>Total</th></tr></thead><tbody>`;

  players.forEach(player => {
    html += `<tr><td>${player}</td>`;
    for (let i = 0; i < TOTAL_HOLES; i++) {
      const val = scores[player][i] || "";
      html += `
        <td>
          <input 
            type="number" 
            min="1" max="10" 
            value="${val}"
            onchange="updateScore('${player}', ${i}, this.value)"
          />
        </td>`;
    }
    html += `<td><strong>${getTotal(player)}</strong></td></tr>`;
  });

  html += `</tbody></table></div>`; // Close wrapper
  container.innerHTML = html;
}

function saveGame() {
  if (!players.length) return alert("No players to save.");

  const savedGame = {
    date: new Date().toLocaleString(),
    players: [...players],
    scores: JSON.parse(JSON.stringify(scores))
  };

  history.unshift(savedGame);
  localStorage.setItem("prehistoric_par_history", JSON.stringify(history));
  alert("Game saved!");
  renderHistory();
}

function renderHistory() {
  const historyDiv = document.getElementById("history");
  if (!historyDiv) return;

  if (!history.length) {
    historyDiv.innerHTML = "<h2>Game History</h2><p>No games yet.</p>";
    return;
  }

  let html = `<h2>Game History</h2>`;
  history.forEach(game => {
    html += `<div class="history-game"><h3>${game.date}</h3><ul>`;
    game.players.forEach(player => {
      const total = game.scores[player].reduce((sum, v) => sum + (+v || 0), 0);
      html += `<li>${player}: ${total} strokes</li>`;
    });
    html += `</ul></div>`;
  });

  historyDiv.innerHTML = html;
}

// On page load
window.onload = () => {
  renderScorecard();
  renderHistory();
};
