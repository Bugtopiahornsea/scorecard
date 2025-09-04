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
  saveCurrentGame();
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
  saveCurrentGame();
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

  // ✅ Show Winner Popup instead of plain alert
  showWinnerPopup(saved);

  // Reset everything for a new game
  players = [];
  scores = {};
  localStorage.removeItem("prehistoric_par_current");

  const nameInput = document.getElementById("playerName");
  if (nameInput) nameInput.value = "";

  renderScorecard();
  renderHistory();
}

// ----------------- Winner Popup -----------------
function showWinnerPopup(game) {
  // Calculate totals and sort players
  const rankings = game.players
    .map(p => ({
      name: p,
      total: game.scores[p].reduce((sum, v) => sum + (+v || 0), 0)
    }))
    .sort((a, b) => a.total - b.total);

  // Find the winning score (lowest)
  const winningScore = rankings[0].total;

  // Get all winners (handle ties)
  const winners = rankings.filter(p => p.total === winningScore);

  const popup = document.getElementById("winnerPopup");
  const content = document.getElementById("winnerContent");

  // Build the headline
  let winnerNames = winners.map(w => w.name).join(", ");
  let headline = winners.length > 1
    ? `🎉 Congratulations ${winnerNames}, you're all winners! 🎉`
    : `🎉 Congratulations ${winnerNames}, you're the winner! 🎉`;

  // Build the rankings list
  let html = `<h2>${headline}</h2><p>Here are the final rankings:</p><ul>`;
  rankings.forEach((p, i) => {
    // Highlight winner(s)
    if (winners.some(w => w.name === p.name)) {
      html += `<li style="font-weight:bold; color: #e67e22;">${i + 1}. ${p.name} — ${p.total} strokes</li>`;
    } else {
      html += `<li>${i + 1}. ${p.name} — ${p.total} strokes</li>`;
    }
  });
  html += "</ul>";

  content.innerHTML = html;
  popup.style.display = "flex";

  // Confetti in front of popup
  const duration = 2 * 1000; // 2 seconds
  const end = Date.now() + duration;

  (function frame() {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      zIndex: 10000
    });
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      zIndex: 10000
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
}

// New function for closing winner popup
function closeWinnerPopup() {
  const popup = document.getElementById("winnerPopup");
  if (popup) popup.style.display = "none";
}

// ----------------- Table Scrolling -----------------
function scrollTable(distance) {
  const container = document.querySelector(".table-scroll");
  container.scrollBy({
    left: distance,
    behavior: "smooth"
  });
}

// ----------------- Rules Popup -----------------
function closeRules() {
  const popup = document.getElementById("rulesPopup");
  if (popup) popup.style.display = "none";
}

function openRules() {
  const popup = document.getElementById("rulesPopup");
  if (popup) popup.style.display = "flex";
}

// ----------------- Init -----------------
window.addEventListener("load", function() {
  loadCurrentGame();
  renderHistory();
  renderScorecard();

  // ✅ Auto-show rules only the first time
  const popup = document.getElementById("rulesPopup");
  if (popup && !localStorage.getItem("prehistoric_rules_seen")) {
    popup.style.display = "flex";
    localStorage.setItem("prehistoric_rules_seen", "yes");
  }
});
