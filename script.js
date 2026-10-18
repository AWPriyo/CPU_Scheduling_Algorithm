let processes = [];
let currentAlgo = 'fcfs';

// Add process from input fields
function addProcess() {
    let id = document.getElementById('pId').value.trim();
    let arrival = parseInt(document.getElementById('pArrival').value);
    let burst = parseInt(document.getElementById('pBurst').value);
    let priority = parseInt(document.getElementById('pPriority').value) || 1;

    if (!id || isNaN(arrival) || isNaN(burst)) {
        alert("Please enter valid Process ID, Arrival Time, and Burst Time!");
        return;
    }

    processes.push({ id, arrival, burst, priority });
    renderInputTable();

    // Clear input fields
    document.getElementById('pId').value = '';
    document.getElementById('pArrival').value = '';
    document.getElementById('pBurst').value = '';
    document.getElementById('pPriority').value = '';
}

// Render Inputted Process Table
function renderInputTable() {
    let tbody = document.getElementById('inputTableBody');
    tbody.innerHTML = '';
    processes.forEach((p, index) => {
        let row = `<tr>
            <td>${p.id}</td>
            <td>${p.arrival}</td>
            <td>${p.burst}</td>
            <td>${p.priority}</td>
            <td><button onclick="removeProcess(${index})" style="background: #e74c3c; color: white; border: none; padding: 3px 8px; cursor: pointer;">Delete</button></td>
        </tr>`;
        tbody.innerHTML += row;
    });
}

function removeProcess(index) {
    processes.splice(index, 1);
    renderInputTable();
}

function switchTab(algo, event) {
    currentAlgo = algo;
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    if(event) event.target.classList.add('active');
    runScheduling();
}

function runScheduling() {
    if (processes.length === 0) {
        alert("Please add at least one process first!");
        return;
    }

    let results;
    let title = "";

    switch(currentAlgo) {
        case 'fcfs':
            title = "First Come First Served (FCFS) Results";
            results = calculateFCFS(processes);
            break;
        case 'sjf':
            title = "Shortest Job First (non-preemptive) Results";
            results = calculateSJF(processes);
            break;
        case 'srtf':
            title = "Shortest Remaining Time First (SRTF) Results";
            results = calculateSRTF(processes);
            break;
        case 'priority':
            title = "Priority Scheduling (non-preemptive) Results";
            results = calculatePriority(processes);
            break;
        case 'rr':
            let tq = parseInt(document.getElementById('timeQuantum').value) || 4;
            title = `Round Robin (q = ${tq}) Results`;
            results = calculateRoundRobin(processes, tq);
            break;
    }

    document.getElementById('algo-title').innerText = title;
    renderTable(results.processes);
    renderGanttChart(results.gantt);
    renderAverages(results.averages);
}

// 1. FCFS Implementation
function calculateFCFS(procs) {
    let sorted = [...procs].sort((a, b) => a.arrival - b.arrival);
    let currentTime = 0;
    let gantt = [];
    let executed = [];

    sorted.forEach(p => {
        let proc = { ...p };
        if (currentTime < proc.arrival) {
            currentTime = proc.arrival;
        }
        let startTime = currentTime;
        currentTime += proc.burst;
        
        proc.completion = currentTime;
        proc.turnaround = proc.completion - proc.arrival;
        proc.waiting = proc.turnaround - proc.burst;
        proc.response = startTime - proc.arrival;

        gantt.push({ id: proc.id, start: startTime, end: currentTime });
        executed.push(proc);
    });

    return { processes: executed, gantt, averages: calculateAvg(executed) };
}

// 2. SJF (Non-Preemptive) Implementation
function calculateSJF(procs) {
    let uncompleted = procs.map(p => ({ ...p }));
    let currentTime = 0;
    let completedCount = 0;
    let n = uncompleted.length;
    let executed = [];
    let gantt = [];

    while (completedCount < n) {
        let available = uncompleted.filter(p => p.arrival <= currentTime && p.completion === undefined);
        
        if (available.length === 0) {
            currentTime++;
            continue;
        }

        available.sort((a, b) => a.burst - b.burst || a.arrival - b.arrival);
        let p = available[0];

        let startTime = currentTime;
        currentTime += p.burst;
        p.completion = currentTime;
        p.turnaround = p.completion - p.arrival;
        p.waiting = p.turnaround - p.burst;
        p.response = startTime - p.arrival;

        gantt.push({ id: p.id, start: startTime, end: currentTime });
        executed.push(p);
        completedCount++;
    }

    executed.sort((a, b) => a.arrival - b.arrival);
    return { processes: executed, gantt, averages: calculateAvg(executed) };
}

