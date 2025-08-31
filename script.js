// searh indexing module
import Fuse from "https://cdn.jsdelivr.net/npm/fuse.js@6.6.2/dist/fuse.esm.min.js";

// html element selection
const searchInput = document.querySelector(".search-input");
const searchSuggestionList = document.querySelector(".search-suggestion-list");
const searchBtn = document.querySelector(".search-btn");
const myLocationBtn = document.querySelector(".my-location-btn");
const weatherContainer = document.querySelector(".weather-container");
const cityDisplay = document.querySelector(".city-name");
const timeDisplay = document.querySelector(".time");
const weatherIcon = document.getElementById("weather-icon");
const tempDisplay = document.querySelector(".temp-value");
const weatherDetail = document.querySelector(".weather-feature");
const minTemperature = document.getElementById("min-temp-value");
const maxTemperature = document.getElementById("max-temp-value");
const feelsDisplay = document.querySelector(".feels");
const windDisplay = document.querySelector(".wind");
const visibilityDisplay = document.querySelector(".visibility");
const loader = document.querySelector(".loader");
const forecastContainer = document.querySelector(".forecast-container");

//forecast hemtl element selection
const feelsLike = document.querySelector(".feels-like-data");
const humidity = document.querySelector(".humidity-data");
const pressure = document.querySelector(".pressure-data");
const seaLevel = document.querySelector(".sea-level-data");
const visibility = document.querySelector(".visibility-data");

// api key
const apiKey = "31f4703ff72c9c542c374f19a042ab1c"; //  put in .env

//global variable
let lat;
let lon;
let currentForecastData;
let currentUnit = "c";
let currentResponse;
let currentForecastResponse;
let cityList = null;
let fuse;
const options = {
  keys: ["name"],
  threshold: 0.3, // fuzziness 1.  very fuzzy 0 = exact
};

let defaultResponse = {
  coord: {
    lon: 72.8479,
    lat: 19.0144,
  },
  weather: [
    {
      id: 804,
      main: "Clouds",
      description: "overcast clouds",
      icon: "04n",
    },
  ],
  base: "stations",
  main: {
    temp: 300.24,
    feels_like: 303.39,
    temp_min: 300.24,
    temp_max: 300.24,
    pressure: 1007,
    humidity: 83,
    sea_level: 1007,
    grnd_level: 1007,
  },
  visibility: 10000,
  wind: {
    speed: 8.53,
    deg: 235,
    gust: 10.83,
  },
  clouds: {
    all: 94,
  },
  dt: 1755870581,
  sys: {
    country: "IN",
    sunrise: 1755823898,
    sunset: 1755869510,
  },
  timezone: 19800,
  id: 1275339,
  name: "Mumbai",
  cod: 200,
};

function init() {
  // default weather details
  weatherForCurrentLocation();

  // refresh the time
  setInterval(() => {
    timeDisplay.textContent = `${getTimeWithOffset(
      currentResponse ? currentResponse.timezone : null
    )}`;
  }, 1000);

  //  update cityList
  fetchCityList()
    .then((response) => {
      fuse = new Fuse(cityList, options);
      console.log("fuse" + fuse);
    })
    .catch((error) => {
      console.log(error);
    });
}

async function fetchCityList() {
  try {
    const response = await fetch("cleaned.city.list.json");
    const data = await response.json();
    cityList = data;
  } catch (error) {
    console.error("Error loading JSON", error);
  }
}

//create new element
function updateStatus(textContent) {
  document.querySelector(".status").textContent = textContent;
}

// toggle weathercontainer
function toggleWeatherContainer(state) {
  if (state) weatherContainer.classList.add("weather-container-hidden");
  else weatherContainer.classList.remove("weather-container-hidden");
}

// default city =mumbai
function displaydefaultWeather() {
  display(defaultResponse);
}

// to faharenheit
function toFaharenheit(value) {
  return Math.round(((value - 273.15) * 9) / 5 + 32);
}
function toCelcius(value) {
  return Math.round(value - 273.15);
}

