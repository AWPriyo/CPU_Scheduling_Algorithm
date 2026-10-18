const TITLES = {
  fcfs: 'First Come First Served (FCFS)',
  sjf: 'Shortest Job First (Non-preemptive)',
  srtf: 'Shortest Remaining Time First (SRTF)',
  priority: 'Priority Scheduling (Non-preemptive)',
  rr: 'Round Robin'
};
const COLORS = ['#60a5fa', '#34d399', '#fbbf24', '#f472b6', '#a78bfa', '#22d3ee', '#fb923c', '#a3e635'];
const THEMES = ['blue', 'pink', 'purple', 'green'];
const $ = id => document.getElementById(id);

let processes = [];
let currentAlgo = 'fcfs';

const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const colorOf = id => COLORS[Math.max(0, processes.findIndex(p => p.id === id)) % COLORS.length];
const notify = text => { $('msg').textContent = text || ''; };

/* ---------- Theme ---------- */
function setTheme(name) {
  if (!THEMES.includes(name)) name = 'blue';
  document.documentElement.dataset.theme = name;
  document.querySelectorAll('.swatch').forEach(b => {
    const on = b.dataset.theme === name;
    b.classList.toggle('active', on);
    b.setAttribute('aria-checked', on);
  });
  try { localStorage.setItem('theme', name); } catch (e) { /* storage unavailable */ }
}

/* ---------- Input handling ---------- */
function addProcess(e) {
  e.preventDefault();
  const id = $('pId').value.trim();
  const arrival = parseInt($('pArrival').value);
  const burst = parseInt($('pBurst').value);
  const priority = parseInt($('pPriority').value) || 1;

  if (!id || isNaN(arrival) || isNaN(burst) || arrival < 0 || burst < 1) {
    return notify('Enter a valid Process ID, Arrival time (≥ 0) and Burst time (≥ 1).');
  }
  if (processes.some(p => p.id === id)) return notify(`Process "${id}" already exists.`);

  processes.push({ id, arrival, burst, priority });
  notify();
  e.target.reset();
  $('pId').focus();
  renderInput();
  if (!$('results').hidden) run();
}

function removeProcess(i) {
  processes.splice(i, 1);
  renderInput();
  processes.length ? run() : ($('results').hidden = true);
}

function renderInput() {
  $('inputBody').innerHTML = processes.length
    ? processes.map((p, i) => `<tr>
        <td><span class="pid" style="--c:${colorOf(p.id)}">${esc(p.id)}</span></td>
        <td>${p.arrival}</td><td>${p.burst}</td><td>${p.priority}</td>
        <td><button class="btn del" onclick="removeProcess(${i})">Delete</button></td>
      </tr>`).join('')
    : '<tr><td class="empty" colspan="5">No processes yet — add one above or load a sample.</td></tr>';
}

/* ---------- Algorithms ---------- */
const finalize = (p, t) => {
  p.completion = t;
  p.turnaround = t - p.arrival;
  p.waiting = p.turnaround - p.burst;
};

function addSlice(gantt, id, start, end, idle = false) {
  const last = gantt[gantt.length - 1];
  if (last && last.id === id && last.end === start) last.end = end;
  else gantt.push({ id, start, end, idle });
}

// FCFS, SJF and Priority differ only in how the next job is picked.
function nonPreemptive(procs, key) {
  const pending = procs.map(p => ({ ...p }));
  const rows = [], gantt = [];
  let t = 0;
  while (pending.length) {
    const ready = pending.filter(p => p.arrival <= t);
    if (!ready.length) {
      const next = Math.min(...pending.map(p => p.arrival));
      addSlice(gantt, 'Idle', t, next, true);
      t = next;
      continue;
    }
    ready.sort((a, b) => key(a) - key(b) || a.arrival - b.arrival);
    const p = ready[0];
    pending.splice(pending.indexOf(p), 1);
    p.response = t - p.arrival;
    addSlice(gantt, p.id, t, t + p.burst);
    t += p.burst;
    finalize(p, t);
    rows.push(p);
  }
  return { rows, gantt };
}

function srtf(procs) {
  const list = procs.map(p => ({ ...p, remaining: p.burst, response: -1 }));
  const gantt = [];
  let t = 0, left = list.length;
  while (left) {
    const ready = list.filter(p => p.arrival <= t && p.remaining > 0);
    if (!ready.length) { addSlice(gantt, 'Idle', t, t + 1, true); t++; continue; }
    ready.sort((a, b) => a.remaining - b.remaining || a.arrival - b.arrival);
    const p = ready[0];
    if (p.response < 0) p.response = t - p.arrival;
    addSlice(gantt, p.id, t, t + 1);
    p.remaining--; t++;
    if (!p.remaining) { finalize(p, t); left--; }
  }
  return { rows: list, gantt };
}

