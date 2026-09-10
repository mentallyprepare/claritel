/* =========================================================================
   Clara by Claritel — Homepage interactivity
   - Sticky nav + mobile menu
   - Scroll reveal
   - Hero voice demo: scenario switch, mic-gated live call, states, transcript
   - Deployment timeline tabs
   - ClaraLens: evidence highlighting, override, audit trail
   - Decorative waveforms (respect reduced motion)
   ========================================================================= */
(function () {
  "use strict";

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- Sticky nav shadow ---------- */
  var nav = $("#nav");
  var onScroll = function () { nav.classList.toggle("is-stuck", window.scrollY > 8); };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  var navToggle = $("#navToggle");
  var navLinks = $("#navLinks");
  if (navToggle) {
    navToggle.addEventListener("click", function () {
      var open = navLinks.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(open));
    });
    $$(".nav__link", navLinks).forEach(function (a) {
      a.addEventListener("click", function () {
        navLinks.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- Scroll reveal ---------- */
  var reveals = $$(".reveal");
  if ("IntersectionObserver" in window && !prefersReduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Decorative waveforms ---------- */
  function buildWave(el, count, min, max) {
    if (!el) return [];
    var bars = [];
    for (var i = 0; i < count; i++) {
      var b = document.createElement("i");
      b.style.height = (min + Math.random() * (max - min)) + "px";
      el.appendChild(b);
      bars.push(b);
    }
    return bars;
  }
  var voiceBars = buildWave($("#voiceWave"), 22, 6, 34);
  var lensBars = buildWave($("#lensWave"), 60, 5, 30);
  // Mark a few lens bars "hot" near the flagged evidence region
  lensBars.forEach(function (b, i) { if (i > 40 && i < 50) b.classList.add("hot"); });

  // Animate the decorative voice waveform only while it is on screen.
  function makeWaveAnimator(bars, interval, fn) {
    var timer = null;
    return {
      start: function () { if (timer || prefersReduced) return; timer = window.setInterval(fn, interval); },
      stop: function () { if (timer) { clearInterval(timer); timer = null; } }
    };
  }
  var voiceWaveAnim = makeWaveAnimator(voiceBars, 180, function () {
    voiceBars.forEach(function (b) { b.style.height = (6 + Math.random() * 28) + "px"; });
  });
  if (!prefersReduced && "IntersectionObserver" in window && $("#voiceWave")) {
    var voiceIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) voiceWaveAnim.start(); else voiceWaveAnim.stop(); });
    }, { threshold: 0.1 });
    voiceIo.observe($("#voiceWave"));
  }

  /* ===================================================================
     HERO VOICE DEMO
     =================================================================== */
  var scenarios = {
    sales: {
      name: "Clara · Sales qualification",
      intro: "“Hi, I'm Clara. I can walk you through the plans and check if we're a fit for your team. What are you hoping to solve?”",
      script: [
        { who: "clara", text: "Hi, thanks for taking a moment. I'm Clara. What are you hoping to improve right now?" },
        { who: "you", text: "We're losing leads before sales can call them back." },
        { who: "clara", text: "Got it — speed to lead. Roughly how many inbound leads come in each week?" },
        { who: "you", text: "Around eight hundred." },
        { who: "clara", text: "That's a strong volume. I can qualify each one in the first minute and route only the ready ones to your team. Want me to book a working session to map it?" }
      ]
    },
    support: {
      name: "Clara · Customer support",
      intro: "“Hi, I'm Clara from support. Tell me what's happening and I'll sort it or bring in a colleague with full context.”",
      script: [
        { who: "clara", text: "Hi, I'm Clara from support. What can I help you with today?" },
        { who: "you", text: "My order hasn't arrived and it's been a week." },
        { who: "clara", text: "I'm sorry about that. Let me check the order — can you confirm the order number?" },
        { who: "you", text: "It's IN-48213." },
        { who: "clara", text: "Thanks. It's stuck in transit at the hub. I've raised a priority reship and sent tracking to your WhatsApp. Anything else?" }
      ]
    },
    booking: {
      name: "Clara · Appointment booking",
      intro: "“Hi, I'm Clara. I can find a time that works and confirm your appointment in a minute. Shall we start?”",
      script: [
        { who: "clara", text: "Hi, I'm Clara. I'd be glad to book that appointment. What day works best?" },
        { who: "you", text: "Sometime Thursday afternoon." },
        { who: "clara", text: "I have 2:30 or 4:15 on Thursday. Which suits you?" },
        { who: "you", text: "4:15 please." },
        { who: "clara", text: "Booked for 4:15 Thursday. I've sent a confirmation and a reminder to your WhatsApp. See you then." }
      ]
    },
    auto: {
      name: "Clara · Automobile service",
      intro: "“Hi, I'm Clara from service. I can book your car in, check on a job, or share a quote. What do you need?”",
      script: [
        { who: "clara", text: "Hi, I'm Clara from the service centre. How can I help with your vehicle?" },
        { who: "you", text: "My car's due for its 20,000 km service." },
        { who: "clara", text: "I can arrange that. Is it the petrol hatchback registered to this number?" },
        { who: "you", text: "Yes, that's the one." },
        { who: "clara", text: "Perfect. I have a slot Saturday 10 a.m. with pickup from your address. I'll confirm the estimate on WhatsApp before any extra work. Shall I book it?" }
      ]
    }
  };

  var current = "sales";
  var chips = $$(".chip", $("#scenarioChips"));
  var agentName = $("#agentName");
  var agentIntro = $("#agentIntro");
  var heroOrb = $("#heroOrb");
  var preCall = $("#preCall");
  var callUI = $("#callUI");
  var postCall = $("#postCall");
  var startCall = $("#startCall");
  var sampleBtn = $("#sampleBtn");
  var muteBtn = $("#muteBtn");
  var endBtn = $("#endBtn");
  var callOrb = $("#callOrb");
  var callState = $("#callState");
  var callStateText = $("#callStateText");
  var callTimer = $("#callTimer");
  var transcript = $("#transcript");

  function selectScenario(key) {
    current = key;
    var s = scenarios[key];
    agentName.textContent = s.name;
    agentIntro.textContent = s.intro;
    chips.forEach(function (c) {
      var on = c.getAttribute("data-scn") === key;
      c.setAttribute("aria-pressed", String(on));
      c.setAttribute("aria-selected", String(on));
    });
  }

  chips.forEach(function (c) {
    c.addEventListener("click", function () { selectScenario(c.getAttribute("data-scn")); });
  });
  // Arrow-key navigation across scenario chips
  $("#scenarioChips").addEventListener("keydown", function (e) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    var idx = chips.indexOf(document.activeElement);
    if (idx === -1) return;
    e.preventDefault();
    var next = e.key === "ArrowRight" ? (idx + 1) % chips.length : (idx - 1 + chips.length) % chips.length;
    chips[next].focus();
    selectScenario(chips[next].getAttribute("data-scn"));
  });

  /* ---- Call state machine ---- */
  var callState_ = { timer: null, seconds: 0, stream: null, audioCtx: null, raf: null, playTimers: [], live: false, muted: false, starting: false };
  var STATE_LABEL = { listening: "Listening", thinking: "Thinking", speaking: "Speaking", muted: "Muted", ended: "Call ended" };
  var demoNote = $("#demoNote");
  var postCallLabel = $("#postCallLabel");

  function setState(state) {
    var label = state === "muted" ? "Muted" : STATE_LABEL[state] || state;
    callState.setAttribute("data-state", state);
    callStateText.textContent = label;
    callOrb.setAttribute("data-state", state);
    // Clear any inline transform from the mic-driven visual so CSS state
    // animations (thinking/speaking) show instead of a frozen listening frame.
    var core = $(".orb__core", callOrb);
    if (core) core.style.transform = "";
  }

  function fmt(s) {
    var m = Math.floor(s / 60), r = s % 60;
    return (m < 10 ? "0" : "") + m + ":" + (r < 10 ? "0" : "") + r;
  }

  function startTimer() {
    callState_.seconds = 0;
    callTimer.textContent = "00:00";
    callState_.timer = window.setInterval(function () {
      callState_.seconds++;
      callTimer.textContent = fmt(callState_.seconds);
    }, 1000);
  }

  function clearAllTimers() {
    if (callState_.timer) { clearInterval(callState_.timer); callState_.timer = null; }
    callState_.playTimers.forEach(function (t) { clearTimeout(t); });
    callState_.playTimers = [];
    if (callState_.raf) { cancelAnimationFrame(callState_.raf); callState_.raf = null; }
  }

  function addLine(row) {
    var el = document.createElement("div");
    el.className = "transcript__row transcript__row--" + (row.who === "clara" ? "clara" : "you");
    var who = document.createElement("span");
    who.className = "transcript__who";
    who.textContent = row.who === "clara" ? "Clara" : "You";
    var p = document.createElement("p");
    p.textContent = row.text;
    el.appendChild(who); el.appendChild(p);
    transcript.appendChild(el);
    transcript.scrollTop = transcript.scrollHeight;
  }

  // Drive the orb from real mic level when available
  function startMicVisual(stream) {
    if (prefersReduced) return;
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      callState_.audioCtx = new AC();
      var src = callState_.audioCtx.createMediaStreamSource(stream);
      var analyser = callState_.audioCtx.createAnalyser();
      analyser.fftSize = 512;
      src.connect(analyser);
      var data = new Uint8Array(analyser.frequencyBinCount);
      var core = $(".orb__core", callOrb);
      var tick = function () {
        analyser.getByteFrequencyData(data);
        var sum = 0;
        for (var i = 0; i < data.length; i++) sum += data[i];
        var avg = sum / data.length; // 0..255
        if (!callState_.muted && callState.getAttribute("data-state") === "listening") {
          var scale = 1 + Math.min(avg / 255, 1) * 0.12;
          core.style.transform = "scale(" + scale.toFixed(3) + ")";
        }
        callState_.raf = requestAnimationFrame(tick);
      };
      tick();
    } catch (e) { /* visual is optional */ }
  }

  // Play the scripted conversation (never plays audio — transcript + states only)
  function playConversation() {
    var s = scenarios[current].script;
    var delay = 600;
    s.forEach(function (row, i) {
      // "thinking" beat before Clara speaks
      if (row.who === "clara") {
        callState_.playTimers.push(window.setTimeout(function () {
          if (!callState_.live) return;
          if (!callState_.muted) setState("thinking");
        }, delay));
        delay += 700;
        callState_.playTimers.push(window.setTimeout(function () {
          if (!callState_.live) return;
          if (!callState_.muted) setState("speaking");
          addLine(row);
        }, delay));
        delay += 1600 + row.text.length * 12;
        // back to listening after Clara speaks (unless last)
        if (i < s.length - 1) {
          callState_.playTimers.push(window.setTimeout(function () {
            if (!callState_.live) return;
            if (!callState_.muted) setState("listening");
          }, delay));
        }
      } else {
        callState_.playTimers.push(window.setTimeout(function () {
          if (!callState_.live) return;
          addLine(row);
        }, delay));
        delay += 1200 + row.text.length * 10;
      }
    });
    // End naturally
    callState_.playTimers.push(window.setTimeout(function () {
      if (callState_.live) endCall(false);
    }, delay + 800));
  }

  function openCallUI() {
    callState_.starting = false;
    callState_.live = true;
    callState_.muted = false;
    transcript.innerHTML = "";
    preCall.hidden = true;
    postCall.classList.remove("is-shown");
    callUI.classList.add("is-live");
    muteBtn.setAttribute("aria-pressed", "false");
    muteBtn.setAttribute("aria-label", "Mute microphone");
    setState("listening");
    startTimer();
    playConversation();
    endBtn.focus();
  }

  // Mic denied / unavailable: don't auto-start. Surface the sample fallback.
  function showSampleFallback(msg) {
    callState_.starting = false;
    sampleBtn.hidden = false;
    if (demoNote) { demoNote.textContent = msg; demoNote.classList.add("is-shown"); }
    sampleBtn.focus();
  }

  function beginCall() {
    if (callState_.starting || callState_.live) return; // re-entrancy guard
    callState_.starting = true;
    // Ask for mic ONLY after explicit click
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true }).then(function (stream) {
        callState_.stream = stream;
        openCallUI();
        startMicVisual(stream);
      }).catch(function () {
        showSampleFallback("Microphone unavailable. You can hear a sample conversation instead.");
      });
    } else {
      showSampleFallback("Live calling isn't available in this browser. Hear a sample conversation instead.");
    }
  }

  function stopMic() {
    if (callState_.stream) {
      callState_.stream.getTracks().forEach(function (t) { t.stop(); });
      callState_.stream = null;
    }
    if (callState_.audioCtx) {
      try { callState_.audioCtx.close(); } catch (e) {}
      callState_.audioCtx = null;
    }
    var core = $(".orb__core", callOrb);
    if (core) core.style.transform = "";
  }

  function endCall(userEnded) {
    callState_.live = false;
    callState_.starting = false;
    clearAllTimers();
    stopMic();
    setState("ended");
    callUI.classList.remove("is-live");
    postCall.classList.add("is-shown");
    // Announce + move focus on BOTH natural and user-triggered ends,
    // since the focused end-button is inside the now-hidden call region.
    if (postCallLabel) {
      postCallLabel.textContent = userEnded
        ? "Call ended. Try another scenario, or build one for your business."
        : "The sample call finished. Try another scenario, or build one for your business.";
    }
    try { $("#tryAnother").focus(); } catch (e) {}
  }

  if (startCall) startCall.addEventListener("click", beginCall);

  if (muteBtn) muteBtn.addEventListener("click", function () {
    callState_.muted = !callState_.muted;
    muteBtn.setAttribute("aria-pressed", String(callState_.muted));
    muteBtn.setAttribute("aria-label", callState_.muted ? "Unmute microphone" : "Mute microphone");
    if (callState_.muted) setState("muted");
    else setState("listening");
  });

  if (endBtn) endBtn.addEventListener("click", function () { endCall(true); });

  function resetFallback() {
    sampleBtn.hidden = true;
    if (demoNote) { demoNote.textContent = ""; demoNote.classList.remove("is-shown"); }
  }

  if (sampleBtn) sampleBtn.addEventListener("click", function () {
    // Fallback: play the sample without requiring mic
    resetFallback();
    openCallUI();
  });

  var tryAnother = $("#tryAnother");
  if (tryAnother) tryAnother.addEventListener("click", function () {
    postCall.classList.remove("is-shown");
    resetFallback();
    preCall.hidden = false;
    setState("listening");
    // focus scenario chips so the visitor can pick a new one
    var firstChip = chips[0];
    if (firstChip) firstChip.focus();
  });

  /* ===================================================================
     DEPLOYMENT TIMELINE
     =================================================================== */
  var tlTabs = $$(".tl-tab", $("#tlTabs"));
  var tlPanels = $$(".tl-panel", $("#tlPanels"));
  function selectStep(i) {
    tlTabs.forEach(function (t, idx) { t.setAttribute("aria-selected", String(idx === i)); });
    tlPanels.forEach(function (p, idx) { p.classList.toggle("is-active", idx === i); });
  }
  tlTabs.forEach(function (t, i) {
    t.addEventListener("click", function () { selectStep(i); });
    t.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();
        var next = e.key === "ArrowRight" ? (i + 1) % tlTabs.length : (i - 1 + tlTabs.length) % tlTabs.length;
        tlTabs[next].focus(); selectStep(next);
      }
    });
  });

  /* ===================================================================
     CLARALENS — evidence highlighting, override, audit trail
     =================================================================== */
  var eviBtns = $$(".score-evi");
  var lensLines = $$(".lens-line", $("#lensTranscript"));
  function clearEvidence() {
    lensLines.forEach(function (l) { l.classList.remove("evidence", "evidence-ok"); });
  }
  eviBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var line = btn.getAttribute("data-evi");
      var wasOn = btn.getAttribute("aria-pressed") === "true";
      eviBtns.forEach(function (b) { b.setAttribute("aria-pressed", "false"); b.textContent = "Show evidence"; });
      clearEvidence();
      if (wasOn) return;
      btn.setAttribute("aria-pressed", "true");
      btn.textContent = "Hide evidence";
      var target = $('.lens-line[data-line="' + line + '"]', $("#lensTranscript"));
      if (target) {
        // Line 11 is the ZTP fail → red; others → green evidence
        target.classList.add(line === "11" ? "evidence" : "evidence-ok");
        target.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth", block: "nearest" });
      }
    });
  });

  var overrideBtn = $("#overrideBtn");
  var overrideRow = $("#overrideRow");
  if (overrideBtn) overrideBtn.addEventListener("click", function () {
    var done = overrideBtn.getAttribute("data-done") === "1";
    if (done) return;
    overrideBtn.setAttribute("data-done", "1");
    overrideBtn.textContent = "Override recorded";
    overrideBtn.disabled = true;
    if (overrideRow) overrideRow.hidden = false;
    // reveal the trail so the override is visible
    var trail = $("#auditTrail");
    if (trail && trail.hidden) { trail.hidden = false; $("#trailBtn").setAttribute("aria-expanded", "true"); }
  });

  var trailBtn = $("#trailBtn");
  if (trailBtn) trailBtn.addEventListener("click", function () {
    var trail = $("#auditTrail");
    var open = trail.hidden;
    trail.hidden = !open;
    trailBtn.setAttribute("aria-expanded", String(open));
  });

  /* ---------- Animate lens waveform subtly on view ---------- */
  if (!prefersReduced && "IntersectionObserver" in window) {
    var lensIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          var t = window.setInterval(function () {
            lensBars.forEach(function (b, i) {
              if (i > 40 && i < 50) return; // keep hot region prominent
              b.style.height = (5 + Math.random() * 24) + "px";
            });
          }, 220);
          e.target._t = t;
        } else if (e.target._t) {
          clearInterval(e.target._t); e.target._t = null;
        }
      });
    }, { threshold: 0.2 });
    var lw = $("#lensWave");
    if (lw) lensIo.observe(lw);
  }

  // Init
  selectScenario("sales");
})();
