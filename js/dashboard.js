// Dummy load profile data after 2 seconds for demo
setTimeout(() => {
  document.getElementById("farmerName").textContent = "Ramesh Kumar";
  document.getElementById("fullName").textContent = "Ramesh Kumar";
  document.getElementById("farmerId").textContent = "F12345";
  document.getElementById("age").textContent = "45";
  document.getElementById("gender").textContent = "Male";
  document.getElementById("phone").textContent = "+91 9876543210";
  document.getElementById("aadhar").textContent = "XXXX-XXXX-1234";
  document.getElementById("address").textContent = "Village ABC, District XYZ, State";
  document.getElementById("landSize").textContent = "2 acres";
  document.getElementById("farmingType").textContent = "Organic";
  document.getElementById("crops").textContent = "Wheat, Rice";
  document.getElementById("bankLinked").textContent = "Yes";
  document.getElementById("weatherData").textContent = "Sunny, 30°C";
}, 2000);

// Interactive Calendar JS
(() => {
  const monthYear = document.getElementById("month-year");
  const calendarBody = document.getElementById("calendar-body");
  const prevBtn = document.getElementById("prev-month");
  const nextBtn = document.getElementById("next-month");
  const taskDateInput = document.getElementById("task-date");
  const taskTextInput = document.getElementById("task-text");
  const addTaskBtn = document.getElementById("add-task");
  const taskList = document.getElementById("task-list");

  let today = new Date();
  let currentMonth = today.getMonth();
  let currentYear = today.getFullYear();

  // Load tasks from localStorage or initialize
  let tasks = JSON.parse(localStorage.getItem("krishiTasks") || "{}");

  function renderCalendar(month, year) {
    calendarBody.innerHTML = "";

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    monthYear.textContent = `${new Date(year, month).toLocaleString("default", {month:"long"})} ${year}`;

    let date = 1;
    for (let i = 0; i < 6; i++) {  // 6 weeks max
      let row = document.createElement("tr");

      for (let j = 0; j < 7; j++) {
        let cell = document.createElement("td");
        if (i === 0 && j < firstDay) {
          cell.textContent = "";
        } else if (date > daysInMonth) {
          cell.textContent = "";
        } else {
          cell.textContent = date;

          const cellDate = new Date(year, month, date).toISOString().split("T")[0];
          if (tasks[cellDate]) {
            cell.classList.add("task-day");
            cell.title = tasks[cellDate].join(", ");
          }
          if (
            date === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear()
          ) {
            cell.classList.add("today");
          }

          date++;
        }
        row.appendChild(cell);
      }
      calendarBody.appendChild(row);
    }
  }

  function renderTaskList() {
    taskList.innerHTML = "";
    let dates = Object.keys(tasks).sort();
    if (dates.length === 0) {
      taskList.innerHTML = "<li>No upcoming tasks</li>";
      return;
    }
    for (const date of dates) {
      for (const task of tasks[date]) {
        const li = document.createElement("li");
        li.textContent = `${date}: ${task}`;
        taskList.appendChild(li);
      }
    }
  }

  addTaskBtn.addEventListener("click", () => {
    const dateVal = taskDateInput.value;
    const taskVal = taskTextInput.value.trim();

    if (!dateVal) {
      alert("Please select a date");
      return;
    }
    if (!taskVal) {
      alert("Please enter a task");
      return;
    }

    if (!tasks[dateVal]) tasks[dateVal] = [];
    tasks[dateVal].push(taskVal);

    localStorage.setItem("krishiTasks", JSON.stringify(tasks));
    taskTextInput.value = "";
    taskDateInput.value = "";

    renderCalendar(currentMonth, currentYear);
    renderTaskList();
  });

  prevBtn.addEventListener("click", () => {
    currentMonth--;
    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    }
    renderCalendar(currentMonth, currentYear);
  });

  nextBtn.addEventListener("click", () => {
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
    renderCalendar(currentMonth, currentYear);
  });

  // Initial render
  renderCalendar(currentMonth, currentYear);
  renderTaskList();
})();

