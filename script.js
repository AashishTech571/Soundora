
const songs = [
  {
    title: "Apna Music 01",
    artist: "SOUNDORA",
    category: "Hindi",
    file: "songs/song1.mp3"
  },
  {
    title: "Apna Music 02",
    artist: "SOUNDORA",
    category: "Punjabi",
    file: "songs/song2.mp3"
  },
  {
    title: "Apna Music 03",
    artist: "SOUNDORA",
    category: "Haryanvi",
    file: "songs/song3.mp3"
  },
  {
    title: "Apna Music 04",
    artist: "SOUNDORA",
    category: "Bhojpuri",
    file: "songs/song4.mp3"
  }
];

const audio = document.getElementById("audioPlayer");
const songList = document.getElementById("songList");
const nowPlaying = document.getElementById("nowPlaying");
const playBtn = document.getElementById("playBtn");
const search = document.getElementById("search");

let currentIndex = -1;
let currentCategory = "All";

function renderSongs() {
  const query = search.value.toLowerCase();

  const filtered = songs
    .map((song, index) => ({ ...song, index }))
    .filter(song => {
      const matchesSearch =
        song.title.toLowerCase().includes(query) ||
        song.artist.toLowerCase().includes(query);

      const matchesCategory =
        currentCategory === "All" ||
        song.category === currentCategory;

      return matchesSearch && matchesCategory;
    });

  songList.innerHTML = "";

  if (filtered.length === 0) {
    songList.innerHTML =
      '<p style="color:#aaa;padding:15px">No songs found.</p>';
    return;
  }

  filtered.forEach(song => {
    const item = document.createElement("div");
    item.className = "song";

    item.innerHTML = `
      <div class="cover">♫</div>
      <div class="details">
        <h3>${song.title}</h3>
        <p>${song.artist} • ${song.category}</p>
      </div>
      <button class="song-play" aria-label="Play song">▶</button>
    `;

    item.querySelector("button").addEventListener("click", () => {
      playSong(song.index);
    });

    item.addEventListener("dblclick", () => {
      playSong(song.index);
    });

    songList.appendChild(item);
  });
}

function playSong(index) {
  currentIndex = index;
  const song = songs[currentIndex];

  audio.src = song.file;
  nowPlaying.textContent = `${song.title} — ${song.artist}`;

  audio.play()
    .then(() => {
      playBtn.textContent = "Ⅱ";
    })
    .catch(() => {
      playBtn.textContent = "▶";
      nowPlaying.textContent =
        `${song.title} — Audio file not found. Add ${song.file}`;
    });
}

function togglePlay() {
  if (currentIndex === -1) {
    playSong(0);
    return;
  }

  if (audio.paused) {
    audio.play()
      .then(() => playBtn.textContent = "Ⅱ")
      .catch(() => {
        nowPlaying.textContent = "Audio file not available.";
      });
  } else {
    audio.pause();
    playBtn.textContent = "▶";
  }
}

function nextSong() {
  if (currentIndex === -1) {
    playSong(0);
    return;
  }

  playSong((currentIndex + 1) % songs.length);
}

function previousSong() {
  if (currentIndex === -1) {
    playSong(0);
    return;
  }

  playSong((currentIndex - 1 + songs.length) % songs.length);
}

audio.addEventListener("ended", nextSong);

audio.addEventListener("pause", () => {
  playBtn.textContent = "▶";
});

audio.addEventListener("play", () => {
  playBtn.textContent = "Ⅱ";
});

search.addEventListener("input", renderSongs);

document.querySelectorAll(".category").forEach(button => {
  button.addEventListener("click", () => {
    const category = button.dataset.category;

    currentCategory =
      currentCategory === category ? "All" : category;

    document.querySelectorAll(".category").forEach(item => {
      item.classList.toggle(
        "selected",
        item.dataset.category === currentCategory
      );
    });

    renderSongs();
  });
});

renderSongs();

window.playSong = playSong;
window.togglePlay = togglePlay;
window.nextSong = nextSong;
window.previousSong = previousSong;

// SOUNDORA PREMIUM PLAYER

let favorites = [];

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return "0:00";

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  return `${mins}:${String(secs).padStart(2, "0")}`;
}

function toggleFavorite() {
  if (currentIndex === -1) return;

  const song = songs[currentIndex];
  const index = favorites.indexOf(song.title);

  if (index === -1) {
    favorites.push(song.title);
  } else {
    favorites.splice(index, 1);
  }

  document.getElementById("favoriteBtn").textContent =
    favorites.includes(song.title) ? "♥" : "♡";
}

function showFavorites() {
  const list = songs.filter(song =>
    favorites.includes(song.title)
  );

  songList.innerHTML = "";

  if (list.length === 0) {
    songList.innerHTML =
      '<p style="padding:15px;color:#aaa">No favourite songs yet ❤️</p>';
    return;
  }

  list.forEach(song => {
    const index = songs.indexOf(song);

    const item = document.createElement("div");
    item.className = "song";

    item.innerHTML = `
      <div class="cover">♥</div>
      <div class="details">
        <h3>${song.title}</h3>
        <p>${song.artist}</p>
      </div>
      <button>▶</button>
    `;

    item.querySelector("button").onclick = () => playSong(index);
    songList.appendChild(item);
  });
}

audio.addEventListener("loadedmetadata", () => {
  document.getElementById("duration").textContent =
    formatTime(audio.duration);
});

audio.addEventListener("timeupdate", () => {
  const progress = audio.duration
    ? (audio.currentTime / audio.duration) * 100
    : 0;

  document.getElementById("progressBar").value = progress;

  document.getElementById("currentTime").textContent =
    formatTime(audio.currentTime);
});

document.getElementById("progressBar").addEventListener("input", e => {
  if (Number.isFinite(audio.duration)) {
    audio.currentTime =
      (e.target.value / 100) * audio.duration;
  }
});

const originalPlaySong = playSong;

playSong = function(index) {
  originalPlaySong(index);

  const song = songs[index];

  document.getElementById("playerArtist").textContent =
    song.artist;

  document.getElementById("favoriteBtn").textContent =
    favorites.includes(song.title) ? "♥" : "♡";

  document.getElementById("playerCover").textContent = "♫";
};

window.playSong = playSong;
window.toggleFavorite = toggleFavorite;
window.showFavorites = showFavorites;

