(function () {
  function onReady(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var prev = document.querySelector("[data-hero-prev]");
    var next = document.querySelector("[data-hero-next]");
    var active = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === active);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(active - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(active + 1);
        start();
      });
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });
    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function normalize(value) {
    return (value || "").toString().toLowerCase().trim();
  }

  function setupSearchForms() {
    var forms = Array.prototype.slice.call(document.querySelectorAll("[data-site-search]"));
    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        if (!input || !input.value.trim()) {
          event.preventDefault();
          return;
        }
        if (document.body.classList.contains("page-search")) {
          event.preventDefault();
          var pageInput = document.querySelector("[data-page-filter]");
          if (pageInput) {
            pageInput.value = input.value.trim();
            pageInput.dispatchEvent(new Event("input"));
            history.replaceState(null, "", "search.html?q=" + encodeURIComponent(input.value.trim()));
          }
        }
      });
    });
  }

  function setupFilters() {
    var input = document.querySelector("[data-page-filter]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-filter-text]"));
    var select = document.querySelector("[data-year-filter]");
    var chips = Array.prototype.slice.call(document.querySelectorAll("[data-filter-chip]"));
    var empty = document.querySelector("[data-empty-state]");
    if (!cards.length) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    var chipValue = "";
    if (input && query) {
      input.value = query;
    }

    function apply() {
      var keyword = normalize(input ? input.value : "");
      var year = select ? select.value : "";
      var visible = 0;
      cards.forEach(function (card) {
        var text = normalize(card.getAttribute("data-filter-text"));
        var cardYear = card.getAttribute("data-year") || "";
        var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchedYear = !year || cardYear === year;
        var matchedChip = !chipValue || text.indexOf(normalize(chipValue)) !== -1;
        var matched = matchedKeyword && matchedYear && matchedChip;
        card.style.display = matched ? "" : "none";
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    if (input) {
      input.addEventListener("input", apply);
    }
    if (select) {
      select.addEventListener("change", apply);
    }
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        var value = chip.getAttribute("data-filter-chip") || "";
        chipValue = chipValue === value ? "" : value;
        chips.forEach(function (item) {
          item.classList.toggle("is-active", item === chip && chipValue);
        });
        apply();
      });
    });
    apply();
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-hls]"));
    players.forEach(function (player) {
      var video = player.querySelector("video");
      var overlay = player.querySelector(".play-overlay");
      var streamUrl = player.getAttribute("data-hls");
      var hlsInstance = null;
      if (!video || !streamUrl) {
        return;
      }

      function attachStream() {
        if (video.getAttribute("data-ready") === "1") {
          return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(streamUrl);
          hlsInstance.attachMedia(video);
        } else {
          video.src = streamUrl;
        }
        video.setAttribute("data-ready", "1");
      }

      function startPlayback() {
        attachStream();
        player.classList.add("is-playing");
        if (overlay) {
          overlay.hidden = true;
        }
        video.controls = true;
        var playTask = video.play();
        if (playTask && typeof playTask.catch === "function") {
          playTask.catch(function () {
            video.controls = true;
          });
        }
      }

      if (overlay) {
        overlay.addEventListener("click", startPlayback);
      }
      video.addEventListener("click", function () {
        if (video.paused) {
          startPlayback();
        }
      });
      video.addEventListener("play", function () {
        player.classList.add("is-playing");
        if (overlay) {
          overlay.hidden = true;
        }
      });
      window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  onReady(function () {
    setupMenu();
    setupHero();
    setupSearchForms();
    setupFilters();
    setupPlayers();
  });
})();