// Real-time News Fetcher
(async function fetchNews() {
  const newsList = document.getElementById("news-list");
  const API_KEY = "YOUR_NEWSAPI_KEY_HERE"; // <-- Replace with your NewsAPI key
  const url = `https://newsapi.org/v2/everything?q=agriculture%20India&language=en&sortBy=publishedAt&pageSize=5&apiKey=${API_KEY}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("News fetch failed");
    const data = await response.json();

    newsList.innerHTML = "";

    if (data.articles.length === 0) {
      newsList.innerHTML = "<li>No news available right now.</li>";
      return;
    }

    data.articles.forEach(article => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = article.url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.textContent = article.title;
      li.appendChild(a);
      newsList.appendChild(li);
    });
  } catch (err) {
    newsList.innerHTML = "<li>Failed to load news.</li>";
    console.error(err);
  }
})();
// ==== CONFIG ====
// Replace these with your own API keys:
const WEATHER_API_KEY = 'YOUR_OPENWEATHERMAP_API_KEY';
const NEWS_API_KEY = 'YOUR_NEWSAPI_KEY';

// ==== Profile summary (load from localStorage) ====

function loadProfileSummary() {
  const profile = JSON.parse(localStorage.getItem('farmerProfile') || '{}');
  document.getElementById('profileName').textContent = profile.fullName || 'Not set';
  document.getElementById('profileId').textContent = profile.farmerId || 'FARM123456';
  document.getElementById('profileLandSize').textContent = profile.landSize || 'N/A';
  document.getElementById('profileCrops').textContent = profile.crops || 'N/A';
}

// ==== Weather Fetcher ====

async function fetchWeather() {
  const profile = JSON.parse(localStorage.getItem('farmerProfile') || '{}');
  // Default city fallback
  let city = 'New Delhi';
  if (profile.village) city = profile.village;
  else if (profile.district) city = profile.district;
  else if (profile.state) city = profile.state;

  const weatherDataElem = document.getElementById('weatherData');
  weatherDataElem.textContent = 'Loading weather...';

  try {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${WEATHER_API_KEY}&units=metric`);
    if (!response.ok) throw new Error('Weather data not found');
    const data = await response.json();

    weatherDataElem.innerHTML = `
      Location: ${data.name} <br/>
      Temperature: ${data.main.temp} °C <br/>
      Weather: ${data.weather[0].description} <br/>
      Humidity: ${data.main.humidity}% <br/>
      Wind Speed: ${data.wind.speed} m/s
    `;
  } catch (err) {
    weatherDataElem.textContent = 'Unable to fetch weather data.';
  }
}

// ==== News Fetcher ====

async function fetchNews() {
  const newsList = document.getElementById('newsList');
  newsList.innerHTML = '<li>Loading news...</li>';
  try {
    const response = await fetch(`https://newsapi.org/v2/top-headlines?category=science&apiKey=${NEWS_API_KEY}&q=agriculture&language=en&pageSize=5`);
    if (!response.ok) throw new Error('News fetch failed');
    const data = await response.json();

    if (data.articles.length === 0) {
      newsList.innerHTML = '<li>No news found.</li>';
      return;
    }

    newsList.innerHTML = '';
    data.articles.forEach(article => {
      const li = document.createElement('li');
      li.innerHTML = `<a href="${article.url}" target="_blank">${article.title}</a>`;
      newsList.appendChild(li);
    });
  } catch (err) {
    newsList.innerHTML = '<li>Unable to fetch news.</li>';
  }
}

// ==== Calendar ====
// Calendar Variables
const calendarBody = document.getElementById('calendar-body');
const monthAndYear = document.getElementById('monthAndYear');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');
const taskForm = document.getElementById('task-form');
const taskDateInput = document.getElementById('task-date');
const taskTextInput = document.getElementById('task-text');
const taskList = document.getElementById('task-list');

let today = new Date();
let currentMonth = today.getMonth();
let currentYear = today.getFullYear();

const months = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];

function loadTasks() {
  return JSON.parse(localStorage.getItem('farmingTasks') || '{}');
}

function saveTasks(tasks) {
  localStorage.setItem('farmingTasks', JSON.stringify(tasks));
}

