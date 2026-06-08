(function () {
  var menuButton = document.querySelector(".mobile-menu-button");
  var mobileNav = document.querySelector(".mobile-nav");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      var open = mobileNav.hasAttribute("hidden");
      if (open) {
        mobileNav.removeAttribute("hidden");
      } else {
        mobileNav.setAttribute("hidden", "");
      }
      menuButton.setAttribute("aria-expanded", String(open));
    });
  }

  document.querySelectorAll(".site-search-form").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      var input = form.querySelector(".site-search-input");
      var value = input ? input.value.trim() : "";
      if (!value) {
        event.preventDefault();
        window.location.href = "search.html";
      }
    });
  });

  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
  var prev = document.querySelector(".hero-prev");
  var next = document.querySelector(".hero-next");
  var active = 0;
  var timer = null;

  function showSlide(index) {
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

  function restartTimer() {
    if (timer) {
      window.clearInterval(timer);
    }
    if (slides.length > 1) {
      timer = window.setInterval(function () {
        showSlide(active + 1);
      }, 5600);
    }
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener("click", function () {
      showSlide(index);
      restartTimer();
    });
  });

  if (prev) {
    prev.addEventListener("click", function () {
      showSlide(active - 1);
      restartTimer();
    });
  }

  if (next) {
    next.addEventListener("click", function () {
      showSlide(active + 1);
      restartTimer();
    });
  }

  showSlide(0);
  restartTimer();

  var params = new URLSearchParams(window.location.search);
  var query = params.get("q") || "";
  var globalInput = document.getElementById("global-search-input");

  if (globalInput && query) {
    globalInput.value = query;
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function applyFilters() {
    var keywordInput = document.querySelector(".movie-filter-input");
    var yearSelect = document.querySelector(".movie-year-select");
    var genreSelect = document.querySelector(".movie-genre-select");
    var keyword = normalize(keywordInput ? keywordInput.value : "");
    var year = normalize(yearSelect ? yearSelect.value : "");
    var genre = normalize(genreSelect ? genreSelect.value : "");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".filterable-grid .movie-card, .filterable-grid .rank-item"));

    cards.forEach(function (card) {
      var haystack = normalize(card.getAttribute("data-keywords"));
      var cardYear = normalize(card.getAttribute("data-year"));
      var cardGenre = normalize(card.getAttribute("data-genre"));
      var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
      var matchedYear = !year || cardYear === year;
      var matchedGenre = !genre || cardGenre === genre;
      card.classList.toggle("is-hidden", !(matchedKeyword && matchedYear && matchedGenre));
    });
  }

  document.querySelectorAll(".movie-filter-input, .movie-year-select, .movie-genre-select").forEach(function (control) {
    control.addEventListener("input", applyFilters);
    control.addEventListener("change", applyFilters);
  });

  applyFilters();
})();
