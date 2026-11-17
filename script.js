
/* =================================
   SOUNDORA MUSIC APP
================================= */

const songs = [
  {
    id: 1,
    title: "Song One",
    artist: "SOUNDORA Artist",
    category: "Hindi",
    audio: "songs/song1.mp3"
  },
  {
    id: 2,
    title: "Song Two",
    artist: "SOUNDORA Artist",
    category: "Punjabi",
    audio: "songs/song2.mp3"
  },
  {
    id: 3,
    title: "Song Three",
    artist: "SOUNDORA Artist",
    category: "Haryanvi",
    audio: "songs/song3.mp3"
  },
  {
    id: 4,
    title: "Song Four",
    artist: "SOUNDORA Artist",
    category: "Bhojpuri",
    audio: "songs/song4.mp3"
  }
];

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
    cover.textContent = "♫";

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

/* PLAY SONG */

function playSong(index) {
  if (index < 0 || index >= songs.length) return;

  currentSongIndex = index;

  const song = songs[index];

  document.getElementById("nowPlaying").textContent =
    song.title;

  document.getElementById("playerArtist").textContent =
    song.artist;

  document.getElementById("playerCover").textContent = "♫";

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
    favoriteBtn.classList.remove("is-favorite");
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

/* AUDIO EVENTS */

audio.addEventListener("play", () => {
  playBtn.textContent = "Ⅱ";
  renderSongs();
});

audio.addEventListener("pause", () => {
  playBtn.textContent = "▶";
  renderSongs();
});

audio.addEventListener("ended", nextSong);

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


