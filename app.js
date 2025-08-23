const TOTAL_HOLES = 13;
let players = [];
let scores = {};
let history = JSON.parse(localStorage.getItem("prehistoric_par_history") || "[]");

// ----------------- Game Save/Load -----------------
function saveCurrentGame() {
  const currentGame = { players, scores };
  localStorage.setItem("prehistoric_par_current", JSON.stringify(currentGame));
}

function loadCurrentGame() {
  const saved = localStorage.getItem("prehistoric_par_current");
  if (saved) {
    const currentGame = JSON.parse(saved);
    players = currentGame.players || [];
    scores = currentGame.scores || {};
  }
}

// ----------------- Players -----------------
function addPlayer() {
  const nameInput = document.getElementById("playerName");
  const name = nameInput.value.trim();
  if (!name) return;
  if (players.includes(name)) return alert("Player already added.");
  players.push(name);
  scores[name] = Array(TOTAL_HOLES).fill("");
  nameInput.value = "";
  renderScorecard();
  saveCurrentGame(); // ✅ save after adding player
}

// ----------------- Scores -----------------
function updateScore(player, hole, value) {
  const num = parseInt(value, 10);
  const maxStrokes = 10;

  if (num > maxStrokes) {
    alert(`The maximum number of strokes per hole is ${maxStrokes}.`);
    renderScorecard();
    return;
  }

  scores[player][hole] = value;
  renderScorecard();
  saveCurrentGame(); // ✅ save after updating score
}

function getTotal(player) {
  return scores[player].reduce((sum, v) => sum + (+v || 0), 0);
}

// ----------------- Rendering -----------------
function renderScorecard() {
  const container = document.getElementById("scorecard");
  if (players.length === 0) {
    container.innerHTML = "";
    return;
  }

  let html = '<div class="table-container"><table><thead><tr><th class="sticky-left">Player</th>';
  for (let i = 0; i < TOTAL_HOLES; i++) {
    html += `<th>Hole ${i + 1}</th>`;
  }
  html += '<th class="sticky-right">Total</th></tr></thead><tbody>';

  players.forEach(player => {
    html += `<tr><td class="sticky-left">${player}</td>`;
    for (let i = 0; i < TOTAL_HOLES; i++) {
      html += `<td><input type="number" min="1" max="10" value="${scores[player][i] || ''}" 
        onchange="updateScore('${player}', ${i}, this.value)" /></td>`;
    }
    html += `<td class="sticky-right">${getTotal(player)}</td></tr>`;
  });

  html += "</tbody></table></div>";
  container.innerHTML = html;
}

function renderHistory() {
  const historyDiv = document.getElementById("history");
  if (!history.length) {
    historyDiv.innerHTML = "";
    return;
  }
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

// ----------------- Save / End Game -----------------
function saveGame() {
  if (players.length === 0) {
    alert("No game to end. Please add players and scores first.");
    return;
  }

  const confirmEnd = confirm("Are you sure you want to end your game?");
  if (!confirmEnd) return;

  const saved = {
    date: new Date().toLocaleString(),
    players: [...players],
    scores: JSON.parse(JSON.stringify(scores))
  };

  history.unshift(saved);
  localStorage.setItem("prehistoric_par_history", JSON.stringify(history));
  alert("Game ended and saved!");

  // Reset everything for a new game
  players = [];
  scores = {};
  localStorage.removeItem("prehistoric_par_current"); // ✅ clear saved progress

  const nameInput = document.getElementById("playerName");
  if (nameInput) nameInput.value = "";

  renderScorecard();
  renderHistory();
}

// ----------------- Table Scrolling -----------------
function scrollTable(distance) {
  const container = document.querySelector('.table-scroll');
  container.scrollBy({
    left: distance,
    behavior: 'smooth'
  });
}

// ----------------- Rules Popup -----------------
function closeRules() {
  const popup = document.getElementById("rulesPopup");
  if (popup) {
    popup.style.display = "none";
  }
}

function openRules() {
  const popup = document.getElementById("rulesPopup");
  if (popup) {
    popup.style.display = "flex";
  }
}

// ----------------- Init -----------------
window.addEventListener("load", function() {
  loadCurrentGame();   // ✅ restore in-progress game if available
  renderHistory();
  renderScorecard();

  const popup = document.getElementById("rulesPopup");
  if (popup) {
    popup.style.display = "flex"; // show rules first time
  }
});