function roundRobin(procs, q) {
  const list = procs.map(p => ({ ...p, remaining: p.burst, response: -1 }))
                    .sort((a, b) => a.arrival - b.arrival);
  const queue = [], gantt = [];
  let t = 0, i = 0, left = list.length;
  const admit = () => { while (i < list.length && list[i].arrival <= t) queue.push(list[i++]); };

  while (left) {
    admit();
    if (!queue.length) {
      const next = list[i].arrival;
      addSlice(gantt, 'Idle', t, next, true);
      t = next;
      continue;
    }
    const p = queue.shift();
    if (p.response < 0) p.response = t - p.arrival;
    const slice = Math.min(p.remaining, q);
    addSlice(gantt, p.id, t, t + slice);
    t += slice; p.remaining -= slice;
    admit();                                  // newcomers go ahead of the preempted process
    if (p.remaining) queue.push(p);
    else { finalize(p, t); left--; }
  }
  return { rows: list, gantt };
}

/* ---------- Run + render ---------- */
function run() {
  if (!processes.length) return notify('Add at least one process first.');
  notify();

  const q = Math.max(1, parseInt($('timeQuantum').value) || 4);
  const result = {
    fcfs: () => nonPreemptive(processes, p => p.arrival),
    sjf: () => nonPreemptive(processes, p => p.burst),
    priority: () => nonPreemptive(processes, p => p.priority),
    srtf: () => srtf(processes),
    rr: () => roundRobin(processes, q)
  }[currentAlgo]();

  const rows = result.rows.sort((a, b) => a.arrival - b.arrival);
  $('algoTitle').textContent = currentAlgo === 'rr' ? `${TITLES.rr} (q = ${q})` : TITLES[currentAlgo];
  $('results').hidden = false;
  renderResults(rows);
  renderGantt(result.gantt);
}

function renderResults(rows) {
  $('resultBody').innerHTML = rows.map(p => `<tr>
    <td><span class="pid" style="--c:${colorOf(p.id)}">${esc(p.id)}</span></td>
    <td>${p.arrival}</td><td>${p.burst}</td><td>${p.completion}</td>
    <td>${p.turnaround}</td><td>${p.waiting}</td><td>${p.response}</td>
  </tr>`).join('');

  const avg = k => (rows.reduce((s, p) => s + p[k], 0) / rows.length).toFixed(2);
  $('avgTat').textContent = avg('turnaround');
  $('avgWt').textContent = avg('waiting');
  $('avgRt').textContent = avg('response');
}

function renderGantt(gantt) {
  $('gantt').innerHTML = gantt.map((g, i) => `
    <div class="seg" style="--d:${g.end - g.start}">
      <div class="bar ${g.idle ? 'idle' : ''}" style="--c:${g.idle ? 'none' : colorOf(g.id)}">${g.idle ? 'Idle' : esc(g.id)}</div>
      <span class="tick">${g.start}</span>
      ${i === gantt.length - 1 ? `<span class="tick end">${g.end}</span>` : ''}
    </div>`).join('');
}

/* ---------- Events ---------- */
$('procForm').addEventListener('submit', addProcess);
$('runBtn').addEventListener('click', run);

$('tabs').addEventListener('click', e => {
  const btn = e.target.closest('.tab');
  if (!btn) return;
  document.querySelectorAll('.tab').forEach(b => b.classList.toggle('active', b === btn));
  currentAlgo = btn.dataset.algo;
  $('rrConfig').hidden = currentAlgo !== 'rr';
  if (processes.length) run();
});

document.querySelector('.themes').addEventListener('click', e => {
  const btn = e.target.closest('.swatch');
  if (btn) setTheme(btn.dataset.theme);
});

$('timeQuantum').addEventListener('input', () => { if (currentAlgo === 'rr' && processes.length) run(); });

$('sampleBtn').addEventListener('click', () => {
  processes = [
    { id: 'P1', arrival: 0, burst: 8, priority: 3 },
    { id: 'P2', arrival: 1, burst: 4, priority: 1 },
    { id: 'P3', arrival: 2, burst: 9, priority: 4 },
    { id: 'P4', arrival: 3, burst: 5, priority: 2 }
  ];
  renderInput();
  run();
});

$('clearBtn').addEventListener('click', () => {
  processes = [];
  notify();
  renderInput();
  $('results').hidden = true;
});

let saved = null;
try { saved = localStorage.getItem('theme'); } catch (e) { /* ignore */ }
setTheme(saved);
renderInput();
