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

function startNativeHls(video, streamUrl) {
  video.muted = true;
  video.autoplay = true;
  video.playsInline = true;
  video.src = streamUrl;

  // Safari Mac preferisce che il play avvenga dopo che ha capito cosa deve riprodurre
  video.addEventListener("loadedmetadata", () => {
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch((e) => {
        console.error("Autoplay blocked:", e);
        showError("Autoplay was blocked. Please click play.");
      });
    }
  }, { once: true });

  video.addEventListener("error", () => {
    showError("The live stream could not be loaded.");
  });
}


function startHlsJs(video, streamUrl) {
  const hls = new Hls({
    liveSyncDurationCount: 3,
    liveMaxLatencyDurationCount: 10
  });

  hls.loadSource(streamUrl);
  hls.attachMedia(video);

  hls.on(Hls.Events.MANIFEST_PARSED, function () {
    video.muted = true;
    video.autoplay = true;
    video.playsInline = true;

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        showError("Autoplay was blocked by the browser.");
      });
    }
  });

  hls.on(Hls.Events.ERROR, function (_, data) {
    if (data.fatal) {
      showError("The live stream could not be loaded.");
    }
  });
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

  // Sostituisci i setAttribute con questi:
  video.muted = true;
  video.defaultMuted = true; // Cruciale per Safari Mac
  video.autoplay = true;
  video.playsInline = true;
  
  video.setAttribute("muted", "");
  video.setAttribute("autoplay", "");
  video.setAttribute("playsinline", "");
  video.setAttribute("webkit-playsinline", "");

  if (video.canPlayType("application/vnd.apple.mpegurl")) {
    startNativeHls(video, streamUrl);
  } else if (Hls.isSupported()) {
    startHlsJs(video, streamUrl);
  } else {
    showError("This browser does not support HLS playback.");
  }
}

loadUserPage();
