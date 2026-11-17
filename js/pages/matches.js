import { getMatches } from "../api.js";

const statusEl = document.getElementById("status");
const contentEl = document.getElementById("matches-content");
const featuredEl = document.getElementById("featured");
const fixtureListEl = document.getElementById("fixture-list");
const resultsListEl = document.getElementById("results-list");
const filterButtons = document.querySelectorAll(".filter-btn");

let allMatches = [];
let currentFilter = "all";

// ---------- Helpers ----------
function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-GB", {
    weekday: "short", day: "numeric", month: "short", timeZone: "Europe/London"
  });
}

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString("en-GB", {
    hour: "2-digit", minute: "2-digit", timeZone: "Europe/London"
  });
}

function matchesFilter(match) {
  if (currentFilter === "home") return match.isHome;
  if (currentFilter === "away") return !match.isHome;
  return true;
}

// ---------- The four states ----------
function showLoading() {
  contentEl.hidden = true;
  statusEl.hidden = false;
  statusEl.className = "status status-loading";
  statusEl.innerHTML = '<span class="spinner" aria-hidden="true"></span> Loading matches...';
}

function showError() {
  contentEl.hidden = true;
  statusEl.hidden = false;
  statusEl.className = "status status-error";
  statusEl.innerHTML =
    "<p>Sorry, we couldn't load the matches right now.</p>" +
    '<button type="button" class="btn btn-red" id="retry">Try again</button>';
  document.getElementById("retry").addEventListener("click", init);
}

function showEmpty() {
  contentEl.hidden = true;
  statusEl.hidden = false;
  statusEl.className = "status status-empty";
  statusEl.textContent = "No matches found.";
}

function showSuccess() {
  statusEl.hidden = true;
  contentEl.hidden = false;
}

// ---------- Rendering ----------
function crestImg(team) {
  return team.crest
    ? '<img class="crest-img" src="' + team.crest + '" alt="" loading="lazy">'
    : '<span class="crest">' + team.name.slice(0, 3).toUpperCase() + "</span>";
}

function renderFeatured(match) {
  if (!match) {
    featuredEl.hidden = true;
    return;
  }
  featuredEl.hidden = false;
  featuredEl.innerHTML =
    '<h2 id="featured-title" class="featured-label">Next match | ' + (match.venue || "") + "</h2>" +
    '<div class="featured-teams">' +
      '<div class="team">' + crestImg(match.home) + '<span class="team-name">' + match.home.name + "</span></div>" +
      '<div class="featured-time"><p class="kickoff">' + formatTime(match.date) +
      '</p><p class="kickoff-date">' + formatDate(match.date) + "</p></div>" +
      '<div class="team">' + crestImg(match.away) + '<span class="team-name">' + match.away.name + "</span></div>" +
    "</div>";
}

function renderFixtures(fixtures) {
  if (fixtures.length === 0) {
    fixtureListEl.innerHTML = '<li class="list-empty">No fixtures for this filter.</li>';
    return;
  }
  fixtureListEl.innerHTML = fixtures.map(function (m) {
    return '<li class="fixture"><div class="row">' +
      '<span class="fixture-date">' + formatDate(m.date) + "<br>" + formatTime(m.date) + "</span>" +
      '<span class="fixture-teams">' + m.home.name + "<br>" + m.away.name + "</span>" +
      '<span class="fixture-comp">' + m.competition + "</span>" +
      "</div></li>";
  }).join("");
}

function renderResults(results) {
  if (results.length === 0) {
    resultsListEl.innerHTML = '<li class="list-empty">No results for this filter.</li>';
    return;
  }
  resultsListEl.innerHTML = results.map(function (m) {
    return '<li class="result"><div class="row">' +
      '<span class="fixture-comp">' + formatDate(m.date) + "<br>" + m.competition + "</span>" +
      '<span class="result-teams">' + m.home.name + " <strong>" + m.homeScore + "-" + m.awayScore +
      "</strong> " + m.away.name + "</span>" +
      "</div></li>";
  }).join("");
}

function render() {
  const filtered = allMatches.filter(matchesFilter);
  const upcoming = filtered.filter(function (m) { return m.status !== "FT"; });
  const played = filtered.filter(function (m) { return m.status === "FT"; }).reverse();

  renderFeatured(upcoming[0]);
  renderFixtures(upcoming.slice(1, 6));
  renderResults(played.slice(0, 5));
}

// ---------- Filters ----------
filterButtons.forEach(function (btn) {
  btn.addEventListener("click", function () {
    currentFilter = btn.dataset.filter;
    filterButtons.forEach(function (b) {
      const active = b === btn;
      b.classList.toggle("is-active", active);
      b.setAttribute("aria-pressed", active);
    });
    render();
  });
});

// ---------- Start ----------
async function init() {
  showLoading();
  try {
    allMatches = await getMatches();
    if (allMatches.length === 0) {
      showEmpty();
      return;
    }
    render();
    showSuccess();
  } catch (error) {
    console.error(error);
    showError();
  }
}

init();