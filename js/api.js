const API_BASE = "https://www.thesportsdb.com/api/v1/json/123";
const LEAGUE_ID = 4328;
const SEASON = "2026-2027";
const LIVERPOOL_ID = "133602";

// Rounds to load. Change these two numbers to widen or narrow the window.
const ROUND_FROM = 5;
const ROUND_TO = 16;

const CACHE_KEY = "lfc-matches";
const CACHE_MINUTES = 10;

async function fetchRound(round) {
  const response = await fetch(
    API_BASE + "/eventsround.php?id=" + LEAGUE_ID + "&r=" + round + "&s=" + SEASON
  );
  if (!response.ok) {
    throw new Error("Round " + round + " failed with status " + response.status);
  }
  const data = await response.json();
  return data.events || [];
}

// Convert the API's shape into one simple shape our pages use
function normaliseMatch(e) {
  return {
    id: e.idEvent,
    round: Number(e.intRound),
    date: e.strTimestamp ? e.strTimestamp + "Z" : null, // timestamps are UTC
    status: e.strStatus,
    competition: e.strLeague,
    venue: e.strVenue,
    home: { name: e.strHomeTeam, crest: e.strHomeTeamBadge },
    away: { name: e.strAwayTeam, crest: e.strAwayTeamBadge },
    homeScore: e.intHomeScore === null ? null : Number(e.intHomeScore),
    awayScore: e.intAwayScore === null ? null : Number(e.intAwayScore),
    isHome: e.idHomeTeam === LIVERPOOL_ID
  };
}

function readCache() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(CACHE_KEY));
    if (saved && Date.now() - saved.time < CACHE_MINUTES * 60 * 1000) {
      return saved.matches;
    }
  } catch (error) {
    // no cache available, carry on
  }
  return null;
}

function writeCache(matches) {
  try {
    sessionStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ time: Date.now(), matches: matches })
    );
  } catch (error) {
    // storage full or blocked, carry on
  }
}

export async function getMatches() {
  const cached = readCache();
  if (cached) return cached;

  const rounds = [];
  for (let r = ROUND_FROM; r <= ROUND_TO; r++) rounds.push(r);

  const results = await Promise.allSettled(rounds.map(fetchRound));
  const worked = results.filter((r) => r.status === "fulfilled");

  // If every request failed, tell the page so it can show the error state
  if (worked.length === 0) {
    throw new Error("Could not load matches from TheSportsDB");
  }

  const matches = worked
    .flatMap((r) => r.value)
    .filter((e) => e.idHomeTeam === LIVERPOOL_ID || e.idAwayTeam === LIVERPOOL_ID)
    .map(normaliseMatch)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  writeCache(matches);
  return matches;
}

// ---------- Players ----------
const PLAYER_IDS = [
  "34163551", // Alisson Becker
  "34146104", // Freddie Woodman
  "34147021", // Virgil van Dijk
  "34231160", // Jérémy Jacquet
  "34200708", // Milos Kerkez
  "34173797", // Jeremie Frimpong
  "34193286", // Conor Bradley
  "34170358", // Ryan Gravenberch
  "34171965", // Dominik Szoboszlai
  "34170133", // Alexis Mac Allister
  "34173012", // Florian Wirtz
  "34164182", // Cody Gakpo
  "34163447", // Alexander Isak
  "34298316", // Rio Ngumoha
  "34197250", // Bradley Barcola
  "34164505"  // Federico Chiesa
];

const PLAYERS_CACHE_KEY = "lfc-players";

async function fetchPlayer(id) {
  const response = await fetch(API_BASE + "/lookupplayer.php?id=" + id);
  if (!response.ok) {
    throw new Error("Player " + id + " failed with status " + response.status);
  }
  const data = await response.json();
  return data.players ? data.players[0] : null;
}

// Group the API's detailed positions into the four filter groups
function groupPosition(position) {
  const p = (position || "").toLowerCase();
  if (p.includes("goalkeeper")) return "Goalkeeper";
  if (p.includes("back") || p.includes("defender")) return "Defender";
  if (p.includes("midfield")) return "Midfielder";
  return "Forward"; // wingers, forwards, strikers
}

function normalisePlayer(p) {
  return {
    id: p.idPlayer,
    name: p.strPlayer,
    number: p.strNumber ? p.strNumber : "-",
    position: groupPosition(p.strPosition),
    detailedPosition: p.strPosition,
    nationality: p.strNationality,
    image: p.strCutout || p.strThumb || null
  };
}

function readPlayersCache() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(PLAYERS_CACHE_KEY));
    if (saved && Date.now() - saved.time < CACHE_MINUTES * 60 * 1000) {
      return saved.players;
    }
  } catch (error) {
    // no cache available, carry on
  }
  return null;
}

function writePlayersCache(players) {
  try {
    sessionStorage.setItem(
      PLAYERS_CACHE_KEY,
      JSON.stringify({ time: Date.now(), players: players })
    );
  } catch (error) {
    // storage full or blocked, carry on
  }
}

export async function getPlayers() {
  const cached = readPlayersCache();
  if (cached) return cached;

  const results = await Promise.allSettled(PLAYER_IDS.map(fetchPlayer));
  const worked = results.filter(function (r) {
    return r.status === "fulfilled" && r.value;
  });

  // If every request failed, tell the page so it can show the error state
  if (worked.length === 0) {
    throw new Error("Could not load players from TheSportsDB");
  }

  const players = worked
    .map(function (r) { return normalisePlayer(r.value); })
    .sort(function (a, b) { return a.name.localeCompare(b.name); });

  writePlayersCache(players);
  return players;
}