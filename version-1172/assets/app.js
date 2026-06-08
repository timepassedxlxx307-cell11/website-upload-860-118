(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var nav = document.querySelector('.site-nav');
    if (menuButton && nav) {
        menuButton.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var currentSlide = 0;
    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        currentSlide = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === currentSlide);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === currentSlide);
        });
    }
    dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        });
    });
    if (slides.length > 1) {
        setInterval(function () {
            showSlide(currentSlide + 1);
        }, 6200);
    }

    var pageFilter = document.getElementById('page-filter');
    var yearFilter = document.getElementById('year-filter');
    var regionFilter = document.getElementById('region-filter');
    var pageCards = Array.prototype.slice.call(document.querySelectorAll('.movie-card[data-search]'));
    function applyPageFilter() {
        var keyword = pageFilter ? pageFilter.value.trim().toLowerCase() : '';
        var year = yearFilter ? yearFilter.value : '';
        var region = regionFilter ? regionFilter.value : '';
        pageCards.forEach(function (card) {
            var text = (card.getAttribute('data-search') || '').toLowerCase();
            var cardYear = card.getAttribute('data-year') || '';
            var cardRegion = card.getAttribute('data-region') || '';
            var matched = (!keyword || text.indexOf(keyword) !== -1) && (!year || cardYear === year) && (!region || cardRegion === region);
            card.style.display = matched ? '' : 'none';
        });
    }
    [pageFilter, yearFilter, regionFilter].forEach(function (control) {
        if (control) {
            control.addEventListener('input', applyPageFilter);
            control.addEventListener('change', applyPageFilter);
        }
    });

    var globalInput = document.getElementById('site-search-input');
    var resultsBox = document.getElementById('site-search-results');
    var base = document.body ? (document.body.getAttribute('data-base') || '') : '';
    function closeResults() {
        if (resultsBox) {
            resultsBox.classList.remove('is-open');
        }
    }
    function renderResults(items) {
        if (!resultsBox) {
            return;
        }
        if (!items.length) {
            closeResults();
            return;
        }
        resultsBox.innerHTML = items.slice(0, 12).map(function (item) {
            var href = base + item.url;
            return '<a class="search-result-item" href="' + href + '"><strong>' + escapeHtml(item.title) + '</strong><span>' + escapeHtml(item.meta) + '</span></a>';
        }).join('');
        resultsBox.classList.add('is-open');
    }
    function escapeHtml(value) {
        return String(value).replace(/[&<>"]/g, function (char) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;'
            }[char];
        });
    }
    if (globalInput && resultsBox && typeof movieSearchIndex !== 'undefined') {
        globalInput.addEventListener('input', function () {
            var keyword = globalInput.value.trim().toLowerCase();
            if (!keyword) {
                closeResults();
                return;
            }
            var matches = movieSearchIndex.filter(function (item) {
                return item.text.toLowerCase().indexOf(keyword) !== -1;
            });
            renderResults(matches);
        });
        document.addEventListener('click', function (event) {
            if (!event.target.closest('.site-search-form')) {
                closeResults();
            }
        });
    }
}());
