import "./reset.css";
import "./styles.css";

const cityStateCountryForm = document.getElementById("city-state-country-form");
const zipForm = document.getElementById("zip-form");
const apiKey = "25ebb3362c8bb9c678ff8bdb405e9717";
const giphyApiKey = "gnEIsZZKYTdtq54Z9zyzL6Pd0ALjfL3o";
const limit = 1;

// Form Validation
// Top Form
const zip = document.getElementById("zip-code");
const zipError = document.getElementById("zip-error");
const zipCodeRegExp = /^\d{5}$/;

function isValidZipCode() {
  if (zip.value.length === 0 || zipCodeRegExp.test(zip.value) === false) {
    return false;
  }
  return true;
}

function showZipCodeError() {
  if (zip.value.length === 0) {
    zipError.innerText = "Zip Code is required";
  } else if (zipCodeRegExp.test(zip.value) === false) {
    zipError.innerText = "Please enter a valid 5-digit zip code.";
  }
  zip.className = "invalid";
}

function showZipCodeValid() {
  zip.className = "valid";
  zipError.innerText = "";
}

function validateZipCode() {
  if (isValidZipCode() === false) {
    showZipCodeError();
  } else {
    showZipCodeValid();
  }
}

zip.addEventListener("input", validateZipCode);

// Bottom Form Validation

async function displayWeather(...args) {
  // Need to chain promises
  try {
    const location = await getLatLon(...args);
    const weather = await getWeather(location);
    showWeather(weather);
  } catch (error) {
    console.log(error);
  }
}

// Send Geocoding API Request
async function getLatLon(...args) {
  let response;
  if (args.length > 2) {
    const city = args[0];
    const country = args[1];
    const state = args[2];
    response = await fetch(
      `http://api.openweathermap.org/geo/1.0/direct?q=${city},${state},${country}&limit=${limit}&appid=${apiKey}`
    );
  } else {
    const zip = args[0];
    const country = args[1];
    response = await fetch(
      `http://api.openweathermap.org/geo/1.0/zip?zip=${zip},${country}&appid=${apiKey}`
    );
  }
  const data = await response.json();
  console.log("Latitude and Longitude Data:");
  console.log(data);
  return data;
}

// Send Weather API Request
async function getWeather(location) {
  const { lat } = location;
  const { lon } = location;
  const units = getTempFormat();
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${units}&appid=${apiKey}`
  );
  const data = await response.json();
  console.log("Weather Data:");
  console.log(data);
  return data;
}

function stringToRoundedInt(str) {
  return Math.round(parseInt(str));
}

// Temperature Unit Toggle

const tempButton = document.getElementById("temp-button");

function getTempFormat() {
  if (tempButton.checked === true) {
    return "metric";
  }
  return "imperial";
}

const gif = document.getElementById("weather-gif");

function newImage(searchPhrase) {
  fetch(
    `https://api.giphy.com/v1/gifs/translate?api_key=${giphyApiKey}&s=${searchPhrase}`,
    { mode: "cors" }
  )
    .then((response) => response.json())
    .then((response) => {
      gif.src = response.data.images.original.url;
    })
    .catch((error) => {
      // Default gif if there is an error
      gif.src = "https://media.giphy.com/media/xT0xeQqkv9Iyw/giphy.gif";
    });
}

function addWeatherGif(searchTerm) {
  newImage(searchTerm);
}

const cityOutput = document.getElementById("output-city");
const countryOutput = document.getElementById("output-country");
const weatherDescription = document.getElementById("weather-description");
const tempOutput = document.getElementById("output-temperature");
const feelsLikeOutput = document.getElementById("output-feels-like");
const lowOutput = document.getElementById("output-low");
const highOutput = document.getElementById("output-high");
const windOutput = document.getElementById("output-wind");

// Display Weather Data

function showWeather(data) {
  let degreeUnit = "";
  let speedUnit = "";
  if (getTempFormat() === "imperial") {
    degreeUnit = "F";
    speedUnit = "mph";
  } else {
    degreeUnit = "C";
    speedUnit = "kph";
  }
  cityOutput.innerText = data.name;
  countryOutput.innerText = data.sys.country;
  let { description } = data.weather[0];
  description = description.charAt(0).toUpperCase() + description.slice(1);
  description = `${description}, ${stringToRoundedInt(
    data.main.temp
  )}° ${degreeUnit}`;
  weatherDescription.innerText = description;
  tempOutput.innerText = `${stringToRoundedInt(data.main.temp)}° ${degreeUnit}`;
  feelsLikeOutput.innerText = `${stringToRoundedInt(
    data.main.feels_like
  )}° ${degreeUnit}`;
  lowOutput.innerText = `${stringToRoundedInt(
    data.main.temp_min
  )}° ${degreeUnit}`;
  highOutput.innerText = `${stringToRoundedInt(
    data.main.temp_max
  )}° ${degreeUnit}`;
  windOutput.innerText = `${stringToRoundedInt(data.wind.speed)} ${speedUnit}`;
  const output = document.querySelector(".output-container");
  addWeatherGif(`${data.weather[0].description}`);
  output.classList.remove("hidden");
}

// Zip code form

zipForm.addEventListener("submit", (e) => {
  e.preventDefault();
  // Validate form
  const zip = document.getElementById("zip-code").value;
  const country = document.getElementById("country-zip").value;
  displayWeather(zip, country);
  zipForm.reset();
});

// City, state, country form

cityStateCountryForm.addEventListener("submit", (e) => {
  e.preventDefault();
  // Validate form
  const city = document.getElementById("city").value;
  const country = document.getElementById("country-city").value;
  const state = document.getElementById("state").value;
  displayWeather(city, country, state);
  cityStateCountryForm.reset();
});
