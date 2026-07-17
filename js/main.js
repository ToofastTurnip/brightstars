/* Bright Stars Daycare — scroll reveals + rainbow photo swapper */
(function () {
  "use strict";

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Scroll-in reveals ---------- */
  var revealables = document.querySelectorAll(".reveal, .moment");

  if ("IntersectionObserver" in window && !reducedMotion) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -4% 0px" }
    );
    revealables.forEach(function (el) { io.observe(el); });
  } else {
    revealables.forEach(function (el) { el.classList.add("in-view"); });
  }

  /* ---------- Click-to-swap gallery ---------- */
  var TOTAL_PHOTOS = 18;
  var photoPath = function (n) {
    return "img/photo-" + String(n).padStart(2, "0") + ".jpg";
  };

  var slots = Array.prototype.slice.call(document.querySelectorAll(".photo-swap"));

  // Which photo number each slot currently shows (parsed from initial src)
  var visible = slots.map(function (slot) {
    var m = slot.querySelector("img").src.match(/photo-(\d+)\.jpg/);
    return m ? parseInt(m[1], 10) : 0;
  });

  function pickFresh() {
    var candidates = [];
    for (var n = 1; n <= TOTAL_PHOTOS; n++) {
      if (visible.indexOf(n) === -1) candidates.push(n);
    }
    if (candidates.length === 0) return null;
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  slots.forEach(function (slot, slotIndex) {
    var btn = slot.querySelector(".photo-btn");
    var img = slot.querySelector("img");
    var busy = false;

    btn.addEventListener("click", function () {
      if (busy) return;
      var next = pickFresh();
      if (next === null) return;
      busy = true;

      // Preload the incoming photo so the swap never shows a blank card
      var loader = new Image();
      loader.src = photoPath(next);

      var doSwap = function () {
        visible[slotIndex] = next;
        img.src = photoPath(next);
        slot.classList.remove("swapping-out");
        slot.classList.add("swapping-in");
        window.setTimeout(function () {
          slot.classList.remove("swapping-in");
          busy = false;
        }, reducedMotion ? 0 : 600);
      };

      if (reducedMotion) {
        doSwap();
        return;
      }

      slot.classList.add("swapping-out");
      window.setTimeout(function () {
        if (loader.complete) {
          doSwap();
        } else {
          loader.onload = doSwap;
          loader.onerror = doSwap;
        }
      }, 360);
    });
  });

  /* ---------- Footer year ---------- */
  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