// get date
function getTimeWithOffset(offsetSeconds, utcSeconds = Date.now() / 1000) {
  if (!offsetSeconds) return;
  // Step 1: Add offset to the UTC timestamp
  const date = new Date((utcSeconds + offsetSeconds) * 1000);

  // Step 2: Format in UTC so JS doesn't re-apply your system's timezone
  return date.toLocaleString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "UTC",
  });
}

// display weather details
function display(data) {
  currentResponse = data;
  console.log(data);
  // no response
  if (data.cod != 200) {
    console.error(`HTTP Error! Status: ${data.message}`);
    updateStatus(data.message);
    return;
  }

  // city found
  cityDisplay.textContent = `${data.name}`;
  timeDisplay.textContent = `${getTimeWithOffset(data.timezone)}`;
  tempDisplay.textContent =
    currentUnit === "c"
      ? `${toCelcius(data.main.temp)}`
      : `${toFaharenheit(data.main.temp)}`;
  tempDisplay.nextElementSibling.textContent =
    currentUnit === "c" ? "°C" : "°F";
  weatherDetail.textContent = `${data.weather[0].description}`;
  weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
  console.log(data.weather[0].icon);
  minTemperature.textContent =
    currentUnit === "c"
      ? `${toCelcius(data.main.temp_min)}`
      : `${toFaharenheit(data.main.temp_min)}`;
  minTemperature.nextElementSibling.textContent =
    currentUnit === "c" ? "°C" : "°F";
  maxTemperature.textContent =
    currentUnit === "c"
      ? `${toCelcius(data.main.temp_max)}`
      : `${toFaharenheit(data.main.temp_max)}`;
  maxTemperature.nextElementSibling.textContent =
    currentUnit === "c" ? "°C" : "°F";

  // other weather details
  feelsLike.textContent =
    currentUnit === "c"
      ? `${toCelcius(data.main.feels_like)}`
      : `${toFaharenheit(data.main.feels_like)}`;
  feelsLike.nextElementSibling.textContent = currentUnit === "c" ? "°C" : "°F";

  humidity.textContent = `${data.main.humidity}`;
  visibility.textContent = `${data.visibility / 1000}`;
  seaLevel.textContent = `${data.main.sea_level}`;
  pressure.textContent = `${data.main.pressure}`;
}

function displayForecast(response) {
  console.log("inside the displayforecast");
  console.log(response);
  currentForecastData = response;

  // if no city found
  // if (response.cod!==200) {
  //     console.error(`HTTP Error! Status: ${response.message}`);
  //     updateStatus(response.message);
  //     return;
  // }

  // city found
  // cityDisplay.textContent = `${data.name}`;
  // timeDisplay.textContent = `${getTimeWithOffset(data.timezone)}`;
  // tempDisplay.textContent = currentUnit === "c" ? `${toCelcius(data.main.temp)}` : `${toFaharenheit(data.main.temp)}`;
  // tempDisplay.nextElementSibling.textContent = currentUnit === "c" ? "°C" : "°F";
  // weatherDetail.textContent = `${data.weather[0].description}`;
  // weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
  // console.log(data.weather[0].icon);
  // minTemperature.textContent = currentUnit === "c" ? `${toCelcius(data.main.temp_min)}` : `${toFaharenheit(data.main.temp_min)}`;
  // minTemperature.nextElementSibling.textContent = currentUnit === "c" ? "°C" : "°F";
  // maxTemperature.textContent = currentUnit === "c" ? `${toCelcius(data.main.temp_max)}` : `${toFaharenheit(data.main.temp_max)}`;
  // maxTemperature.nextElementSibling.textContent = currentUnit === "c" ? "°C" : "°F";
}

function toggleLoader(flag) {
  if (flag) loader.classList.remove("loader-hidden");
  else loader.classList.add("loader-hidden");
  return;
}

