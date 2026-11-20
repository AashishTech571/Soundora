/* SOUNDORA GUEST ID SYSTEM */

(function () {
  const storageKey = "soundora_guest_id";

  let guestId = localStorage.getItem(storageKey);

  if (!guestId) {
    guestId = "GUEST-" + crypto.randomUUID()
      .replace(/-/g, "")
      .slice(0, 10)
      .toUpperCase();

    localStorage.setItem(storageKey, guestId);
  }

  window.SOUNDORA_GUEST_ID = guestId;

  console.log("SOUNDORA Guest ID:", guestId);
})();
/* GUEST PROFILE DISPLAY */

const profileGuestId = document.getElementById("guestIdDisplay");
const profileCopyBtn = document.getElementById("copyGuestId");

if (profileGuestId && window.SOUNDORA_GUEST_ID) {
  profileGuestId.textContent = window.SOUNDORA_GUEST_ID;
}

if (profileCopyBtn) {
  profileCopyBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(window.SOUNDORA_GUEST_ID);
      profileCopyBtn.textContent = "Copied!";
    } catch (error) {
      console.error("Copy error:", error);
      profileCopyBtn.textContent = "Copy Failed";
    }
  });
}
/* SOUNDORA SUPABASE CONNECTION */

const SUPABASE_URL = "https://muxjlljrdhkpvtdxikmp.supabase.co";

const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_zgHfqi6cJ7PDwJeKNJbl3g_gaUhGIcH";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

console.log("SOUNDORA Supabase Connected!");
/* LOAD SONGS FROM SUPABASE */

async function loadSongsFromSupabase() {
  const { data, error } = await supabaseClient
    .from("songs")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Songs loading error:", error.message);
    return;
  }

  songs = data.map(song => ({
    id: song.id,
    title: song.title,
    artist: song.artist,
    category: song.category,
    audio: song.audio_url,
    cover: song.cover_url
  }));

  currentSongIndex = -1;

  renderSongs();

  console.log("SOUNDORA Songs Loaded:", songs);
}

loadSongsFromSupabase();
/* =================================
   SOUNDORA MUSIC APP
================================= */

/* SONGS DATABASE */

let songs = [];


const audio = document.getElementById("audioPlayer");
const songList = document.getElementById("songList");
const searchInput = document.getElementById("search");
const playBtn = document.getElementById("playBtn");
const favoriteBtn = document.getElementById("favoriteBtn");
const playerMessage = document.getElementById("playerMessage");

let currentSongIndex = -1;
let currentCategory = "All";
let showingFavorites = false;

let favorites = JSON.parse(
  localStorage.getItem("soundoraFavorites") || "[]"
);
let isShuffle = false;
let repeatMode = "off";
function saveFavorites() {
  localStorage.setItem(
    "soundoraFavorites",
    JSON.stringify(favorites)
  );
}

function showMessage(message) {
  playerMessage.textContent = message;
}

/* SONG LIST */

function renderSongs() {
  songList.innerHTML = "";

  const searchText = searchInput.value.toLowerCase().trim();

  let filteredSongs = songs.filter(song => {
    const matchesSearch =
      song.title.toLowerCase().includes(searchText) ||
      song.artist.toLowerCase().includes(searchText) ||
      song.category.toLowerCase().includes(searchText);

    const matchesCategory =
      currentCategory === "All" ||
      song.category === currentCategory;

    const matchesFavorites =
      !showingFavorites || favorites.includes(song.id);

    return matchesSearch && matchesCategory && matchesFavorites;
  });

  document.getElementById("songCount").textContent =
    `${filteredSongs.length} SONGS`;

  document.getElementById("emptyMessage").hidden =
    filteredSongs.length !== 0;

  filteredSongs.forEach(song => {
    const card = document.createElement("div");
    card.className = "song-item";

  const cover = document.createElement("div");
cover.className = "song-art";

if (song.cover) {
  const img = document.createElement("img");

  img.src = song.cover;
  img.alt = song.title + " cover";
  img.loading = "lazy";

  img.onerror = () => {
    img.remove();
    cover.textContent = "♫";
  };

  cover.appendChild(img);
} else {
  cover.textContent = "♫";
}
    const info = document.createElement("div");
    info.className = "song-info";

    const title = document.createElement("strong");
    title.textContent = song.title;

    const artist = document.createElement("span");
    artist.textContent = `${song.artist} • ${song.category}`;

    info.append(title, artist);

    const button = document.createElement("button");
    button.className = "song-play";
    button.textContent =
      currentSongIndex === songs.indexOf(song) &&
      !audio.paused ? "Ⅱ" : "▶";

    button.setAttribute("aria-label", `Play ${song.title}`);

    button.addEventListener("click", () => {
      const index = songs.indexOf(song);

      if (currentSongIndex === index && !audio.paused) {
        audio.pause();
      } else {
        playSong(index);
      }
    });

    card.append(cover, info, button);

    card.addEventListener("click", event => {
      if (event.target !== button) {
        playSong(songs.indexOf(song));
      }
    });

    songList.appendChild(card);
  });
}
/* SEARCH SYSTEM */

