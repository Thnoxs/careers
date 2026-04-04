const totalDays = 366;
let progressData = JSON.parse(localStorage.getItem("protocol_data")) || {
  tech: {},
  pcm: {},
};

const ctx = document.getElementById("progressChart").getContext("2d");
const progressChart = new Chart(ctx, {
  type: "doughnut",
  data: {
    labels: ["Tech", "PCM", "Pending"],
    datasets: [
      {
        data: [0, 0, totalDays * 2],
        backgroundColor: ["#0f172a", "#64748b", "#f1f5f9"],
        borderWidth: 0,
        hoverOffset: 2,
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: true,
    cutout: "82%",
    plugins: { legend: { display: false }, tooltip: { enabled: false } },
    animation: { animateScale: true, duration: 800 },
  },
});

function initHeatmap() {
  const container = document.getElementById("heatmap-container");
  let heatmapHTML = "";
  for (let i = 1; i <= totalDays; i++) {
    heatmapHTML += `<div id="heat-${i}" class="w-3 h-3 rounded-[.125rem] bg-slate-100 border border-slate-200 transition-colors duration-200" title="Day ${i}"></div>`;
  }
  container.innerHTML = heatmapHTML;
}

function generateDateList() {
  const techContainer = document.getElementById("tech-list");
  const pcmContainer = document.getElementById("pcm-list");
  const startDate = new Date("2026-04-03");
  let currentDate = new Date(startDate);

  let techHTML = "";
  let pcmHTML = "";

  for (let i = 1; i <= totalDays; i++) {
    const options = { weekday: "short", month: "short", day: "numeric" };
    const formattedDate = currentDate.toLocaleDateString("en-US", options);

    const isTechChecked = progressData.tech[i] ? "checked" : "";
    const isPcmChecked = progressData.pcm[i] ? "checked" : "";

    const itemTemplate = (type, id, checked) => `
            <label class="flex items-center gap-4 p-2.5 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors group">
              <input type="checkbox" id="${type}-check-${id}" class="minimal-checkbox" ${checked} onchange="handleInteraction('${type}', ${id})">
              <div class="flex-grow flex justify-between items-center">
                <p class="text-slate-800 font-medium text-sm group-hover:text-black transition-colors">${formattedDate}</p>
                <p class="text-[.625rem] text-slate-400 font-mono tracking-wider">DAY ${id}</p>
              </div>
            </label>
          `;

    techHTML += itemTemplate("tech", i, isTechChecked);
    pcmHTML += itemTemplate("pcm", i, isPcmChecked);
    currentDate.setDate(currentDate.getDate() + 1);
  }
  techContainer.innerHTML = techHTML;
  pcmContainer.innerHTML = pcmHTML;
}

function handleInteraction(type, id) {
  const checkbox = document.getElementById(`${type}-check-${id}`);
  const sound = document.getElementById("tick-sound");

  // Save to memory object
  progressData[type][id] = checkbox.checked;
  localStorage.setItem("protocol_data", JSON.stringify(progressData));

  // Play Sound if checked
  if (checkbox.checked) {
    sound.currentTime = 0;
    sound.play();
  }

  updateStats();
}

function updateStats() {
  let techCompleted = 0;
  let pcmCompleted = 0;

  for (let i = 1; i <= totalDays; i++) {
    const isTech = progressData.tech[i];
    const isPcm = progressData.pcm[i];
    const heatSquare = document.getElementById(`heat-${i}`);

    let dayScore = 0;
    if (isTech) {
      dayScore++;
      techCompleted++;
    }
    if (isPcm) {
      dayScore++;
      pcmCompleted++;
    }

    if (heatSquare) {
      if (dayScore === 0)
        heatSquare.className =
          "w-3 h-3 rounded-[.125rem] bg-slate-100 border border-slate-200";
      else if (dayScore === 1)
        heatSquare.className =
          "w-3 h-3 rounded-[.125rem] bg-green-400 border border-green-500";
      else if (dayScore === 2)
        heatSquare.className =
          "w-3 h-3 rounded-[.125rem] bg-green-700 border border-green-800";
    }
  }

  const remaining = totalDays * 2 - (techCompleted + pcmCompleted);
  progressChart.data.datasets[0].data = [
    techCompleted,
    pcmCompleted,
    remaining,
  ];
  progressChart.update();

  document.getElementById("tech-count").innerText =
    `${techCompleted}/${totalDays}`;
  document.getElementById("pcm-count").innerText =
    `${pcmCompleted}/${totalDays}`;
}

function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("active");
}

window.onload = () => {
  initHeatmap();
  generateDateList();
  updateStats();
};
