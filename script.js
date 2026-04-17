function getUserId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
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
  } else if (Hls.isSupported()) {
    const hls = new Hls();
    hls.loadSource(streamUrl);
    hls.attachMedia(video);
  } else {
    alert("This browser does not support HLS playback.");
  }
}

loadUserPage();