function showTasks(dateStr) {
  const tasks = loadTasks();
  taskList.innerHTML = '';
  if (!tasks[dateStr] || tasks[dateStr].length === 0) {
    taskList.innerHTML = '<li>No tasks for selected date.</li>';
    return;
  }
  tasks[dateStr].forEach((task, i) => {
    const li = document.createElement('li');
    li.textContent = task;
    const delBtn = document.createElement('button');
    delBtn.textContent = 'X';
    delBtn.addEventListener('click', () => {
      tasks[dateStr].splice(i, 1);
      if (tasks[dateStr].length === 0) delete tasks[dateStr];
      saveTasks(tasks);
      showTasks(dateStr);
      renderCalendar(currentMonth, currentYear);
    });
    li.appendChild(delBtn);
    taskList.appendChild(li);
  });
}

function renderCalendar(month, year) {
  calendarBody.innerHTML = '';
  monthAndYear.textContent = `${months[month]} ${year}`;

  let firstDay = (new Date(year, month)).getDay();
  let daysInMonth = 32 - new Date(year, month, 32).getDate();

  let tasks = loadTasks();

  let date = 1;
  for (let i = 0; i < 6; i++) { // 6 weeks max
    let row = document.createElement('tr');
    for (let j = 0; j < 7; j++) {
      if (i === 0 && j < firstDay) {
        let cell = document.createElement('td');
        cell.textContent = '';
        row.appendChild(cell);
      } else if (date > daysInMonth) {
        break;
      } else {
        let cell = document.createElement('td');
        cell.textContent = date;

        // Mark today
        if (date === today.getDate() && year === today.getFullYear() && month === today.getMonth()) {
          cell.classList.add('today');
        }

        // Mark days with tasks
        const dateStr = `${year}-${(month+1).toString().padStart(2,'0')}-${date.toString().padStart(2,'0')}`;
        if (tasks[dateStr]) {
          cell.classList.add('task-day');
          cell.title = `Tasks: ${tasks[dateStr].length}`;
        }

        // On clicking a date, show tasks for that day
        cell.addEventListener('click', () => {
          taskDateInput.value = dateStr;
          showTasks(dateStr);
        });

        row.appendChild(cell);
        date++;
      }
    }
    calendarBody.appendChild(row);
  }
}

prevMonthBtn.addEventListener('click', () => {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  renderCalendar(currentMonth, currentYear);
});

nextMonthBtn.addEventListener('click', () => {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  renderCalendar(currentMonth, currentYear);
});

taskForm.addEventListener('submit', e => {
  e.preventDefault();
  const date = taskDateInput.value;
  const task = taskTextInput.value.trim();
  if (!date || !task) return;

  let tasks = loadTasks();
  if (!tasks[date]) tasks[date] = [];
  tasks[date].push(task);
  saveTasks(tasks);
  taskTextInput.value = '';
  showTasks(date);
  renderCalendar(currentMonth, currentYear);
});

// ==== Soil Health & Pest Alerts Mock Data ====

function loadSoilHealth() {
  // Example static values or could be from an API or localStorage
  document.getElementById('soilPh').textContent = '6.8 (Ideal)';
  document.getElementById('organicMatter').textContent = '3.2% (Good)';
  document.getElementById('soilRecommendations').textContent = 'Add compost and lime if pH drops.';
}

function loadPestAlerts() {
  const pestList = document.getElementById('pestList');
  // Example: In real, would come from API or government alerts based on region
  const alerts = [
    'Locust swarm reported nearby - increased vigilance required.',
    'Aphid infestation detected in the last week.',
  ];
  if (alerts.length === 0) {
    pestList.innerHTML = '<li>No pest alerts in your area.</li>';
  } else {
    pestList.innerHTML = '';
    alerts.forEach(alert => {
      const li = document.createElement('li');
      li.textContent = alert;
      pestList.appendChild(li);
    });
  }
}

// ==== Initialize ====

function initDashboard() {
  loadProfileSummary();
  fetchWeather();
  fetchNews();
  renderCalendar(currentMonth, currentYear);
  loadSoilHealth();
  loadPestAlerts();
}

window.onload = initDashboard;