searchInput.addEventListener("input", () => {
  renderSongs();
});

/* PLAY SONG */

function playSong(index) {
  if (index < 0 || index >= songs.length) return;

  currentSongIndex = index;

  const song = songs[index];

  document.getElementById("nowPlaying").textContent =
    song.title;

  document.getElementById("playerArtist").textContent =
    song.artist;

  const playerCover = document.getElementById("playerCover");

playerCover.innerHTML = "";

if (song.cover) {
  const img = document.createElement("img");

  img.src = song.cover;
  img.alt = song.title + " cover";

  img.onerror = () => {
    playerCover.textContent = "♫";
  };

  playerCover.appendChild(img);
} else {
  playerCover.textContent = "♫";
}

  updateFavoriteButton();

  audio.pause();
  audio.src = song.audio;
  audio.load();

  playBtn.textContent = "▶";
  showMessage("Checking audio file...");

  audio.play()
    .then(() => {
      playBtn.textContent = "Ⅱ";
      showMessage("");
      renderSongs();
    })
    .catch(() => {
      playBtn.textContent = "▶";
      showMessage("Audio file not available yet. Admin Panel se upload karna hoga.");
      renderSongs();
    });

  renderSongs();
}

/* PLAY / PAUSE */

function togglePlay() {
  if (currentSongIndex === -1) {
    showMessage("Please select a song first.");
    return;
  }

  if (audio.paused) {
    audio.play()
      .then(() => {
        playBtn.textContent = "Ⅱ";
        showMessage("");
      })
      .catch(() => {
        showMessage("Audio file not available yet.");
      });
  } else {
    audio.pause();
  }
}

/* NEXT / PREVIOUS */

function nextSong() {
  if (currentSongIndex === -1) {
    playSong(0);
    return;
  }

  playSong((currentSongIndex + 1) % songs.length);
}

function previousSong() {
  if (currentSongIndex === -1) {
    playSong(0);
    return;
  }

  playSong(
    (currentSongIndex - 1 + songs.length) % songs.length
  );
}

/* FAVORITES */

function updateFavoriteButton() {
  if (currentSongIndex === -1) {
    favoriteBtn.textContent = "♡";
    return;
  }

  const songId = songs[currentSongIndex].id;
  const isFavorite = favorites.includes(songId);

  favoriteBtn.textContent = isFavorite ? "♥" : "♡";
  favoriteBtn.classList.toggle("is-favorite", isFavorite);
}

function toggleFavorite() {
  if (currentSongIndex === -1) {
    showMessage("Choose a song first.");
    return;
  }

  const songId = songs[currentSongIndex].id;

  if (favorites.includes(songId)) {
    favorites = favorites.filter(id => id !== songId);
    showMessage("Removed from Favorites");
  } else {
    favorites.push(songId);
    showMessage("Added to Favorites ♥");
  }

  saveFavorites();
  updateFavoriteButton();
  renderSongs();
}

favoriteBtn.addEventListener("click", toggleFavorite);

/* CATEGORIES */

document.querySelectorAll(".category").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".category").forEach(item => {
      item.classList.remove("active");
    });

    button.classList.add("active");
    currentCategory = button.dataset.category;
    showingFavorites = false;

    setActiveNav("homeNav");
    document.getElementById("listTitle").textContent =
      currentCategory === "All"
        ? "Trending Music"
        : `${currentCategory} Music`;

    renderSongs();
  });
});

/* SEARCH */

searchInput.addEventListener("input", renderSongs);

document.getElementById("searchNav").addEventListener("click", () => {
  searchInput.focus();
  setActiveNav("searchNav");
});

/* LIBRARY */

function showFavorites() {
  showingFavorites = true;
  currentCategory = "All";

  document.querySelectorAll(".category").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.category === "All"
    );
  });

  document.getElementById("listTitle").textContent =
    "Your Favorites";

  document.getElementById("listEyebrow").textContent =
    "YOUR PERSONAL COLLECTION";

  setActiveNav("libraryNav");
  renderSongs();
}

document.getElementById("libraryNav").addEventListener(
  "click",
  showFavorites
);

/* HOME */

function setActiveNav(id) {
  document.querySelectorAll(".nav-item").forEach(button => {
    button.classList.remove("active");
  });

  document.getElementById(id).classList.add("active");
}

document.getElementById("homeNav").addEventListener("click", () => {
  showingFavorites = false;
  currentCategory = "All";
  searchInput.value = "";

  document.querySelectorAll(".category").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.category === "All"
    );
  });

  document.getElementById("listTitle").textContent =
    "Trending Music";

  document.getElementById("listEyebrow").textContent =
    "MADE FOR YOUR MOOD";

  setActiveNav("homeNav");
  renderSongs();
});

