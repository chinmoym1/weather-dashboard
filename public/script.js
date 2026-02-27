const temperatureEl = document.getElementById("temperature");
const cityEl = document.getElementById("cityName");
const countryEl = document.getElementById("countryName");
const humidityEl = document.getElementById("humidity");
const windEl = document.getElementById("wind");
const precipEl = document.getElementById("precip");
const timeEl = document.getElementById("time");
const dateEl = document.getElementById("date");

const forecastSection = document.getElementById("forecastSection");
const slideLeftBtn = document.getElementById("slideLeft");
const slideRightBtn = document.getElementById("slideRight");
const forecastContainer = document.getElementById("forecastContainer");
const forecastCityEl = document.getElementById("forecastCity");

const errorSection = document.getElementById("errorSection");
const errorMessageEl = document.getElementById("errorMessage");

const menuToggle = document.getElementById("menuToggle");
const closeMenu = document.getElementById("closeMenu");
const navbar = document.querySelector(".navbar");
const overlay = document.getElementById("overlay");

const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");

const cardTemps = document.querySelectorAll(".cardTemp");

// Fetch weather data
async function getWeather(city) {
  errorSection.style.display = "none";
  forecastSection.style.display = "block";

  try {
    const response = await fetch(`/weather?city=${encodeURIComponent(city)}`);

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || "Failed to fetch weather data");
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    updateWeather(data);
    showForecast(data);
  } catch (error) {
    showError(error.message);
  }
}

// Show error UI
function showError(message) {
  forecastSection.style.display = "none";
  errorMessageEl.textContent = message;
  errorSection.style.display = "block";
}

// Update current weather section
function updateWeather(data) {
  const location = data.location;
  const current = data.current;

  const localTime = new Date(location.localtime);

  temperatureEl.textContent = Math.round(current.temp_c) + "°C";
  cityEl.textContent = location.name;
  countryEl.textContent = location.country;
  humidityEl.textContent = current.humidity + "%";
  windEl.textContent = current.wind_kph + " km/h";
  precipEl.textContent = current.precip_mm + " mm";

  timeEl.textContent = localTime.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  dateEl.textContent = localTime.toDateString();
}

async function loadStaticCardTemps() {
  const cards = document.querySelectorAll(".card");

  cards.forEach(async (card) => {
    const city = card.querySelector("h3").textContent.trim();

    try {
      const response = await fetch(`/weather?city=${encodeURIComponent(city)}`);
      const data = await response.json();

      const temp = data.current?.temp_c ?? null;

      if (temp === null) throw new Error("Temp not found");

      card.querySelector(".cardTemp").textContent = Math.round(temp) + "°C";
    } catch (error) {
      console.error("Error loading", city, error);
      card.querySelector(".cardTemp").textContent = "N/A";
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  loadStaticCardTemps();
});

// Render 7-day forecast
function showForecast(data) {
  forecastContainer.innerHTML = "";
  forecastCityEl.textContent = data.location.name;

  const forecastDays = data.forecast.forecastday;

  for (let i = 0; i < forecastDays.length; i++) {
    const day = forecastDays[i];
    const dateObj = new Date(day.date);

    const card = document.createElement("div");
    card.classList.add("forecast-card");

    const dayText = document.createElement("p");
    dayText.textContent =
      dateObj.getDate() +
      " " +
      dateObj.toLocaleDateString("en-US", { weekday: "short" });

    const icon = document.createElement("img");
    icon.src = "https:" + day.day.condition.icon;
    icon.alt = day.day.condition.text;

    const tempText = document.createElement("p");
    tempText.textContent =
      Math.round(day.day.maxtemp_c) +
      "° / " +
      Math.round(day.day.mintemp_c) +
      "°";

    card.appendChild(dayText);
    card.appendChild(icon);
    card.appendChild(tempText);

    forecastContainer.appendChild(card);
  }
}

// Default city on load
getWeather("Mumbai");

// card click events
const cityCards = document.querySelectorAll(".card");

cityCards.forEach((card) => {
  card.addEventListener("click", function () {
    const selectedCity = this.querySelector("h3").textContent.trim();
    getWeather(selectedCity);
  });
});

slideRightBtn.addEventListener("click", function () {
  forecastContainer.scrollBy({
    left: 300,
    behavior: "smooth",
  });
});

slideLeftBtn.addEventListener("click", function () {
  forecastContainer.scrollBy({
    left: -300,
    behavior: "smooth",
  });
});

// hamburger button
menuToggle.addEventListener("click", function () {
  navbar.classList.add("active");
  overlay.classList.add("active");

  // Hide hamburger when open
  menuToggle.style.display = "none";
});

function closeSidebar() {
  navbar.classList.remove("active");
  overlay.classList.remove("active");

  // Show hamburger again
  menuToggle.style.display = "block";
}

closeMenu.addEventListener("click", closeSidebar);
overlay.addEventListener("click", closeSidebar);

// search button
searchBtn.addEventListener("click", function () {
  const city = searchInput.value.trim();

  if (city !== "") {
    getWeather(city);
    searchInput.value = "";
  }
});

searchInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    const city = searchInput.value.trim();

    if (city !== "") {
      getWeather(city);
      searchInput.value = "";
    }
  }
});

const ctx = document.getElementById("weatherChart");

new Chart(ctx, {
  type: 'line',
  data: {
    labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
    datasets: [{
      label: 'Weather Graph',
      data: [12, 19, 3, 5, 2, 3],
      borderWidth: 1
    }]
  },
  options: {
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }
});

// async function buildWeatherChart() {
//     try {
//         const response = await fetch(`/weather?city=${encodeURIComponent(city)}`);
//         const data = await response.json();

//         const hourlyArray = data.forecast.forecastday[0].hour;
//       // const forecastDays = data.forecast.forecastday;


//         const labels = hourlyArray.map(item => item.time.split(' ')[1]);
//         const temps = hourlyArray.map(item => item.temp_c);

//         // 3. Initialize the Chart
//         const ctx = document.getElementById('weatherChart').getContext('2d');
//         new Chart(ctx, {
//             type: 'line',
//             data: {
//                 labels: labels,
//                 datasets: [{
//                     label: `Temperature in ${location} (°C)`,
//                     data: temps,
//                     borderColor: 'rgb(75, 192, 192)',
//                     backgroundColor: 'rgba(75, 192, 192, 0.2)',
//                     fill: true,
//                     tension: 0.4
//                 }]
//             },
//             options: {
//                 scales: {
//                     y: { beginAtZero: false }
//                 }
//             }
//         });
//     } catch (error) {
//         console.error("Error fetching weather data:", error);
//     }
// }

// buildWeatherChart();