function geoCoding(cityName) {
  const url = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${apiKey}`;
  const fetchPromise = fetch(url);
  fetchPromise
    .then((response) => response.json())
    .then((data) => {
      lat = data[0].lat;
      lon = dat[0].lon;
    })
    .catch((error) => {
      console.error(error);
    });
  return { lat: lat, lon: lon };
}

function fetchByCityName(cityName) {
  toggleLoader(true);
  toggleWeatherContainer(true);
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}`;
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      display(data);
      toggleLoader(false);
      toggleWeatherContainer(false);
    })
    .catch((error) => {
      console.log("error is :::" + error);
    });
}

function fetchForecast(cityName) {
  const apiKey2 = "2fdf771693b3472699060834252808";
  toggleLoader(true);
  toggleWeatherContainer(true);
  const url = `http://api.weatherapi.com/v1/forecast.json?q=${cityName}&key=${apiKey2}&days=8`;
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      console.log("inside forecast then");
      displayForecast(data);
      toggleLoader(false);
      toggleWeatherContainer(false);
    })
    .catch((error) => {
      console.log("error is :::" + error);
    });
}

async function fetchByCoordinates(coordinates) {
  toggleLoader(true);
  toggleWeatherContainer(true);
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${coordinates.latitude}&lon=${coordinates.longitude}&appid=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    display(data);
    toggleLoader(false);
    toggleWeatherContainer(false);
  } catch {
    console.log("error");
  }
}

// weather for current location
function weatherForCurrentLocation(e) {
  toggleLoader(true);
  toggleWeatherContainer(true);
  if (!navigator.geolocation) return;
  navigator.geolocation.getCurrentPosition(showPosition, showError); // showPosition = callback
}

function showPosition(position) {
  fetchByCoordinates(position.coords).then(() => {
    fetchForecast(currentResponse.name);
  });
}

// error handling
function showError(error) {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      updateStatus("User denied location access.");
      break;
    case error.POSITION_UNAVAILABLE:
      updateStatus("Location info unavailable.");
      break;
    case error.TIMEOUT:
      updateStatus("Location request timed out.");
      break;
    default:
      updateStatus("An unknown error occurred.");
  }
  return;
}

// event functions
function search() {
  let input = searchInput.value.trim();
  // if empty search
  if (!input) return;
  input = input[0].toUpperCase() + input.slice(1);
  fetchByCityName(input);
  fetchForecast(input);
}

// change temp unit
function changeTempUnit(e) {
  document.querySelectorAll(".temp-unit-btn").forEach((btn) => {
    if (e.target !== btn && btn.classList.contains("active"))
      btn.classList.remove("active");
    e.target.classList.add("active");
    console.log("reached here");
    currentUnit = e.target.id === "celcius" ? "c" : "f";
    display(currentResponse);
  });
}

// load search list
function loadSearchList(e) {
  searchSuggestionList.innerHTML = "";
  if (!e.target.value) return;
  const input = e.target.value.toLowerCase();
  const result = fuse.search(input);
  // no city found
  if (result.length == 0) {
    const list = document.createElement("list");
    list.classList.add("suggestion-list");
    list.textContent = "No city found";
    searchSuggestionList.appendChild(list);
  }

  for (let i = 0; i < 10; i++) {
    if (cityList.includes(result[i])) continue; // still same name will appear, due to different coordinates
    const list = document.createElement("list");
    list.classList.add("suggestion-list");
    list.textContent = result[i].item.name;
    searchSuggestionList.appendChild(list);
  }
  document
    .querySelector(".search-suggestion-list")
    .addEventListener("click", (e) => {
      if (e.target === searchSuggestionList) return;
      let input = e.target.textContent.trim();
      searchSuggestionList.innerHTML = "";
      console.log("target hitted", e.target);
      input = input.toLowerCase();
      fetchByCityName(input);
      fetchForecast(input);
    });
}

//initial event
document.addEventListener("DOMContentLoaded", init);

//other events
searchBtn.addEventListener("click", search);
myLocationBtn.addEventListener("click", weatherForCurrentLocation);
document.querySelectorAll(".temp-unit-btn").forEach((btn) => {
  btn.addEventListener("click", changeTempUnit);
});
// keydown support
searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") search();
});

// input event
searchInput.addEventListener("input", loadSearchList);