/* PLAYER CONTROLS */

playBtn.addEventListener("click", togglePlay);

document.getElementById("nextBtn").addEventListener(
  "click",
  nextSong
);

document.getElementById("previousBtn").addEventListener(
  "click",
  previousSong
);
/* SHUFFLE */

const shuffleBtn = document.getElementById("shuffleBtn");

shuffleBtn.addEventListener("click", () => {
  isShuffle = !isShuffle;

  shuffleBtn.classList.toggle("active", isShuffle);

  showMessage(
    isShuffle ? "Shuffle ON" : "Shuffle OFF"
  );
});

/* REPEAT */

const repeatBtn = document.getElementById("repeatBtn");

repeatBtn.addEventListener("click", () => {
  if (repeatMode === "off") {
    repeatMode = "all";
  } else if (repeatMode === "all") {
    repeatMode = "one";
  } else {
    repeatMode = "off";
  }

  repeatBtn.classList.toggle("active", repeatMode !== "off");

  showMessage("Repeat: " + repeatMode.toUpperCase());
});
/* AUDIO EVENTS */

audio.addEventListener("play", () => {
  playBtn.textContent = "Ⅱ";
  renderSongs();
});

audio.addEventListener("pause", () => {
  playBtn.textContent = "▶";
  renderSongs();
});

audio.addEventListener("ended", () => {
  if (repeatMode === "one") {
    audio.currentTime = 0;
    audio.play();
  } else {
    nextSong();
  }
});

audio.addEventListener("error", () => {
  playBtn.textContent = "▶";
  showMessage("Audio file not found. Songs will be added later.");
});

audio.addEventListener("loadedmetadata", () => {
  document.getElementById("duration").textContent =
    formatTime(audio.duration);
});

audio.addEventListener("timeupdate", () => {
  if (!audio.duration) return;

  document.getElementById("progressBar").value =
    (audio.currentTime / audio.duration) * 100;

  document.getElementById("currentTime").textContent =
    formatTime(audio.currentTime);
});

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return "0:00";

  const minutes = Math.floor(seconds / 60);
  const remaining = Math.floor(seconds % 60);

  return `${minutes}:${String(remaining).padStart(2, "0")}`;
}

/* SEEK AND VOLUME */

document.getElementById("progressBar").addEventListener(
  "input",
  event => {
    if (audio.duration) {
      audio.currentTime =
        (Number(event.target.value) / 100) * audio.duration;
    }
  }
);

document.getElementById("volumeControl").addEventListener(
  "input",
  event => {
    audio.volume = Number(event.target.value);
  }
);

/* INITIAL SETUP */

audio.volume = 0.8;
renderSongs();
updateFavoriteButton();
/* SHUFFLE & REPEAT ACTIVE EFFECT */



/* SOUNDORA SPLASH SCREEN */

window.addEventListener("load", () => {
  setTimeout(() => {
    const splash = document.getElementById("splashScreen");

    if (splash) {
      splash.classList.add("hide");

      setTimeout(() => {
        splash.remove();
      }, 900);
    }
  }, 1200);
});
/* GUEST PROFILE DISPLAY */

const profileGuestId = document.getElementById("guestIdDisplay");
const profileCopyBtn = document.getElementById("copyGuestId");

if (profileGuestId) {
  profileGuestId.textContent = window.SOUNDORA_GUEST_ID;
}

if (profileCopyBtn) {
  profileCopyBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(window.SOUNDORA_GUEST_ID);
      profileCopyBtn.textContent = "Copied!";
    } catch (error) {
      profileCopyBtn.textContent = "Copy failed";
    }
  });
}
/* PROFILE PAGE NAVIGATION */

const profilePage = document.getElementById("profilePage");
const profileNav = document.getElementById("profileNav");
const homeNav = document.getElementById("homeNav");

function showHomePage() {
  document.querySelectorAll(".main-content").forEach(section => {
    section.style.display = "";
  });

  if (profilePage) {
    profilePage.hidden = true;
    profilePage.style.display = "none";
  }

  document.querySelectorAll(".nav-item").forEach(btn => {
    btn.classList.remove("active");
  });

  if (homeNav) homeNav.classList.add("active");
}

function showProfilePage() {
  document.querySelectorAll(".main-content").forEach(section => {
    section.style.display = "none";
  });

  if (profilePage) {
    profilePage.hidden = false;
    profilePage.style.display = "block";
  }

  document.querySelectorAll(".nav-item").forEach(btn => {
    btn.classList.remove("active");
  });

  if (profileNav) profileNav.classList.add("active");
}

if (profileNav) {
  profileNav.addEventListener("click", showProfilePage);
}

if (homeNav) {
  homeNav.addEventListener("click", showHomePage);
}
