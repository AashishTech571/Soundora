
const songs = [
  {name: "Dreams", icon: "🎵", url: ""},
  {name: "Midnight Vibes", icon: "🌙", url: ""},
  {name: "Lost in Music", icon: "🎼", url: ""},
  {name: "Love Beats", icon: "💜", url: ""}
];

const audio = document.getElementById("audioPlayer");
let currentIndex = 0;

function renderSongs(list = songs) {
  document.getElementById("songList").innerHTML =
    list.map(song => `
      <div class="song">
        <div class="cover">${song.icon}</div>
        <div class="details">
          <h3>${song.name}</h3>
          <p>Soundora Artist</p>
        </div>
        <button onclick="playSong('${song.name}')">▶</button>
      </div>
    `).join("");
}

function playSong(name) {
  currentIndex = songs.findIndex(s => s.name === name);
  const song = songs[currentIndex];

  if (!song.url) {
    document.getElementById("nowPlaying").innerText =
      name + " - Audio coming soon";
    return;
  }

  audio.src = song.url;
  audio.play();
  document.getElementById("nowPlaying").innerText = name;
}

function togglePlay() {
  if (audio.paused) {
    if (!audio.src) {
      playSong(songs[currentIndex].name);
    } else {
      audio.play();
    }
  } else {
    audio.pause();
  }
}

function nextSong() {
  currentIndex = (currentIndex + 1) % songs.length;
  playSong(songs[currentIndex].name);
}

function previousSong() {
  currentIndex =
    (currentIndex - 1 + songs.length) % songs.length;
  playSong(songs[currentIndex].name);
}

document.getElementById("search").addEventListener("input", e => {
  const query = e.target.value.toLowerCase();
  renderSongs(songs.filter(s => s.name.toLowerCase().includes(query)));
});

audio.addEventListener("play", () => {
  document.getElementById("playBtn").innerText = "⏸";
});

audio.addEventListener("pause", () => {
  document.getElementById("playBtn").innerText = "▶";
});

audio.addEventListener("ended", nextSong);

renderSongs();
