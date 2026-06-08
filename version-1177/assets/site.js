(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function setupMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".main-nav");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function setupSearchForms() {
    document.querySelectorAll(".site-search").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        if (!input || !input.value.trim()) {
          event.preventDefault();
          return;
        }
      });
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function move(step) {
      show(index + step);
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        move(1);
      }, 5600);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        restart();
      });
    });
    if (prev) {
      prev.addEventListener("click", function () {
        move(-1);
        restart();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        move(1);
        restart();
      });
    }
    show(0);
    restart();
  }

  function setupFiltering() {
    var area = document.querySelector("[data-filter-area]");
    if (!area) {
      return;
    }
    var input = area.querySelector("[data-filter-input]");
    var region = area.querySelector("[data-region-filter]");
    var type = area.querySelector("[data-type-filter]");
    var year = area.querySelector("[data-year-filter]");
    var cards = Array.prototype.slice.call(area.querySelectorAll(".movie-card"));
    var empty = area.querySelector(".no-result");

    function matchSelect(value, candidate) {
      return !value || value === "all" || normalize(candidate).indexOf(normalize(value)) >= 0;
    }

    function matchYear(value, candidate) {
      if (!value || value === "all") {
        return true;
      }
      var y = parseInt(candidate, 10);
      if (Number.isNaN(y)) {
        return false;
      }
      if (value === "2020") {
        return y >= 2020;
      }
      if (value === "2010") {
        return y >= 2010 && y <= 2019;
      }
      if (value === "2000") {
        return y >= 2000 && y <= 2009;
      }
      if (value === "old") {
        return y < 2000;
      }
      return true;
    }

    function apply() {
      var q = normalize(input ? input.value : "");
      var regionValue = region ? region.value : "all";
      var typeValue = type ? type.value : "all";
      var yearValue = year ? year.value : "all";
      var visible = 0;
      cards.forEach(function (card) {
        var text = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.genre,
          card.dataset.tags,
          card.dataset.year
        ].join(" "));
        var ok = (!q || text.indexOf(q) >= 0) &&
          matchSelect(regionValue, card.dataset.region) &&
          matchSelect(typeValue, card.dataset.type) &&
          matchYear(yearValue, card.dataset.year);
        card.style.display = ok ? "" : "none";
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.hidden = visible > 0;
      }
    }

    [input, region, type, year].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });
    apply();
  }

  function setupSearchPage() {
    var mount = document.querySelector("[data-search-results]");
    if (!mount || !window.SITE_MOVIES) {
      return;
    }
    var form = document.querySelector("[data-search-form]");
    var input = document.querySelector("[data-search-input]");
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    if (input) {
      input.value = query;
    }

    function movieCard(movie) {
      return '<a class="movie-card" href="' + escapeHtml(movie.url) + '" data-title="' + escapeHtml(movie.title) + '">' +
        '<span class="poster-frame"><img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy"><span class="poster-year">' + escapeHtml(movie.year) + '</span></span>' +
        '<span class="movie-card-body"><strong>' + escapeHtml(movie.title) + '</strong><span class="movie-meta">' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + '</span><span class="movie-genre">' + escapeHtml(movie.genre) + '</span><span class="movie-desc">' + escapeHtml(movie.oneLine) + '</span></span>' +
        '</a>';
    }

    function render(value) {
      var q = normalize(value);
      var list = window.SITE_MOVIES.filter(function (movie) {
        var text = normalize([movie.title, movie.region, movie.type, movie.genre, movie.tags, movie.year, movie.oneLine].join(" "));
        return !q || text.indexOf(q) >= 0;
      });
      mount.innerHTML = list.slice(0, 240).map(movieCard).join("");
      var empty = document.querySelector("[data-search-empty]");
      if (empty) {
        empty.hidden = list.length > 0;
      }
    }

    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var value = input ? input.value.trim() : "";
        var url = value ? "search.html?q=" + encodeURIComponent(value) : "search.html";
        history.replaceState(null, "", url);
        render(value);
      });
    }
    if (input) {
      input.addEventListener("input", function () {
        render(input.value);
      });
    }
    render(query);
  }

  function initPlayer(videoId, buttonId, overlayId, url) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    var overlay = document.getElementById(overlayId);
    var connected = false;
    var hlsInstance = null;

    if (!video || !url) {
      return;
    }

    function connect() {
      if (connected) {
        return;
      }
      connected = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hlsInstance.loadSource(url);
        hlsInstance.attachMedia(video);
      } else {
        video.src = url;
      }
    }

    function start() {
      connect();
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      var action = video.play();
      if (action && action.catch) {
        action.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener("click", start);
    }
    if (overlay) {
      overlay.addEventListener("click", start);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
    window.addEventListener("pagehide", function () {
      if (hlsInstance && hlsInstance.destroy) {
        hlsInstance.destroy();
      }
    });
  }

  window.initPlayer = initPlayer;

  ready(function () {
    setupMenu();
    setupSearchForms();
    setupHero();
    setupFiltering();
    setupSearchPage();
  });
})();
