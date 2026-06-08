(function () {
  var mobileButton = document.querySelector('.mobile-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (mobileButton && mobileNav) {
    mobileButton.addEventListener('click', function () {
      var isOpen = mobileNav.classList.toggle('open');
      mobileButton.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  document.querySelectorAll('.js-search-form').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');
      var value = input ? input.value.trim() : '';
      if (!value) {
        event.preventDefault();
        window.location.href = './search.html';
      }
    });
  });

  var hero = document.querySelector('.hero');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var current = 0;
    var timer = null;

    var showSlide = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    };

    var start = function () {
      if (timer || slides.length < 2) {
        return;
      }
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    };

    var restart = function () {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
      start();
    };

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        restart();
      });
    });

    showSlide(0);
    start();
  }

  var liveSearch = document.querySelector('.js-live-search');
  if (liveSearch) {
    var searchInput = liveSearch.querySelector('input[type="search"]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.searchable-card'));
    var chips = Array.prototype.slice.call(document.querySelectorAll('.filter-chip'));
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    var activeFilter = '';

    var normalize = function (value) {
      return (value || '').toString().trim().toLowerCase();
    };

    var apply = function () {
      var query = normalize(searchInput ? searchInput.value : '');
      cards.forEach(function (card) {
        var text = normalize((card.getAttribute('data-title') || '') + ' ' + (card.getAttribute('data-meta') || ''));
        var matchQuery = !query || text.indexOf(query) !== -1;
        var matchFilter = !activeFilter || text.indexOf(normalize(activeFilter)) !== -1;
        card.classList.toggle('hidden-card', !(matchQuery && matchFilter));
      });
    };

    if (searchInput) {
      searchInput.value = initial;
      searchInput.addEventListener('input', apply);
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (item) {
          item.classList.remove('active');
        });
        var value = chip.getAttribute('data-filter') || '';
        activeFilter = activeFilter === value ? '' : value;
        if (activeFilter) {
          chip.classList.add('active');
        }
        apply();
      });
    });

    apply();
  }

  document.querySelectorAll('.player-shell').forEach(function (shell) {
    var video = shell.querySelector('video');
    var cover = shell.querySelector('.player-cover');
    var button = shell.querySelector('.play-button');
    var streamUrl = shell.getAttribute('data-stream');
    var hlsReady = false;

    if (!video || !streamUrl) {
      return;
    }

    var attach = function () {
      if (hlsReady) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
        hlsReady = true;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          maxBufferLength: 45,
          enableWorker: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hlsReady = true;
        return;
      }
      video.src = streamUrl;
      hlsReady = true;
    };

    var play = function () {
      attach();
      shell.classList.add('is-playing');
      var attempt = video.play();
      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(function () {});
      }
    };

    if (cover) {
      cover.addEventListener('click', play);
    }
    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        play();
      });
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener('play', function () {
      shell.classList.add('is-playing');
    });
  });
})();
