const VOTES_KEY = "lfc-poll-votes";
const MY_VOTE_KEY = "lfc-poll-my-vote";

// Starting numbers so the results don't begin at zero (demo values)
const SEED_VOTES = {
  "Alexander Isak": 42,
  "Cody Gakpo": 31,
  "Alexis Mac Allister": 27
};

function load(key) {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch (error) {
    return null;
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    // storage blocked or full, carry on
  }
}

export function initPoll() {
  const form = document.getElementById("poll-form");
  const resultsEl = document.getElementById("poll-results");
  if (!form || !resultsEl) return;

  const voteBtn = form.querySelector(".poll-btn");
  const radios = form.querySelectorAll('input[name="potm"]');

  function animateBars() {
    const fills = resultsEl.querySelectorAll(".poll-bar-fill");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    fills.forEach(function (fill) {
      const target = fill.dataset.percent + "%";
      if (reduceMotion || typeof gsap === "undefined") {
        fill.style.width = target;
      } else {
        gsap.to(fill, { width: target, duration: 1, ease: "power3.out", delay: 0.1 });
      }
    });
  }

  function showResults(votes, myVote) {
    form.hidden = true;
    resultsEl.hidden = false;

    const names = Object.keys(votes);
    const total = names.reduce(function (sum, name) { return sum + votes[name]; }, 0);

    const rows = names.map(function (name) {
      const percent = Math.round((votes[name] / total) * 100);
      const mine = name === myVote;
      return '<div class="poll-row' + (mine ? " is-mine" : "") + '">' +
        '<div class="poll-row-top">' +
          "<span>" + name + (mine ? " (your vote)" : "") + "</span>" +
          "<span>" + percent + "%</span>" +
        "</div>" +
        '<div class="poll-bar" role="img" aria-label="' + name + ": " + percent + ' percent">' +
          '<div class="poll-bar-fill" data-percent="' + percent + '"></div>' +
        "</div>" +
      "</div>";
    });

    resultsEl.innerHTML = rows.join("") +
      '<p class="poll-total">' + total + " votes in total</p>";

    animateBars();
  }

  // Returning visitor who already voted
  const savedVote = load(MY_VOTE_KEY);
  if (savedVote) {
    showResults(load(VOTES_KEY) || SEED_VOTES, savedVote);
    return;
  }

  // Enable the Vote button once an option is chosen
  radios.forEach(function (radio) {
    radio.addEventListener("change", function () {
      voteBtn.disabled = false;
    });
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    const chosen = form.querySelector('input[name="potm"]:checked');
    if (!chosen) return;

    const votes = load(VOTES_KEY) || Object.assign({}, SEED_VOTES);
    votes[chosen.value] = votes[chosen.value] + 1;

    save(VOTES_KEY, votes);
    save(MY_VOTE_KEY, chosen.value);
    showResults(votes, chosen.value);
  });
}