/* ==========================================================================
   AIESEC in Bangladesh — main.js (vanilla JS, no dependencies)
   ========================================================================== */
(function(){
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Page loader (walking-figure) ---------- */
  function hideLoader(){
    var loader = document.getElementById("page-loader");
    if(!loader) return;
    loader.classList.add("is-hidden");
    window.setTimeout(function(){ loader.remove(); }, 600);
  }
  window.addEventListener("load", function(){
    window.setTimeout(hideLoader, reduceMotion ? 0 : 350);
  });
  // Fallback in case load event is delayed
  window.setTimeout(hideLoader, 2200);

  // Page-transition on internal link clicks
  document.addEventListener("click", function(e){
    var a = e.target.closest("a");
    if(!a) return;
    var href = a.getAttribute("href");
    if(!href || href.charAt(0)==="#" || a.target === "_blank" || a.hasAttribute("download")) return;
    if(/^https?:\/\//.test(href) || href.indexOf("mailto:")===0 || href.indexOf("tel:")===0 || href.indexOf("javascript:")===0) return;
    if(!href.endsWith(".html") && href.indexOf(".html#")===-1 && href !== "/") return;
    e.preventDefault();
    var loader = document.getElementById("page-loader");
    if(loader){
      loader.classList.remove("is-hidden");
      loader.style.display = "flex";
      window.setTimeout(function(){ window.location.href = href; }, 420);
    } else {
      window.location.href = href;
    }
  });

  /* ---------- Custom cursor ---------- */
  (function initCursor(){
    if(window.matchMedia("(hover: none), (pointer: coarse)").matches) return;
    document.body.classList.add("has-custom-cursor");
    var dot = document.createElement("div");
    dot.className = "cursor-dot";
    var ring = document.createElement("div");
    ring.className = "cursor-ring";
    document.body.appendChild(dot);
    document.body.appendChild(ring);
    var x=0,y=0, rx=0, ry=0;
    document.addEventListener("mousemove", function(e){
      x = e.clientX; y = e.clientY;
      dot.style.transform = "translate("+x+"px,"+y+"px) translate(-50%,-50%)";
    });
    (function loop(){
      rx += (x-rx)*0.18; ry += (y-ry)*0.18;
      ring.style.transform = "translate("+rx+"px,"+ry+"px) translate(-50%,-50%)";
      requestAnimationFrame(loop);
    })();
    document.addEventListener("mouseover", function(e){
      if(e.target.closest("a, button, input, textarea, select, .chip, .acc-trigger, .card-link")){
        ring.classList.add("is-active");
      }
    });
    document.addEventListener("mouseout", function(e){
      if(e.target.closest("a, button, input, textarea, select, .chip, .acc-trigger, .card-link")){
        ring.classList.remove("is-active");
      }
    });
    document.addEventListener("mouseleave", function(){ dot.style.opacity=0; ring.style.opacity=0; });
    document.addEventListener("mouseenter", function(){ dot.style.opacity=1; ring.style.opacity=1; });
  })();

  /* ---------- Sticky header ---------- */
  var header = document.querySelector(".site-header");
  function onScrollHeader(){
    if(!header) return;
    if(window.scrollY > 40){ header.classList.add("is-scrolled"); }
    else { header.classList.remove("is-scrolled"); }
  }
  document.addEventListener("scroll", onScrollHeader, {passive:true});
  onScrollHeader();

  /* ---------- Mobile nav / mega menu ---------- */
  var burger = document.querySelector(".burger");
  var mainNav = document.querySelector(".main-nav");
  if(burger && mainNav){
    burger.addEventListener("click", function(){
      var open = mainNav.classList.toggle("is-open");
      document.body.classList.toggle("nav-open", open);
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }
  document.querySelectorAll(".has-mega > .nav-link").forEach(function(link){
    link.addEventListener("click", function(e){
      if(window.innerWidth <= 980){
        e.preventDefault();
        e.stopPropagation(); // stop this click from also reaching the page-transition
                              // listener below (line ~23), which would otherwise
                              // force-navigate away right after we open the submenu
        var parent = link.closest(".has-mega");
        var wasOpen = parent.classList.contains("is-open");
        document.querySelectorAll(".has-mega.is-open").forEach(function(li){ li.classList.remove("is-open"); });
        if(!wasOpen) parent.classList.add("is-open");
      }
    });
  });

  /* ---------- Back to top ---------- */
  var backTop = document.querySelector(".back-top");
  if(backTop){
    document.addEventListener("scroll", function(){
      backTop.classList.toggle("is-visible", window.scrollY > 700);
    }, {passive:true});
    backTop.addEventListener("click", function(){ window.scrollTo({top:0, behavior: reduceMotion ? "auto" : "smooth"}); });
  }

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll(".reveal, .reveal-stagger");
  if("IntersectionObserver" in window && !reduceMotion){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, {threshold:.15, rootMargin:"0px 0px -60px 0px"});
    revealEls.forEach(function(el){ io.observe(el); });
  } else {
    revealEls.forEach(function(el){ el.classList.add("is-visible"); });
  }

  /* ---------- Animated stat counters ---------- */
  var counters = document.querySelectorAll("[data-count]");
  function animateCount(el){
    var target = parseFloat(el.getAttribute("data-count"));
    var suffix = el.getAttribute("data-suffix") || "";
    var dur = 1600, start = null;
    function step(ts){
      if(!start) start = ts;
      var p = Math.min((ts-start)/dur, 1);
      var eased = 1 - Math.pow(1-p, 3);
      var val = Math.floor(eased * target);
      el.textContent = val.toLocaleString() + suffix;
      if(p < 1) requestAnimationFrame(step);
      else el.textContent = target.toLocaleString() + suffix;
    }
    if(reduceMotion){ el.textContent = target.toLocaleString() + suffix; return; }
    requestAnimationFrame(step);
  }
  if(counters.length){
    if("IntersectionObserver" in window){
      var cio = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if(entry.isIntersecting){ animateCount(entry.target); cio.unobserve(entry.target); }
        });
      }, {threshold:.5});
      counters.forEach(function(el){ cio.observe(el); });
    } else { counters.forEach(animateCount); }
  }

  /* ---------- FAQ Accordion ---------- */
  document.querySelectorAll(".acc-trigger").forEach(function(btn){
    btn.addEventListener("click", function(){
      var item = btn.closest(".acc-item");
      var panel = item.querySelector(".acc-panel");
      var isOpen = item.classList.contains("is-open");
      // close siblings within the same accordion (optional single-open behavior per group)
      var group = item.closest(".accordion");
      if(group && group.hasAttribute("data-single")){
        group.querySelectorAll(".acc-item.is-open").forEach(function(other){
          if(other!==item){ other.classList.remove("is-open"); other.querySelector(".acc-panel").style.maxHeight = null; other.querySelector(".acc-trigger").setAttribute("aria-expanded","false"); }
        });
      }
      item.classList.toggle("is-open", !isOpen);
      btn.setAttribute("aria-expanded", (!isOpen).toString());
      panel.style.maxHeight = !isOpen ? panel.scrollHeight + "px" : null;
    });
  });

  /* ---------- Filter chips (Success Stories / Blog / Events) ---------- */
  document.querySelectorAll("[data-filter-group]").forEach(function(group){
    var chips = group.querySelectorAll(".chip");
    var targetSelector = group.getAttribute("data-filter-group");
    var items = document.querySelectorAll(targetSelector);
    chips.forEach(function(chip){
      chip.addEventListener("click", function(){
        chips.forEach(function(c){ c.classList.remove("is-active"); });
        chip.classList.add("is-active");
        var val = chip.getAttribute("data-filter");
        items.forEach(function(item){
          var match = val === "all" || item.getAttribute("data-cat") === val;
          item.style.display = match ? "" : "none";
        });
      });
    });
  });

  /* ---------- Forms (submits to email via FormSubmit, optionally also to a
     Google Sheet via data-sheet-endpoint, when configured) ---------- */
  document.querySelectorAll("form[data-ajax-form]").forEach(function(form){
    form.addEventListener("submit", function(e){
      e.preventDefault();
      var wrap = form.closest(".form-card") || form.parentElement;
      var success = wrap ? wrap.querySelector(".form-success") : null;
      var endpoint = form.getAttribute("data-email-endpoint");
      var sheetEndpoint = form.getAttribute("data-sheet-endpoint");
      var submitBtn = form.querySelector('button[type="submit"]');
      var originalBtnText = submitBtn ? submitBtn.textContent : "";

      function showSuccess(){
        if(success){ form.style.display = "none"; success.classList.add("is-visible"); }
        else { alert("Thanks! Your submission has been received."); form.reset(); }
      }

      // No email endpoint configured on this form yet — fall back to the old
      // front-end-only demo behavior instead of silently failing.
      if(!endpoint){ showSuccess(); return; }

      if(submitBtn){ submitBtn.disabled = true; submitBtn.textContent = "Sending…"; }

      // Fire the optional Google Sheet copy in parallel. Apps Script Web Apps
      // don't send CORS headers, so the response can't be read from here —
      // "no-cors" still delivers the POST server-side, it just can't confirm
      // success back to this page. That's fine: the email send below is what
      // actually drives the success/error UI.
      if(sheetEndpoint){
        fetch(sheetEndpoint, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify(Object.fromEntries(new FormData(form)))
        }).catch(function(){ /* best-effort — email send is the source of truth */ });
      }

      fetch(endpoint, {
        method: "POST",
        headers: { "Accept": "application/json" },
        body: new FormData(form)
      })
        .then(function(res){ if(!res.ok) throw new Error("Request failed"); return res.json(); })
        .then(function(){ showSuccess(); })
        .catch(function(){
          if(submitBtn){ submitBtn.disabled = false; submitBtn.textContent = originalBtnText; }
          alert("Sorry, something went wrong sending this. Please email us directly at aiesec.bangladesh@aiesec.net.");
        });
    });
  });

  /* ---------- Hero photo carousel ---------- */
  (function initHeroCarousel(){
    var hero = document.querySelector(".hero-carousel");
    if(!hero) return;
    var slides = hero.querySelectorAll(".hero-slide");
    var dots = hero.querySelectorAll(".hero-dot");
    var content = hero.querySelector(".hero-content");
    var eyebrow = hero.querySelector("#hero-eyebrow");
    var titleEl = hero.querySelector("#hero-title");
    var ledeEl = hero.querySelector("#hero-lede");
    var statNum = hero.querySelector("#hero-stat-num");
    var statLabel = hero.querySelector("#hero-stat-label");
    var prevBtn = hero.querySelector(".hero-arrow-prev");
    var nextBtn = hero.querySelector(".hero-arrow-next");
    var current = 0, timer = null;

    function animateStat(el, target, suffix){
      var dur = 1000, start = null;
      function step(ts){
        if(!start) start = ts;
        var p = Math.min((ts-start)/dur, 1);
        var eased = 1 - Math.pow(1-p, 3);
        el.textContent = Math.floor(eased * target).toLocaleString() + suffix;
        if(p < 1) requestAnimationFrame(step);
        else el.textContent = target.toLocaleString() + suffix;
      }
      if(reduceMotion){ el.textContent = target.toLocaleString() + suffix; return; }
      requestAnimationFrame(step);
    }

    function applySlideText(active){
      if(eyebrow){ eyebrow.innerHTML = '<span class="eyebrow-line"></span>' + (active.getAttribute("data-eyebrow") || "Youth Leadership"); }
      if(titleEl){ titleEl.textContent = active.getAttribute("data-title") || titleEl.textContent; }
      if(ledeEl){ ledeEl.textContent = active.getAttribute("data-lede") || ledeEl.textContent; }
      if(statNum){ animateStat(statNum, parseFloat(active.getAttribute("data-stat")) || 0, active.getAttribute("data-suffix") || ""); }
      if(statLabel){ statLabel.textContent = active.getAttribute("data-label") || ""; }
    }

    function goTo(index){
      current = (index + slides.length) % slides.length;
      slides.forEach(function(s, i){ s.classList.toggle("is-active", i === current); });
      dots.forEach(function(d, i){ d.classList.toggle("is-active", i === current); });
      var active = slides[current];
      if(!active) return;
      if(content && !reduceMotion){
        content.classList.add("is-swapping");
        window.setTimeout(function(){
          applySlideText(active);
          content.classList.remove("is-swapping");
        }, 260);
      } else {
        applySlideText(active);
      }
    }
    function next(){ goTo(current + 1); }
    function prev(){ goTo(current - 1); }
    function restart(){ if(timer) clearInterval(timer); timer = setInterval(next, 6500); }

    if(slides.length){
      // Render first slide's text immediately (no fade) on load
      applySlideText(slides[0]);
      slides[0].classList.add("is-active");
      dots[0] && dots[0].classList.add("is-active");
      restart();
    }
    if(nextBtn) nextBtn.addEventListener("click", function(){ next(); restart(); });
    if(prevBtn) prevBtn.addEventListener("click", function(){ prev(); restart(); });
    dots.forEach(function(d, i){ d.addEventListener("click", function(){ goTo(i); restart(); }); });
    // Note: autoplay intentionally does NOT pause on hover — the hero fills the
    // whole viewport, so a "pause on hover" would stop as soon as the cursor
    // rests anywhere on screen and never resume. Manual arrow/dot clicks still
    // reset the timer so a manual choice gets a full interval before advancing.
  })();

  /* ---------- Set active nav link ---------- */
  (function markActive(){
    var path = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".main-nav a[href]").forEach(function(a){
      var href = a.getAttribute("href").split("/").pop();
      if(href === path){ a.classList.add("is-current"); a.setAttribute("aria-current","page"); }
    });
  })();

  /* ---------- Current year in footer ---------- */
  document.querySelectorAll("[data-year]").forEach(function(el){ el.textContent = new Date().getFullYear(); });

})();
