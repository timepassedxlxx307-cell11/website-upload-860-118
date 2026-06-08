(function () {
  var video = document.getElementById("movie-video");
  var overlay = document.querySelector(".player-overlay");

  if (!video) {
    return;
  }

  var stream = video.getAttribute("src") || "";
  var prepared = false;
  var engine = null;

  function prepare() {
    if (prepared) {
      return;
    }

    prepared = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = stream;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      video.removeAttribute("src");
      video.load();
      engine = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      engine.loadSource(stream);
      engine.attachMedia(video);
    }
  }

  function start() {
    prepare();
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
    var playTask = video.play();
    if (playTask && typeof playTask.catch === "function") {
      playTask.catch(function () {
        if (overlay) {
          overlay.classList.remove("is-hidden");
        }
      });
    }
  }

  if (overlay) {
    overlay.addEventListener("click", start);
  }

  video.addEventListener("click", function () {
    if (video.paused) {
      start();
    }
  });

  video.addEventListener("play", function () {
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
  });

  video.addEventListener("pause", function () {
    if (overlay && video.currentTime < 0.2) {
      overlay.classList.remove("is-hidden");
    }
  });

  window.addEventListener("pagehide", function () {
    if (engine && typeof engine.destroy === "function") {
      engine.destroy();
    }
  });
})();
