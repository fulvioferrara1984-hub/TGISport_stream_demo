function getUserId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

function showError(message) {
  const card = document.querySelector(".card");
  const old = document.getElementById("playerError");
  if (old) old.remove();

  const p = document.createElement("p");
  p.id = "playerError";
  p.style.color = "#ffb3b3";
  p.style.marginTop = "12px";
  p.textContent = message;
  card.appendChild(p);
}

function loadUserPage() {
  const userId = getUserId();
  const user = USERS[userId];

  if (!user) {
    document.body.innerHTML = "<h1>User not found</h1>";
    return;
  }

  document.getElementById("userName").textContent = `Welcome, ${user.name}`;
  document.getElementById("userDescription").textContent = user.description;

  const video = document.getElementById("video");
  const streamUrl = user.streamUrl;

  if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = streamUrl;
    video.addEventListener("error", () => {
      showError("The test stream could not be loaded.");
    });
  } else if (Hls.isSupported()) {
    const hls = new Hls();
    hls.loadSource(streamUrl);
    hls.attachMedia(video);

    hls.on(Hls.Events.ERROR, function (_, data) {
      if (data.fatal) {
        showError("The test stream could not be loaded.");
      }
    });
  } else {
    showError("This browser does not support HLS playback.");
  }
}

loadUserPage();
