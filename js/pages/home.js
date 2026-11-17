import { getMatches } from "../api.js";

const metaEl = document.getElementById("next-meta");
const teamsEl = document.getElementById("next-teams");

function formatKickoff(iso) {
  const date = new Date(iso).toLocaleDateString("en-GB", {
    weekday: "short", day: "numeric", month: "short", timeZone: "Europe/London"
  });
  const time = new Date(iso).toLocaleTimeString("en-GB", {
    hour: "2-digit", minute: "2-digit", timeZone: "Europe/London"
  });
  return date + ", " + time;
}

async function loadNextMatch() {
  try {
    const matches = await getMatches();
    const next = matches.find(function (m) { return m.status !== "FT"; });

    if (!next) {
      metaEl.textContent = "No upcoming fixtures right now.";
      teamsEl.textContent = "";
      return;
    }

    metaEl.textContent =
      formatKickoff(next.date) + " | " + next.competition + (next.venue ? " | " + next.venue : "");
    teamsEl.innerHTML = next.home.name + " <span>vs</span> " + next.away.name;
  } catch (error) {
    console.error(error);
    metaEl.textContent = "Next match unavailable right now.";
    teamsEl.textContent = "";
  }
}

loadNextMatch();