/* ==========================================================================
   Peak Barrie Services — site behaviour
   Vanilla JS, no dependencies, no external APIs.
   ========================================================================== */
(function () {
  "use strict";

  /* ----------------------------------------------------------------------
     Year stamps
     ---------------------------------------------------------------------- */
  function setYear() {
    var y = String(new Date().getFullYear());
    document.querySelectorAll("[data-year]").forEach(function (el) {
      el.textContent = y;
    });
  }

  /* ----------------------------------------------------------------------
     Mobile navigation
     ---------------------------------------------------------------------- */
  function initNav() {
    var btn = document.querySelector(".nav-btn");
    var nav = document.getElementById("primary-nav");
    if (!btn || !nav) return;

    // The header is sticky and sits under a top bar, so the drawer's top edge
    // is measured rather than assumed.
    function positionDrawer() {
      var header = document.querySelector(".site-header");
      if (!header) return;
      var bottom = Math.max(0, Math.round(header.getBoundingClientRect().bottom));
      document.documentElement.style.setProperty("--drawer-top", bottom + "px");
    }

    function close() {
      document.body.classList.remove("nav-open");
      btn.setAttribute("aria-expanded", "false");
    }

    btn.addEventListener("click", function () {
      positionDrawer();
      var open = document.body.classList.toggle("nav-open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });

    window.addEventListener("resize", positionDrawer);
    window.addEventListener("scroll", function () {
      if (document.body.classList.contains("nav-open")) positionDrawer();
    }, { passive: true });

    // Close the drawer after tapping a link
    nav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", close);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close();
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 1040) close();
    });

    // Accordion behaviour for dropdown groups on small screens
    nav.querySelectorAll(".nav__toggle").forEach(function (toggle) {
      toggle.addEventListener("click", function (e) {
        if (window.innerWidth > 1040) return;
        e.preventDefault();
        var group = toggle.closest(".nav__group");
        if (!group) return;
        var open = group.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
    });
  }

  /* ----------------------------------------------------------------------
     Sticky header shadow
     ---------------------------------------------------------------------- */
  function initHeader() {
    var header = document.querySelector(".site-header");
    if (!header) return;
    var onScroll = function () {
      header.classList.toggle("is-stuck", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ----------------------------------------------------------------------
     Reveal on scroll
     ---------------------------------------------------------------------- */
  function initReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!items.length) return;

    function revealAll() {
      items.forEach(function (el) { el.classList.add("is-visible"); });
    }

    if (!("IntersectionObserver" in window)) {
      revealAll();
      return;
    }

    // Failsafe: never leave content hidden if the observer never fires
    // (print, screenshot tools, unusual scroll containers, etc.).
    window.setTimeout(revealAll, 2500);
    window.addEventListener("beforeprint", revealAll);

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );

    items.forEach(function (el) { io.observe(el); });
  }

  /* ----------------------------------------------------------------------
     Forms → LeadrVision
     Every form posts to the same endpoint. Plain (no-JS) submission still
     works because the action/method live in the markup; with JS we upgrade
     to fetch() against the identical URL and confirm inline.
     ---------------------------------------------------------------------- */
  var SUCCESS_MESSAGE = "Thanks, your message was sent. A member of the Peak Barrie Services team will be in touch shortly.";

  function statusIcon(ok) {
    return ok
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16.5h.01"/></svg>';
  }

  function showStatus(box, ok, message) {
    if (!box) return;
    box.className = "form-status is-visible " + (ok ? "is-success" : "is-error");
    box.innerHTML = statusIcon(ok) + "<span>" + message + "</span>";
  }

  function initForms() {
    var forms = document.querySelectorAll("form[data-leadr]");
    if (!forms.length) return;

    var href = window.location.href;
    var submitted =
      new URLSearchParams(window.location.search).get("submitted") === "1";

    forms.forEach(function (form) {
      // Stamp the current page URL so the visitor is returned here.
      form.querySelectorAll('input[name="_page"]').forEach(function (input) {
        input.value = href;
      });

      // The status banner sits just above the form inside the card, so fall
      // back to the surrounding card if it is not a descendant of the form.
      var card = form.closest(".quote-card") || form.parentElement;
      var box =
        form.querySelector(".form-status") ||
        (card && card.querySelector(".form-status"));

      // Plain HTML submission came back with ?submitted=1
      if (submitted) showStatus(box, true, SUCCESS_MESSAGE);

      form.addEventListener("submit", function (e) {
        if (!window.fetch || !form.reportValidity) return; // let the browser post normally
        e.preventDefault();

        var button = form.querySelector('button[type="submit"]');
        var original = button ? button.innerHTML : "";
        if (button) {
          button.disabled = true;
          button.innerHTML = "Sending…";
        }

        var data = {};
        new FormData(form).forEach(function (value, key) {
          if (Object.prototype.hasOwnProperty.call(data, key)) {
            data[key] = [].concat(data[key], value);
          } else {
            data[key] = value;
          }
        });
        data._page = href;

        fetch(form.action, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json"
          },
          body: JSON.stringify(data)
        })
          .then(function (res) {
            return res.json().catch(function () { return { ok: res.ok }; });
          })
          .then(function (json) {
            if (json && json.ok) {
              showStatus(box, true, SUCCESS_MESSAGE);
              form.reset();
              form.querySelectorAll('input[name="_page"]').forEach(function (i) {
                i.value = href;
              });
              if (box && box.scrollIntoView) {
                box.scrollIntoView({ behavior: "smooth", block: "center" });
              }
            } else {
              throw new Error("Submission rejected");
            }
          })
          .catch(function () {
            showStatus(
              box,
              false,
              'Sorry, something went wrong sending your message. Please call us at <a href="tel:+17054134093">(705) 413-4093</a> or email <a href="mailto:support@peakbarrieservices.com">support@peakbarrieservices.com</a>.'
            );
          })
          .then(function () {
            if (button) {
              button.disabled = false;
              button.innerHTML = original;
            }
          });
      });
    });
  }

  /* ----------------------------------------------------------------------
     Pre-fill the quote form's "Service needed" from ?service=
     ---------------------------------------------------------------------- */
  function initServicePrefill() {
    var wanted = new URLSearchParams(window.location.search).get("service");
    if (!wanted) return;
    document
      .querySelectorAll('select[name="Service needed"]')
      .forEach(function (select) {
        Array.prototype.forEach.call(select.options, function (opt) {
          if (opt.value.toLowerCase() === wanted.toLowerCase()) {
            select.value = opt.value;
          }
        });
      });
  }

  /* ----------------------------------------------------------------------
     Boot
     ---------------------------------------------------------------------- */
  function init() {
    setYear();
    initNav();
    initHeader();
    initReveal();
    initForms();
    initServicePrefill();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
