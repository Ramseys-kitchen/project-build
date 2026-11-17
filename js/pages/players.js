import { getPlayers } from "../api.js";

const statusEl = document.getElementById("status");
const gridEl = document.getElementById("player-grid");
const searchEl = document.getElementById("player-search");
const filterButtons = document.querySelectorAll(".filter-btn");

let allPlayers = [];
let currentPosition = "all";
let searchTerm = "";

// ---------- The four states ----------
function showLoading() {
  gridEl.hidden = true;
  statusEl.hidden = false;
  statusEl.className = "status status-loading";
  statusEl.innerHTML = '<span class="spinner" aria-hidden="true"></span> Loading players...';
}

function showError() {
  gridEl.hidden = true;
  statusEl.hidden = false;
  statusEl.className = "status status-error";
  statusEl.innerHTML =
    "<p>Sorry, we couldn't load the players right now.</p>" +
    '<button type="button" class="btn btn-red" id="retry">Try again</button>';
  document.getElementById("retry").addEventListener("click", init);
}

function showEmpty(message) {
  gridEl.hidden = true;
  statusEl.hidden = false;
  statusEl.className = "status status-empty";
  statusEl.textContent = message;
}

function showSuccess() {
  statusEl.hidden = true;
  gridEl.hidden = false;
}

// ---------- Rendering ----------
function cardHTML(p) {
  const image = p.image
    ? '<img src="' + p.image + '" alt="' + p.name + ' in a Liverpool shirt" loading="lazy">'
    : '<span class="no-photo" aria-hidden="true">' + p.name.charAt(0) + "</span>";

  return '<li class="player-card">' +
    '<div class="card-top">' +
      '<div class="player-photo">' + image + "</div>" +
      '<div class="player-meta">' +
        '<span class="player-number">' + p.number + "</span>" +
        '<span class="player-position">' + p.position + "</span>" +
      "</div>" +
    "</div>" +
    '<h2 class="player-card-name">' + p.name + "</h2>" +
  "</li>";
}

function render() {
  const term = searchTerm.trim().toLowerCase();
  const filtered = allPlayers.filter(function (p) {
    const positionOk = currentPosition === "all" || p.position === currentPosition;
    const nameOk = p.name.toLowerCase().includes(term);
    return positionOk && nameOk;
  });

  if (filtered.length === 0) {
    showEmpty("No players match your search.");
    return;
  }

  gridEl.innerHTML = filtered.map(cardHTML).join("");
  showSuccess();
}

// ---------- Filters and search ----------
filterButtons.forEach(function (btn) {
  btn.addEventListener("click", function () {
    currentPosition = btn.dataset.position;
    filterButtons.forEach(function (b) {
      const active = b === btn;
      b.classList.toggle("is-active", active);
      b.setAttribute("aria-pressed", active);
    });
    render();
  });
});

searchEl.addEventListener("input", function () {
  searchTerm = searchEl.value;
  render();
});

// ---------- Start ----------
async function init() {
  showLoading();
  try {
    allPlayers = await getPlayers();
    if (allPlayers.length === 0) {
      showEmpty("No players found.");
      return;
    }
    render();
  } catch (error) {
    console.error(error);
    showError();
  }
}

init();