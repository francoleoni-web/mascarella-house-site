/* Player for the instruction-video pages.
   Cards are plain <button>s carrying data-src/data-label; clicking one
   loads it into a single shared <video> inside the overlay. Keeping one
   video element means only the clip the guest asked for is ever fetched. */
(function () {
  "use strict";

  var modal = document.getElementById("vmodal");
  var video = document.getElementById("vplayer");
  var closeBtn = document.getElementById("vclose");
  var fallback = document.getElementById("vfallback");
  if (!modal || !video) return;

  var lastFocused = null;

  function open(src, label) {
    lastFocused = document.activeElement;
    video.src = src;
    video.setAttribute("aria-label", label || "");
    if (fallback) fallback.href = src;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    // Autoplay can be refused (iOS low-power mode, data saver); the native
    // controls are visible either way, so a rejected promise is harmless.
    var p = video.play();
    if (p && typeof p.catch === "function") p.catch(function () {});
    if (closeBtn) closeBtn.focus();
  }

  function close() {
    video.pause();
    // Drop the source so a half-buffered clip stops downloading in the
    // background — guests are often on mobile data.
    video.removeAttribute("src");
    video.load();
    modal.hidden = true;
    document.body.style.overflow = "";
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  Array.prototype.forEach.call(
    document.querySelectorAll("[data-video]"),
    function (btn) {
      btn.addEventListener("click", function () {
        open(btn.getAttribute("data-video"), btn.getAttribute("data-label"));
      });
    }
  );

  if (closeBtn) closeBtn.addEventListener("click", close);
  modal.addEventListener("click", function (e) {
    if (e.target === modal) close();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !modal.hidden) close();
  });
})();
