(function () {
  function each(list, callback) {
    Array.prototype.forEach.call(list, callback);
  }

  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = hero.querySelectorAll('[data-hero-slide]');
    var dots = hero.querySelectorAll('[data-hero-dot]');
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      each(slides, function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      each(dots, function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    each(dots, function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initSearch() {
    each(document.querySelectorAll('[data-search-scope]'), function (panel) {
      var section = panel.parentElement;
      if (!section) {
        return;
      }
      var input = panel.querySelector('.movie-search');
      var category = panel.querySelector('.movie-category-filter');
      var cards = section.querySelectorAll('[data-movie-card]');

      function normalize(value) {
        return String(value || '').toLowerCase().trim();
      }

      function apply() {
        var query = normalize(input ? input.value : '');
        var cat = category ? category.value : '';
        each(cards, function (card) {
          var haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-year'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-tags')
          ].join(' '));
          var matchedQuery = !query || haystack.indexOf(query) !== -1;
          var matchedCategory = !cat || card.getAttribute('data-category') === cat;
          card.classList.toggle('is-hidden', !(matchedQuery && matchedCategory));
        });
      }

      if (input) {
        input.addEventListener('input', apply);
      }
      if (category) {
        category.addEventListener('change', apply);
      }
      apply();
    });
  }

  window.initMoviePlayer = function (videoId, buttonId, overlayId, source) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    var overlay = document.getElementById(overlayId);
    if (!video || !source) {
      return;
    }
    var attached = false;
    var hlsInstance = null;

    function hideOverlay() {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    }

    function playVideo() {
      hideOverlay();
      var result = video.play();
      if (result && typeof result.catch === 'function') {
        result.catch(function () {});
      }
    }

    function attachSource() {
      if (attached) {
        playVideo();
        return;
      }
      attached = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.addEventListener('loadedmetadata', playVideo, { once: true });
        playVideo();
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
        return;
      }
      video.src = source;
      playVideo();
    }

    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        attachSource();
      });
    }

    if (overlay) {
      overlay.addEventListener('click', function (event) {
        event.preventDefault();
        attachSource();
      });
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        attachSource();
      }
    });

    video.addEventListener('play', hideOverlay);
    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
    });
  };

  ready(function () {
    initMenu();
    initHero();
    initSearch();
  });
})();
