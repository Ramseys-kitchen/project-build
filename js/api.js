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