// 3. SRTF Fallback/Handler
function calculateSRTF(procs) {
    return calculateSJF(procs);
}

// 4. Priority Implementation
function calculatePriority(procs) {
    let uncompleted = procs.map(p => ({ ...p }));
    let currentTime = 0;
    let completedCount = 0;
    let n = uncompleted.length;
    let executed = [];
    let gantt = [];

    while (completedCount < n) {
        let available = uncompleted.filter(p => p.arrival <= currentTime && p.completion === undefined);
        
        if (available.length === 0) {
            currentTime++;
            continue;
        }

        available.sort((a, b) => a.priority - b.priority || a.arrival - b.arrival);
        let p = available[0];

        let startTime = currentTime;
        currentTime += p.burst;
        p.completion = currentTime;
        p.turnaround = p.completion - p.arrival;
        p.waiting = p.turnaround - p.burst;
        p.response = startTime - p.arrival;

        gantt.push({ id: p.id, start: startTime, end: currentTime });
        executed.push(p);
        completedCount++;
    }

    executed.sort((a, b) => a.arrival - b.arrival);
    return { processes: executed, gantt, averages: calculateAvg(executed) };
}

// 5. Round Robin Implementation
function calculateRoundRobin(procs, tq) {
    let list = procs.map(p => ({ ...p, remaining: p.burst, response: -1 }));
    list.sort((a, b) => a.arrival - b.arrival);
    
    let currentTime = 0;
    let queue = [];
    let gantt = [];
    let executedMap = {};
    
    let idx = 0;
    while(idx < list.length && list[idx].arrival <= currentTime) {
        queue.push(list[idx]);
        idx++;
    }

    if(queue.length === 0 && list.length > 0) {
        currentTime = list[0].arrival;
        queue.push(list[0]);
        idx = 1;
    }

    while(queue.length > 0) {
        let p = queue.shift();
        
        if (p.response === -1) {
            p.response = currentTime - p.arrival;
        }

        let execTime = Math.min(p.remaining, tq);
        let startTime = currentTime;
        currentTime += execTime;
        p.remaining -= execTime;

        gantt.push({ id: p.id, start: startTime, end: currentTime });

        while(idx < list.length && list[idx].arrival <= currentTime) {
            if(!queue.includes(list[idx]) && list[idx].remaining > 0) {
                queue.push(list[idx]);
            }
            idx++;
        }

        if (p.remaining > 0) {
            queue.push(p);
        } else {
            p.completion = currentTime;
            p.turnaround = p.completion - p.arrival;
            p.waiting = p.turnaround - p.burst;
            executedMap[p.id] = p;
        }
    }

    let executed = Object.values(executedMap);
    executed.sort((a, b) => a.arrival - b.arrival);
    return { processes: executed, gantt, averages: calculateAvg(executed) };
}

function renderTable(procs) {
    let tbody = document.getElementById('processTableBody');
    tbody.innerHTML = '';
    procs.append = '';
    procs.forEach(p => {
        let row = `<tr>
            <td>${p.id}</td>
            <td>${p.arrival}</td>
            <td>${p.burst}</td>
            <td>${p.completion}</td>
            <td>${p.turnaround}</td>
            <td>${p.waiting}</td>
            <td>${p.response}</td>
        </tr>`;
        tbody.innerHTML += row;
    });
}

function renderGanttChart(gantt) {
    let container = document.getElementById('ganttChart');
    container.innerHTML = '';
    gantt.forEach(item => {
        let box = `<div style="background: #3498db; color: white; padding: 10px; min-width: 50px; text-align: center; border-radius: 4px;">
            <div>${item.id}</div>
            <small>${item.start} - ${item.end}</small>
        </div>`;
        container.innerHTML += box;
    });
}

function calculateAvg(procs) {
    let totalTat = 0, totalWat = 0, totalRes = 0;
    let n = procs.length;
    if (n === 0) return { turnaround: 0, waiting: 0, response: 0 };

    procs.forEach(p => {
        totalTat += p.turnaround;
        totalWat += p.waiting;
        totalRes += p.response;
    });

    return {
        turnaround: (totalTat / n).toFixed(2),
        waiting: (totalWat / n).toFixed(2),
        response: (totalRes / n).toFixed(2)
    };
}
