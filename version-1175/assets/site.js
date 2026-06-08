(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var nav = document.querySelector('.nav-links');

  if (menuButton && nav) {
    menuButton.addEventListener('click', function () {
      var isOpen = nav.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(isOpen));
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var activeSlide = 0;
  var slideTimer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeSlide = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === activeSlide);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === activeSlide);
    });
  }

  function startSlides() {
    if (slides.length < 2) {
      return;
    }

    slideTimer = window.setInterval(function () {
      showSlide(activeSlide + 1);
    }, 5600);
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      window.clearInterval(slideTimer);
      showSlide(index);
      startSlides();
    });
  });

  showSlide(0);
  startSlides();

  var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-search-input]'));
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-value]'));
  var selectedFilter = '';

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function applyCards() {
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    var query = normalize(searchInputs.map(function (input) {
      return input.value;
    }).join(' '));
    var filter = normalize(selectedFilter);
    var visibleCount = 0;

    cards.forEach(function (card) {
      var searchText = normalize(card.getAttribute('data-search'));
      var filterText = normalize(card.getAttribute('data-filter'));
      var matchedQuery = !query || searchText.indexOf(query) !== -1;
      var matchedFilter = !filter || filterText.indexOf(filter) !== -1;
      var shouldShow = matchedQuery && matchedFilter;
      card.style.display = shouldShow ? '' : 'none';
      if (shouldShow) {
        visibleCount += 1;
      }
    });

    Array.prototype.slice.call(document.querySelectorAll('[data-empty-state]')).forEach(function (empty) {
      empty.classList.toggle('visible', cards.length > 0 && visibleCount === 0);
    });
  }

  searchInputs.forEach(function (input) {
    input.addEventListener('input', applyCards);
  });

  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      var value = button.getAttribute('data-filter-value') || '';
      selectedFilter = value === selectedFilter ? '' : value;
      filterButtons.forEach(function (item) {
        item.classList.toggle('active', item.getAttribute('data-filter-value') === selectedFilter && selectedFilter !== '');
      });
      applyCards();
    });
  });

  function attachPlayer(shell) {
    var video = shell.querySelector('video');
    var button = shell.querySelector('[data-play-button]');
    var message = shell.querySelector('[data-player-message]');
    var source = shell.getAttribute('data-stream');
    var hls = null;
    var ready = false;

    function setMessage(value) {
      if (message) {
        message.textContent = value || '';
      }
    }

    function prepareVideo() {
      if (!video || !source || ready) {
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          ready = true;
        });
        hls.on(window.Hls.Events.ERROR, function (eventName, data) {
          if (data && data.fatal) {
            setMessage('播放暂时不可用，请稍后再试');
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        ready = true;
      } else {
        setMessage('播放暂时不可用，请稍后再试');
      }
    }

    function playVideo() {
      prepareVideo();
      if (!video) {
        return;
      }

      var playPromise = video.play();
      shell.classList.add('is-playing');
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          setMessage('点击画面继续播放');
        });
      }
    }

    if (button) {
      button.addEventListener('click', playVideo);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          playVideo();
        } else {
          video.pause();
        }
      });
      video.addEventListener('play', function () {
        shell.classList.add('is-playing');
        setMessage('');
      });
      video.addEventListener('pause', function () {
        shell.classList.remove('is-playing');
      });
    }
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(attachPlayer);
}());
