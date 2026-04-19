
let BASE_URL = localStorage.getItem('omni_base_url') || 'http://localhost:8000';

document.getElementById('backendUrl').value = BASE_URL;

window.onerror = (msg, src, line) => {
  console.log("ERROR:", msg, "line:", line);
};

const UI = {
  lawyer: {
    ws: 'lawyerWS',
    tab: 'tabLawyer',
    nav: 'navLawyer',
    error: 'lawyerError',
    overlay: 'lawyerOverlay',
    scorecard: 'scorecard',
    redact: 'redactBox'
  },
  code: {
    ws: 'codeWS',
    tab: 'tabCode',
    nav: 'navCode',
    error: 'codeError',
    log: 'agentLog',
    result: 'codeResult',
    preview: 'codePreview',
    file: 'crFile'
  }
};

let currentMode = localStorage.getItem('omni_mode') || 'lawyer';

/* ---------- CONFIG ---------- */

function saveUrl() {
  BASE_URL = document.getElementById('backendUrl').value.replace(/\/$/, '');
  localStorage.setItem('omni_base_url', BASE_URL);

  const status = document.getElementById('urlStatus');
  status.textContent = '✓ Saved';
  setTimeout(() => status.textContent = '', 2000);
}

/* ---------- MODE SWITCH ---------- */

function switchMode(mode) {
  currentMode = mode;
  localStorage.setItem('omni_mode', mode);

  const isLawyer = mode === 'lawyer';

  document.getElementById(UI.lawyer.ws).style.display = isLawyer ? 'block' : 'none';
  document.getElementById(UI.code.ws).classList.toggle('active', !isLawyer);

  document.getElementById('howTitle').textContent =
    isLawyer ? 'How Lawyer Agent Works' : 'How Coding Agent Works';

  document.getElementById('howSteps').style.display = isLawyer ? 'block' : 'none';
  document.getElementById('howStepsCode').style.display = isLawyer ? 'none' : 'block';

  document.getElementById('sidebar').classList.toggle('code-mode', !isLawyer);

  setActiveTab(isLawyer);
}

function setActiveTab(isLawyer) {
  document.getElementById(UI.lawyer.tab).className =
    isLawyer ? 'tab active-lawyer' : 'tab';

  document.getElementById(UI.code.tab).className =
    isLawyer ? 'tab active-code' : 'tab';

  document.getElementById(UI.lawyer.nav).className =
    isLawyer ? 'nav-item lawyer active' : 'nav-item lawyer';

  document.getElementById(UI.code.nav).className =
    isLawyer ? 'nav-item code active' : 'nav-item code';
}

/* ---------- FILE HANDLING ---------- */

function handleFile(input, cb) {
  if (input.files?.[0]) cb(input.files[0]);
}

function dragOver(e, id) {
  e.preventDefault();
  document.getElementById(id).classList.add('drag');
}

function dragLeave(id) {
  document.getElementById(id).classList.remove('drag');
}

function dropFile(e, dropId, inputId, cb) {
  e.preventDefault();
  dragLeave(dropId);

  const file = e.dataTransfer.files?.[0];
  if (file) cb(file);
}

/* ---------- LAWYER AGENT ---------- */

async function runLawyer(file) {
  const ui = UI.lawyer;

  resetError(ui.error);
  toggle(ui.overlay, true);
  toggle(ui.scorecard, false);
  toggle(ui.redact, false);

  const fd = new FormData();
  fd.append('file', file);

  try {
    const res = await fetch(`${BASE_URL}/analyze-contract`, {
      method: 'POST',
      body: fd
    });

    const data = await res.json();
    toggle(ui.overlay, false);

    if (data.error) return showError(ui.error, data.error);

    toggle(ui.redact, true);
    renderScorecard(data.result);

  } catch (err) {
    toggle(ui.overlay, false);
    showError(ui.error, `Backend unreachable: ${err.message}`);
  }
}

/* ---------- SCORECARD ---------- */

function renderScorecard(result) {
  const score = result.score ?? 50;
  const risks = result.risks ?? [];
  const fixes = result.fixes ?? [];

  const scVal = document.getElementById('scRiskVal');
  const scSub = document.getElementById('scRiskSub');
  const scCard = document.getElementById('scRisk');

  scVal.textContent = score;

  scCard.className = `score-card ${
    score >= 70 ? 'sc-danger' :
    score >= 40 ? 'sc-warn' : 'sc-safe'
  }`;

  scSub.textContent =
    score >= 70 ? 'High Risk — Do Not Sign' :
    score >= 40 ? 'Review Carefully' :
    'Looks Acceptable';

  document.getElementById('scTotal').textContent = risks.length;
  document.getElementById('scFixes').textContent = fixes.length;

  renderRisks(risks);
  renderFixes(fixes);

  toggle(UI.lawyer.scorecard, true);
}

