(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function setupMenu() {
    var button = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dots button"));
    if (!slides.length) {
      return;
    }
    var index = 0;
    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
      });
    });
    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function setupFilters() {
    var input = document.querySelector("#searchInput") || document.querySelector(".page-filter");
    if (!input) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    if (query) {
      input.value = query;
    }
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    var notice = document.createElement("div");
    notice.className = "no-results";
    notice.textContent = "没有找到匹配的影片";
    if (cards.length && cards[0].parentNode) {
      cards[0].parentNode.after(notice);
    }
    function apply() {
      var value = normalize(input.value);
      var visible = 0;
      cards.forEach(function (card) {
        var text = normalize((card.getAttribute("data-title") || "") + " " + (card.getAttribute("data-meta") || ""));
        var matched = !value || text.indexOf(value) !== -1;
        card.style.display = matched ? "" : "none";
        if (matched) {
          visible += 1;
        }
      });
      notice.style.display = visible === 0 ? "block" : "none";
    }
    input.addEventListener("input", apply);
    apply();
  }

  function bindPlayer(source) {
    var video = document.getElementById("movieVideo");
    var cover = document.querySelector(".player-cover");
    if (!video || !cover || !source) {
      return;
    }
    var hls = null;
    var started = false;
    function play() {
      cover.classList.add("is-hidden");
      if (!started) {
        started = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
          video.play().catch(function () {});
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
        } else {
          video.src = source;
          video.play().catch(function () {});
        }
      } else {
        video.play().catch(function () {});
      }
    }
    cover.addEventListener("click", play);
    cover.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        play();
      }
    });
    video.addEventListener("play", function () {
      cover.classList.add("is-hidden");
    });
    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  window.setupMoviePlayer = bindPlayer;

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();
