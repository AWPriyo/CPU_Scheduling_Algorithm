<div align="center">

# ⚙️ CPU Scheduling Simulator

**Visualize how an operating system decides which process runs next.**
Add processes, pick an algorithm, and watch the Gantt chart and metrics update instantly.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![No Dependencies](https://img.shields.io/badge/dependencies-none-10b981?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-8b5cf6?style=for-the-badge)

</div>

<!-- Add a screenshot: save it as docs/screenshot.png and uncomment the line below
<p align="center"><img src="docs/screenshot.png" alt="CPU Scheduling Simulator" width="800"></p>
-->

---

## ✨ Features

- 🧮 **5 scheduling algorithms** — FCFS, SJF, SRTF, Priority and Round Robin
- 📊 **Proportional Gantt chart** — block width matches burst time, with time markers and **Idle** gaps
- 📈 **Instant metrics** — completion, turnaround, waiting and response time per process, plus averages
- 🎨 **4 color themes** — Blue, Pink, Purple and Green, remembered between visits
- ⚡ **Live updates** — switch algorithm, add or delete a process, and results refresh automatically
- 🧪 **One-click sample data** and input validation (duplicate IDs, invalid values)
- 📱 **Responsive** layout that works on desktop and mobile
- 🪶 **Zero dependencies** — plain HTML, CSS and JavaScript, no build step

---

## 🚀 Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/your-username/CPU_Scheduling_Algorithm.git

# 2. Open the folder
cd CPU_Scheduling_Algorithm

# 3. Open index.html in your browser (or use VS Code's Live Server)
```

No install, no server, no build. Just open `index.html`.

---

## 🕹️ How to Use

1. Enter a **Process ID**, **Arrival**, **Burst** and (optionally) **Priority**, then click **+ Add**.
2. Choose an algorithm from the tab bar. For **Round Robin**, set the **Time quantum**.
3. Click **▶ Run Simulation** to see the Gantt chart and results.
4. Pick a color theme from the **Theme** dots in the header.

> 💡 No data handy? Click **Load sample** to try a ready-made set of four processes.

---

## 🧠 Algorithms

| Algorithm | Type | Picks next process by | Tie-breaker |
|-----------|------|------------------------|-------------|
| **FCFS** | Non-preemptive | Earliest arrival | — |
| **SJF** | Non-preemptive | Shortest burst time | Earlier arrival |
| **SRTF** | Preemptive | Shortest *remaining* time (checked every time unit) | Earlier arrival |
| **Priority** | Non-preemptive | Lowest priority number (= highest priority) | Earlier arrival |
| **Round Robin** | Preemptive | Queue order, one time quantum at a time | New arrivals queue before the preempted process |

### 📐 Metrics

```
Turnaround Time = Completion Time − Arrival Time
Waiting Time    = Turnaround Time − Burst Time
Response Time   = First CPU Start − Arrival Time
```

### 🔍 Example (FCFS)

| Process | Arrival | Burst | Completion | Turnaround | Waiting | Response |
|:-------:|:-------:|:-----:|:----------:|:----------:|:-------:|:--------:|
| P1 | 0 | 8 | 8  | 8  | 0  | 0  |
| P2 | 1 | 4 | 12 | 11 | 7  | 7  |
| P3 | 2 | 9 | 21 | 19 | 10 | 10 |
| P4 | 3 | 5 | 26 | 23 | 18 | 18 |

**Averages:** Turnaround `15.25` · Waiting `8.75` · Response `8.75`

---

## 🎨 Customizing Themes

All colors live in CSS variables at the top of `style.css`. Edit a theme or add your own:

```css
[data-theme="orange"] {
  --a1: #f97316; --a2: #fbbf24;               /* main gradient */
  --rgb: 249, 115, 22; --rgb2: 251, 191, 36;  /* glow and tint */
  --t1: #fdba74; --t2: #fde68a;               /* heading and highlight text */
  --bg: #1a0f07;                              /* page background */
}
```

Then add a matching `<button class="swatch" data-theme="orange">` in `index.html`, a `.swatch[data-theme="orange"]` color in `style.css`, and `'orange'` to the `THEMES` array in `script.js`.

---

## 📁 Project Structure

```
CPU_Scheduling_Algorithm/
├── index.html   # Page layout and theme picker
├── style.css    # Themes (CSS variables) and styling
├── script.js    # Scheduling algorithms and rendering
└── README.md
```

---

## 🛣️ Roadmap

- [ ] Preemptive Priority scheduling
- [ ] Multilevel Queue / MLFQ
- [ ] Context-switch time option
- [ ] Export results as CSV or PNG
- [ ] Step-by-step animation mode

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m "Add amazing feature"`
4. Push the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. Add a `LICENSE` file to your repository to make it official.

---

<div align="center">

**Built by Abdul Wadud Priyo** · [GitHub](https://github.com/AWPriyo)

⭐ If this project helped you, consider giving it a star!

</div>
