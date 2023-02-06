'use strict';

var load = function(colors) {

    var WORKS = colors.works.length;

    var ABOUT_ID = WORKS;
    var controls = document.querySelectorAll('.controls-item');
    var bgs = document.querySelector('.bgs');
    var full = document.querySelector('.full');
    var ui = document.querySelector('.ui');
    var bgsFull = document.querySelector('.full-bgs');
    var about = document.querySelector('.about');
    var works = document.querySelectorAll('.works-item');
    var worksFull = document.querySelectorAll('.full-info-item');
    var info = document.querySelector('.info');
    var svgNS = 'http://www.w3.org/2000/svg';
    var prevSlideId = null; // used to determine animation diraction
    var lastSlideId = null; // used while switching to 'about' slide
    var slideId = WORKS;
    var z = 0;
    var animationDuration = 300;
    var animationTimeout = null;
    var prevBg = null;

    Array.prototype.forEach.call(controls, function(el) {
        el.addEventListener('click', function() {
            if (animationTimeout !== null) {
                return;
            }
            var activeSlideId = parseInt(this.getAttribute('data-id'), 10);
            if (activeSlideId === slideId) {
                return;
            }
            prevSlideId = slideId;
            slideId = activeSlideId;
            updateSlide(slideId);
        });
    });

    var createBg = function(id, type) {
        var item = document.createElement('div');

        var svgAttrs = {
            version: '1.1',
            baseProfile: 'full',
            preserveAspectRatio: 'none',
            viewBox: '0 0 100 100'
        };
        var upperPathD = 'M0 0 H100 L0 100z';
        var lowerPathD = 'M100 100 V0 L0 100z';

        item.classList.add('bgs-item');

        var upper = document.createElementNS(svgNS, 'svg');
        var lower = document.createElementNS(svgNS, 'svg');
        upper.classList.add('upper');
        lower.classList.add('lower');

        Object.keys(svgAttrs).forEach(function(key) {
            upper.setAttribute(key, svgAttrs[key]);
            lower.setAttribute(key, svgAttrs[key]);
        });

        var upperPath = document.createElementNS(svgNS, 'path');
        upperPath.setAttribute('d', upperPathD);
        upperPath.setAttribute('fill', id === ABOUT_ID ? colors.about.upper : colors.works[id][type].upper);
        upper.appendChild(upperPath);

        var lowerPath = document.createElementNS(svgNS, 'path');
        lowerPath.setAttribute('d', lowerPathD);
        lowerPath.setAttribute('fill', id === ABOUT_ID ? colors.about.lower : colors.works[id][type].lower);
        lower.appendChild(lowerPath);

        item.append(upper);
        item.append(lower);
        return item;
    };

    var updateSlide = function() {
        Array.prototype.forEach.call(controls, function(el) {
            el.classList.remove('active');
        });
        controls[slideId].classList.add('active');

        var activeBg = createBg(slideId, 'preview');

        bgs.appendChild(activeBg);

        activeBg.classList.add('in');

        var outClass = slideId > prevSlideId ? 'up' : 'down';
        var inClass = slideId < prevSlideId ? 'up' : 'down';

        if (prevSlideId !== null) {
            works[prevSlideId].classList.add('out-' + outClass);
            animationTimeout = setTimeout(function() {
                works[prevSlideId].classList.remove('out-up', 'out-down', 'in-up', 'in-down');
                animationTimeout = null;

                if (prevBg !== null) {
                    prevBg.remove();
                }

                prevBg = activeBg;
            }, animationDuration);
        }
        works[slideId].classList.add('in-' + inClass);

        info.style.color = colors.works[slideId].preview.lower;
    };


    var hide = document.querySelector('.hide');
    var activeBgFull = null;
    var activeWork;
    var openingTimeout = null;
    var closingTimeout = null;

    var updateSlideFull = function() {

        activeBgFull = createBg(slideId, 'full');

        bgsFull.appendChild(activeBgFull);

        activeBgFull.classList.add('in');

        openingTimeout = setTimeout(function() {
            openingTimeout = null;
        }, animationDuration);

        activeWork = worksFull[slideId];
        activeWork.classList.add('in-down');
    };

    var handleEsc = function(e) {
        if (e.keyCode === 27) {
            hideFull();
        }
    };

    var showFull = function() {
        if (openingTimeout !== null && closingTimeout !== null) { // second condition is useless
            return;
        }

        full.classList.add('visible');
        document.addEventListener('keydown', handleEsc);
        updateSlideFull();
    };

    var hideFull = function() {
        if (closingTimeout !== null && openingTimeout !== null) { // second condition is useless
            return;
        }
        document.removeEventListener('keydown', handleEsc);
        full.classList.remove('visible');

        activeBgFull.classList.add('out');

        activeWork.classList.add('out-down');
        closingTimeout = setTimeout(function() {
            closingTimeout = null;
            activeWork.classList.remove('out-up', 'out-down', 'in-up', 'in-down');
        }, animationDuration);

        if (slideId === ABOUT_ID) {
            ui.classList.add('visible');
            if (lastSlideId === null) {
                slideId = 0;
                updateSlide();
            } else {
                slideId = lastSlideId;
            }
        }
    };

    info.addEventListener('click', function() {
        showFull();
    });

    hide.addEventListener('click', function() {
        hideFull();
    });

    showFull();

    about.addEventListener('click', function() {
        lastSlideId = slideId;
        slideId = ABOUT_ID;
        showFull();
    });
};

document.addEventListener('DOMContentLoaded', function() {

    var xhr = new XMLHttpRequest();

    xhr.open('GET', './js/colors.json');

    xhr.addEventListener('readystatechange', function() {
        if (xhr.readyState === 4) {
            var colors;

            try {
                colors = JSON.parse(xhr.responseText);
            } catch(e) {
                console.warn('Failed to parse colors.json:', e);
            }

            if (colors) {
                load(colors);
            }
        }

    });

    xhr.send();



});