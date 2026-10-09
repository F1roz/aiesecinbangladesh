/* ==========================================================================
   AIESEC in Bangladesh — EXPA form wiring
   - Fills every Local Committee dropdown from js/expa-config.js
   - Keeps the membership form's hidden "EXPA LC ID" in sync
   - Runs the Apply Now (exchange sign-up) form:
       1. creates the person's AIESEC account on EXPA (auth.aiesec.org)
       2. sends a copy to the Google Sheet (WITHOUT the password)
   ========================================================================== */
(function(){
  "use strict";

  var CFG = window.AIESEC_BD_CONFIG || {};
  var LCS = CFG.LCS || [];

  function lcByName(name){
    for(var i = 0; i < LCS.length; i++){ if(LCS[i].name === name) return LCS[i]; }
    return null;
  }
  // Resolve a dropdown choice ("" = no preference) to { name, id }
  function resolveLc(choice){
    var lc = lcByName(choice) || lcByName(CFG.DEFAULT_LC);
    return { name: lc ? lc.name : "", id: lc && lc.id ? Number(lc.id) : 0 };
  }
  function sheetUrl(){
    var u = CFG.SHEET_ENDPOINT || "";
    return /^https:\/\//.test(u) ? u : "";
  }
  function sendToSheet(data){
    var url = sheetUrl();
    if(!url) return false;
    // Apps Script can't answer CORS preflights, so this is a "simple" text/plain
    // POST sent fire-and-forget. keepalive lets it finish even if the page changes.
    fetch(url, {
      method: "POST",
      mode: "no-cors",
      keepalive: true,
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(data)
    }).catch(function(){});
    return true;
  }

  /* ---------- 1. Fill LC dropdowns ---------- */
  document.querySelectorAll("select[data-lc-select]").forEach(function(sel){
    LCS.forEach(function(lc){
      var opt = document.createElement("option");
      opt.value = lc.name;
      opt.textContent = lc.name;
      sel.appendChild(opt);
    });
  });

  /* ---------- 2. Membership form: hidden EXPA LC ID ---------- */
  document.querySelectorAll("input[data-lc-id-for]").forEach(function(hidden){
    var sel = document.getElementById(hidden.getAttribute("data-lc-id-for"));
    if(!sel) return;
    function sync(){ var lc = resolveLc(sel.value); hidden.value = lc.id ? String(lc.id) : ""; }
    sel.addEventListener("change", sync);
    sync();
  });

  // Date-of-birth inputs: don't allow future dates
  document.querySelectorAll('input[type="date"][name="Date of birth"]').forEach(function(el){
    el.max = new Date().toISOString().slice(0, 10);
  });

  /* ---------- 3. Apply Now form ---------- */
  var form = document.getElementById("apply-form");
  if(!form) return;

  var card = form.closest(".form-card");
  var submitBtn = form.querySelector('button[type="submit"]');
  var alertBox = form.querySelector(".form-alert");
  var params = new URLSearchParams(window.location.search);

  // Pre-select the programme from ?programme=GV|GTa|GTe (used by the programme pages)
  (function preselect(){
    var want = (params.get("programme") || "").toLowerCase();
    form.querySelectorAll('input[name="programme"]').forEach(function(r){
      if(r.value.toLowerCase() === want) r.checked = true;
    });
  })();

  // Show / hide password
  form.querySelectorAll(".pass-toggle").forEach(function(btn){
    btn.addEventListener("click", function(){
      var input = document.getElementById(btn.getAttribute("aria-controls"));
      var show = input.type === "password";
      input.type = show ? "text" : "password";
      btn.textContent = show ? "Hide" : "Show";
      btn.setAttribute("aria-pressed", show ? "true" : "false");
    });
  });

  // Bangladeshi mobile → 10 digits starting with 1 (no +880, no leading 0)
  function normalisePhone(raw){
    var d = String(raw || "").replace(/\D/g, "");
    if(d.indexOf("880") === 0) d = d.slice(3);
    if(d.charAt(0) === "0") d = d.slice(1);
    return d;
  }

  var rules = {
    first_name: function(v){ return v.trim() ? "" : "Enter your first name."; },
    last_name:  function(v){ return v.trim() ? "" : "Enter your last name."; },
    email: function(v){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? "" : "Enter a valid email, like name@example.com."; },
    phone: function(v){ return /^1[3-9]\d{8}$/.test(normalisePhone(v)) ? "" : "Enter your mobile number, like 1712345678."; },
    password: function(v){
      if(v.length < 8) return "Use at least 8 characters.";
      if(!/[a-z]/.test(v)) return "Add a lowercase letter.";
      if(!/[A-Z]/.test(v)) return "Add an uppercase letter.";
      if(!/[0-9]/.test(v)) return "Add a number.";
      return "";
    },
    university: function(v){ return v.trim() ? "" : "Enter your university or institution."; },
    referral: function(v){ return v ? "" : "Choose one option."; }
  };

  function errorEl(name, field){
    var el = form.querySelector('[data-error-for="' + name + '"]');
    if(!el && field){
      el = document.createElement("p");
      el.className = "field-error";
      el.setAttribute("data-error-for", name);
      el.id = "err-" + name;
      field.appendChild(el);
    }
    return el;
  }
  function setError(name, msg){
    var input = form.elements[name];
    var single = input && !(typeof RadioNodeList !== "undefined" && input instanceof RadioNodeList) ? input : null;
    var field = single ? single.closest(".field") : null;
    var el = errorEl(name, field);
    if(el){ el.textContent = msg; el.hidden = !msg; }
    if(single && el){
      single.classList.toggle("is-invalid", !!msg);
      single.setAttribute("aria-invalid", msg ? "true" : "false");
      el.id = el.id || "err-" + name;
      var describedBy = (single.getAttribute("aria-describedby") || "").split(" ").filter(function(x){ return x && x !== el.id; });
      if(msg && el) describedBy.push(el.id);
      if(describedBy.length) single.setAttribute("aria-describedby", describedBy.join(" "));
    }
    return !msg;
  }
  function check(name){
    if(name === "programme"){
      return setError("programme", form.querySelector('input[name="programme"]:checked') ? "" : "Choose a programme.");
    }
    if(name === "consent"){
      return setError("consent", form.elements.consent.checked ? "" : "Please tick this box so we can contact you.");
    }
    var rule = rules[name];
    return rule ? setError(name, rule(form.elements[name].value)) : true;
  }
  var allFields = ["programme", "first_name", "last_name", "email", "phone", "password", "university", "referral", "consent"];

  // Validate on blur; clear an error as soon as it's fixed
  Object.keys(rules).forEach(function(name){
    var el = form.elements[name];
    el.addEventListener("blur", function(){ if(el.value) check(name); });
    el.addEventListener("input", function(){ if(el.classList.contains("is-invalid")) check(name); });
    el.addEventListener("change", function(){ if(el.classList.contains("is-invalid")) check(name); });
  });
  form.querySelectorAll('input[name="programme"]').forEach(function(r){ r.addEventListener("change", function(){ check("programme"); }); });
  form.elements.consent.addEventListener("change", function(){ check("consent"); });

  function showState(state){
    form.style.display = "none";
    var panel = card.querySelector('.form-success[data-state="' + state + '"]');
    if(panel){ panel.classList.add("is-visible"); }
    card.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function showAlert(msg){
    alertBox.textContent = msg;
    alertBox.hidden = !msg;
  }
  function busy(on){
    submitBtn.disabled = on;
    submitBtn.textContent = on ? "Creating your account…" : "Create my account";
  }

  // Turn EXPA's error JSON into one readable line for the sheet
  function describeErrors(body){
    try {
      var errs = body && (body.errors || body.error);
      if(!errs) return "";
      if(typeof errs === "string") return errs;
      return Object.keys(errs).map(function(k){
        var v = errs[k]; return k + " " + (Array.isArray(v) ? v.join(", ") : v);
      }).join("; ");
    } catch(e){ return ""; }
  }

  form.addEventListener("submit", function(e){
    e.preventDefault();
    showAlert("");

    // Spam bots fill the hidden field — pretend it worked and do nothing
    if(form.elements._honey.value){ showState("received"); return; }

    var firstBad = null;
    allFields.forEach(function(name){ if(!check(name) && !firstBad) firstBad = name; });
    if(firstBad){
      var target = form.elements[firstBad];
      (target instanceof RadioNodeList ? target[0] : target).focus();
      return;
    }

    var f = form.elements;
    var progKey = form.querySelector('input[name="programme"]:checked').value;
    var prog = (CFG.PROGRAMMES || {})[progKey] || {};
    var lc = resolveLc(f.lc.value);
    var phone = normalisePhone(f.phone.value);

    // Row for the Google Sheet — deliberately has NO password field
    var sheetRow = {
      form: "Exchange",
      programme: prog.label || progKey,
      first_name: f.first_name.value.trim(),
      last_name: f.last_name.value.trim(),
      email: f.email.value.trim(),
      phone: (CFG.COUNTRY_CODE || "+880") + phone,
      university: f.university.value.trim(),
      lc_choice: f.lc.value || "Not sure",
      lc_assigned: lc.name,
      referral: f.referral.value,
      expa_status: "",
      expa_detail: "",
      page: window.location.href.split("#")[0],
      utm_source: params.get("utm_source") || "",
      utm_medium: params.get("utm_medium") || "",
      utm_campaign: params.get("utm_campaign") || ""
    };

    // EXPA not set up yet for this LC → sheet only
    if(!lc.id || !prog.id || !CFG.EXPA_SIGNUP_URL){
      sheetRow.expa_status = "Not sent (EXPA LC ID not set)";
      if(sendToSheet(sheetRow)){ showState("received"); }
      else { showAlert("This form isn't connected yet. Please email us at aiesec.bangladesh@aiesec.net."); }
      return;
    }

    var payload = {
      user: {
        first_name: sheetRow.first_name,
        last_name: sheetRow.last_name,
        email: sheetRow.email,
        password: f.password.value,
        country_code: CFG.COUNTRY_CODE || "+880",
        phone: phone,
        contact_number: phone,
        lc: lc.id,
        referral_type: f.referral.value,
        allow_phone_communication: "1",
        allow_email_communication: "1",
        selected_programmes: [prog.id]
      }
    };

    busy(true);
    fetch(CFG.EXPA_SIGNUP_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(function(res){
        return res.json().catch(function(){ return {}; }).then(function(body){ return { ok: res.ok, status: res.status, body: body }; });
      })
      .then(function(r){
        var errs = (r.body && r.body.errors) || {};
        var emailTaken = errs.email && String(errs.email).indexOf("taken") !== -1;
        if(r.ok){
          sheetRow.expa_status = "Created";
          sendToSheet(sheetRow);
          showState("created");
        } else if(emailTaken){
          sheetRow.expa_status = "Already had an account";
          sendToSheet(sheetRow);
          showState("existing");
        } else {
          sheetRow.expa_status = "Failed (" + r.status + ")";
          sheetRow.expa_detail = describeErrors(r.body);
          if(sendToSheet(sheetRow)){ showState("received"); }
          else {
            busy(false);
            showAlert("We couldn't create your account" + (sheetRow.expa_detail ? ": " + sheetRow.expa_detail : "") + ". Please check your details and try again.");
          }
        }
      })
      .catch(function(){
        // Network error / blocked request — keep the lead in the sheet
        sheetRow.expa_status = "Failed (network)";
        if(sendToSheet(sheetRow)){ showState("received"); }
        else {
          busy(false);
          showAlert("We couldn't reach AIESEC's servers. Check your connection and try again.");
        }
      });
  });
})();