function renderRisks(risks) {
  const el = document.getElementById('riskList');

  el.innerHTML = risks.length
    ? risks.map(r => riskItem(r)).join('')
    : empty("No flagged clauses found.");
}

function riskItem(r) {
  const sev = r.severity || 'Medium';

  return `
    <div class="risk-item">
      <div class="risk-sev sev-${sev}"></div>
      <div>
        <div class="risk-clause">${esc(r.clause)}</div>
        <div class="risk-issue">${esc(r.issue)}</div>
        <span class="risk-badge badge-${sev}">${sev}</span>
      </div>
    </div>`;
}

function renderFixes(fixes) {
  const box = document.getElementById('fixesSection');
  const el = document.getElementById('fixesList');

  if (!fixes.length) {
    box.style.display = 'none';
    return;
  }

  box.style.display = '';

  el.innerHTML = fixes.map(f => `
    <div class="fix-item">
      <div class="fix-prob">⚠ ${esc(f.problem)}</div>
      <div class="fix-sug">→ ${esc(f.suggestion)}</div>
    </div>
  `).join('');
}

/* ---------- CODER AGENT ---------- */

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function runCoder(file) {
  switchMode('code');

  const ui = UI.code;
  const log = document.getElementById(ui.log);

  log.innerHTML = '';
  toggle(ui.result, false);
  resetError(ui.error);

  logMsg('info', `File: ${file.name}`);

  logMsg('sys', 'Uploading file...');
  await sleep(500);

  logMsg('sys', 'Sending to model...');
  await sleep(800);

  logMsg('warn', 'Analyzing...');
  await sleep(1200);

  logMsg('warn', 'Generating fix...');
  await sleep(1000);

  const fd = new FormData();
  fd.append('file', file);

  try {
    const res = await fetch(`${BASE_URL}/fix-code`, {
      method: 'POST',
      body: fd
    });

    let data;
    try {
      data = await res.json();
    } catch {
      const text = await res.text();
      logMsg('err', 'Invalid response');
      return showError(ui.error, text || "Server error");
    }

    if (data.status === "error" || data.status === "parse_error") {
      logMsg('err', data.message || data.raw || "Error");
      return showError(ui.error, data.message || "Processing failed");
    }

    if (data.status === "no_changes") {
      logMsg('warn', "No changes made");
      logMsg('ok', 'Completed');
      return;
    }

    if (data.status === "saved") {
      logMsg('ok', 'Fix generated');
      await sleep(300);

      logMsg('ok', 'Saving...');
      await sleep(400);

      logMsg('ok', 'Completed');

      document.getElementById(ui.file).textContent =
        data.file || file.name;

      document.getElementById(ui.preview).textContent =
        data.preview
          ? "---- Fixed Code Preview ----\n\n" + data.preview
          : "No preview available";

      if (data.explanation) {
        logMsg('info', 'Changes:');

        const lines = Array.isArray(data.explanation)
          ? data.explanation
          : data.explanation.split('\n');

        lines.forEach(line => {
          if (line.trim()) logMsg('sys', line);
        });
      }

      toggle(ui.result, true);
    }

  } catch (err) {
    logMsg('err', err.message);
    showError(ui.error, err.message);
  }
}

/* ---------- UTIL ---------- */

function toggle(id, show) {
  document.getElementById(id).classList.toggle('show', show);
}

function resetError(id) {
  const el = document.getElementById(id);
  el.classList.remove('show');
  el.textContent = '';
}

function showError(id, msg) {
  const el = document.getElementById(id);
  el.textContent = '⚠ ' + msg;
  el.classList.add('show');
}

function logMsg(type, msg) {
  const log = document.getElementById('agentLog');
  const ts = new Date().toTimeString().slice(0, 8);

  const styles = {
    ok: 'lk-ok',
    warn: 'lk-warn',
    err: 'lk-err',
    info: 'lk-info',
    sys: 'lk-sys'
  };

  log.innerHTML += `
    <div class="log-line">
      <span class="lt">${ts}</span>
      <span class="${styles[type]}">${msg}</span>
    </div>`;

  log.scrollTop = log.scrollHeight;
}

function empty(msg) {
  return `<div style="font-family:var(--mono);font-size:11px;color:var(--muted2);padding:12px">${msg}</div>`;
}

function esc(str) {
  return String(str || '')
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;');
}

switchMode(currentMode);