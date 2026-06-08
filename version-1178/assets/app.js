function ready(callback) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback);
  } else {
    callback();
  }
}

function initMobileMenu() {
  const button = document.querySelector("[data-menu-toggle]");
  const panel = document.querySelector("[data-mobile-panel]");
  if (!button || !panel) {
    return;
  }
  button.addEventListener("click", () => {
    panel.classList.toggle("is-open");
  });
}

function initHeroSliders() {
  document.querySelectorAll("[data-hero-slider]").forEach((slider) => {
    const slides = Array.from(slider.querySelectorAll(".hero-slide"));
    const dots = Array.from(slider.querySelectorAll("[data-hero-dot]"));
    const nextButton = slider.querySelector("[data-hero-next]");
    const prevButton = slider.querySelector("[data-hero-prev]");
    if (slides.length === 0) {
      return;
    }
    let current = 0;
    let timer = null;

    const show = (index) => {
      current = (index + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    };

    const next = () => show(current + 1);
    const prev = () => show(current - 1);
    const start = () => {
      stop();
      timer = window.setInterval(next, 5000);
    };
    const stop = () => {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    };

    dots.forEach((dot) => {
      dot.addEventListener("click", () => {
        show(Number(dot.dataset.heroDot || 0));
        start();
      });
    });
    if (nextButton) {
      nextButton.addEventListener("click", () => {
        next();
        start();
      });
    }
    if (prevButton) {
      prevButton.addEventListener("click", () => {
        prev();
        start();
      });
    }
    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    start();
  });
}

function initFilters() {
  document.querySelectorAll("[data-filter-form]").forEach((form) => {
    const target = document.querySelector(form.dataset.target || "");
    if (!target) {
      return;
    }
    const queryInput = form.querySelector("[data-filter-query]");
    const yearSelect = form.querySelector("[data-filter-year]");
    const typeSelect = form.querySelector("[data-filter-type]");
    const cards = Array.from(target.querySelectorAll("[data-filter-card]"));

    const apply = () => {
      const query = (queryInput?.value || "").trim().toLowerCase();
      const year = yearSelect?.value || "";
      const type = typeSelect?.value || "";
      cards.forEach((card) => {
        const haystack = [card.dataset.title, card.dataset.region, card.dataset.type, card.dataset.tags, card.dataset.year]
          .join(" ")
          .toLowerCase();
        const matchesQuery = !query || haystack.includes(query);
        const matchesYear = !year || card.dataset.year === year;
        const matchesType = !type || card.dataset.type === type;
        card.hidden = !(matchesQuery && matchesYear && matchesType);
      });
    };

    form.addEventListener("input", apply);
    form.addEventListener("change", apply);
    form.addEventListener("submit", (event) => event.preventDefault());
  });
}

let hlsPromise = null;

async function getHls() {
  if (!hlsPromise) {
    hlsPromise = import("./hls-vendor.js");
  }
  return hlsPromise;
}

export function initMoviePlayer(options) {
  const video = document.getElementById(options.videoId);
  const button = document.getElementById(options.buttonId);
  const url = options.url;
  if (!video || !button || !url) {
    return;
  }

  let attached = false;
  let started = false;

  const attach = async () => {
    if (attached) {
      return;
    }
    attached = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
      return;
    }
    const module = await getHls();
    const Hls = module.H;
    if (Hls && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(url);
      hls.attachMedia(video);
    } else {
      video.src = url;
    }
  };

  const start = () => {
    started = true;
    video.setAttribute("controls", "controls");
    button.classList.add("is-hidden");
    attach().then(() => {
      const playRequest = video.play();
      if (playRequest && typeof playRequest.catch === "function") {
        playRequest.catch(() => {
          button.classList.remove("is-hidden");
        });
      }
    });
  };

  attach();
  button.addEventListener("click", start);
  video.addEventListener("click", () => {
    if (video.paused) {
      start();
    } else {
      video.pause();
    }
  });
  video.addEventListener("play", () => {
    button.classList.add("is-hidden");
  });
  video.addEventListener("pause", () => {
    if (started && video.currentTime === 0) {
      button.classList.remove("is-hidden");
    }
  });
  video.addEventListener("ended", () => {
    started = false;
    button.classList.remove("is-hidden");
  });
}

function movieCard(movie) {
  return `
<article class="movie-card">
  <a href="./${movie.file}" class="movie-card-link">
    <div class="poster-frame">
      <img src="${movie.cover}" alt="${movie.title}" loading="lazy">
      <span class="year-badge">${movie.year}</span>
      <span class="play-badge">▶</span>
    </div>
    <div class="movie-card-body">
      <h3>${movie.title}</h3>
      <p>${movie.region} · ${movie.type}</p>
    </div>
  </a>
</article>`;
}

export function initSearchPage(movies) {
  const form = document.querySelector("[data-search-form]");
  const input = document.querySelector("[data-search-input]");
  const results = document.querySelector("[data-search-results]");
  const title = document.querySelector("[data-search-title]");
  if (!form || !input || !results || !title) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  input.value = params.get("q") || "";

  const render = () => {
    const query = input.value.trim().toLowerCase();
    const list = movies.filter((movie) => {
      if (!query) {
        return movie.hot;
      }
      return [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags]
        .join(" ")
        .toLowerCase()
        .includes(query);
    }).slice(0, 120);
    title.textContent = query ? "搜索结果" : "热门内容";
    results.innerHTML = list.map(movieCard).join("");
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (input.value.trim()) {
      params.set("q", input.value.trim());
    }
    const nextUrl = params.toString() ? `./search.html?${params.toString()}` : "./search.html";
    window.history.replaceState(null, "", nextUrl);
    render();
  });
  input.addEventListener("input", render);
  render();
}

ready(() => {
  initMobileMenu();
  initHeroSliders();
  initFilters();
});
