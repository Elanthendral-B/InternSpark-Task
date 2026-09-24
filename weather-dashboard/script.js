"use strict";

const searchForm = document.getElementById("searchForm");

const cityInput = document.getElementById("cityInput");

const searchButton = document.getElementById("searchButton");

const loading = document.getElementById("loading");

const errorMessage = document.getElementById("errorMessage");

const errorText = document.getElementById("errorText");

const weatherContent = document.getElementById("weatherContent");

const cityName = document.getElementById("cityName");

const locationDetails = document.getElementById("locationDetails");

const temperature = document.getElementById("temperature");

const weatherDescription =
    document.getElementById("weatherDescription");

const weatherIcon =
    document.getElementById("weatherIcon");

const feelsLike =
    document.getElementById("feelsLike");

const humidity =
    document.getElementById("humidity");

const windSpeed =
    document.getElementById("windSpeed");

const cloudCover =
    document.getElementById("cloudCover");


// API URLs

const GEOCODING_API =
    "https://geocoding-api.open-meteo.com/v1/search";

const WEATHER_API =
    "https://api.open-meteo.com/v1/forecast";


// Weather code descriptions

const weatherCodes = {

    0: {
        description: "Clear Sky",
        icon: "bi-sun-fill"
    },

    1: {
        description: "Mainly Clear",
        icon: "bi-sun"
    },

    2: {
        description: "Partly Cloudy",
        icon: "bi-cloud-sun-fill"
    },

    3: {
        description: "Overcast",
        icon: "bi-clouds-fill"
    },

    45: {
        description: "Fog",
        icon: "bi-cloud-fog-fill"
    },

    48: {
        description: "Depositing Rime Fog",
        icon: "bi-cloud-fog-fill"
    },

    51: {
        description: "Light Drizzle",
        icon: "bi-cloud-drizzle-fill"
    },

    53: {
        description: "Moderate Drizzle",
        icon: "bi-cloud-drizzle-fill"
    },

    55: {
        description: "Dense Drizzle",
        icon: "bi-cloud-drizzle-fill"
    },

    61: {
        description: "Slight Rain",
        icon: "bi-cloud-rain-fill"
    },

    63: {
        description: "Moderate Rain",
        icon: "bi-cloud-rain-fill"
    },

    65: {
        description: "Heavy Rain",
        icon: "bi-cloud-rain-heavy-fill"
    },

    71: {
        description: "Slight Snow",
        icon: "bi-snow"
    },

    73: {
        description: "Moderate Snow",
        icon: "bi-snow"
    },

    75: {
        description: "Heavy Snow",
        icon: "bi-snow"
    },

    80: {
        description: "Rain Showers",
        icon: "bi-cloud-rain-fill"
    },

    81: {
        description: "Moderate Rain Showers",
        icon: "bi-cloud-rain-fill"
    },

    82: {
        description: "Violent Rain Showers",
        icon: "bi-cloud-rain-heavy-fill"
    },

    95: {
        description: "Thunderstorm",
        icon: "bi-cloud-lightning-rain-fill"
    },

    96: {
        description: "Thunderstorm With Hail",
        icon: "bi-cloud-lightning-rain-fill"
    },

    99: {
        description: "Heavy Thunderstorm With Hail",
        icon: "bi-cloud-lightning-rain-fill"
    }

};


// Search form

searchForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const city = cityInput.value.trim();

    if (!city) {

        showError("Please enter a city name.");

        return;
    }

    await searchWeather(city);

});


// Search weather

async function searchWeather(city) {

    showLoading();

    try {

        // Step 1:
        // Convert city name into latitude and longitude

        const location = await getCoordinates(city);


        // Step 2:
        // Get weather using coordinates

        const weather = await getWeather(
            location.latitude,
            location.longitude
        );


        // Step 3:
        // Display result

        displayWeather(location, weather);


    } catch (error) {

        console.error(error);

        showError(
            error.message ||
            "Unable to fetch weather information."
        );

    } finally {

        hideLoading();

    }
}


// Get coordinates

async function getCoordinates(city) {

    const url = new URL(GEOCODING_API);

    url.searchParams.set("name", city);

    url.searchParams.set("count", "1");

    url.searchParams.set("language", "en");

    url.searchParams.set("format", "json");


    const response = await fetch(url);


    if (!response.ok) {

        throw new Error(
            "Unable to search for this city."
        );

    }


    const data = await response.json();


    if (!data.results || data.results.length === 0) {

        throw new Error(
            `City "${city}" was not found.`
        );

    }


    return data.results[0];
}


// Get weather

async function getWeather(latitude, longitude) {

    const url = new URL(WEATHER_API);

    url.searchParams.set("latitude", latitude);

    url.searchParams.set("longitude", longitude);

    url.searchParams.set(
        "current",
        [
            "temperature_2m",
            "relative_humidity_2m",
            "apparent_temperature",
            "is_day",
            "precipitation",
            "weather_code",
            "cloud_cover",
            "wind_speed_10m"
        ].join(",")
    );

    url.searchParams.set("timezone", "auto");


    const response = await fetch(url);


    if (!response.ok) {

        throw new Error(
            "Unable to fetch weather data."
        );

    }


    return await response.json();
}


// Display weather

function displayWeather(location, data) {

    const current = data.current;


    cityName.textContent = location.name;


    const locationParts = [
        location.admin1,
        location.country
    ].filter(Boolean);


    locationDetails.textContent =
        locationParts.join(", ");


    temperature.textContent =
        Math.round(current.temperature_2m);


    feelsLike.textContent =
        `${Math.round(current.apparent_temperature)}°C`;


    humidity.textContent =
        `${current.relative_humidity_2m}%`;


    windSpeed.textContent =
        `${Math.round(current.wind_speed_10m)} km/h`;


    cloudCover.textContent =
        `${current.cloud_cover}%`;


    const weatherInfo =
        weatherCodes[current.weather_code] ||
        {
            description: "Unknown",
            icon: "bi-cloud"
        };


    weatherDescription.textContent =
        weatherInfo.description;


    weatherIcon.className =
        `bi ${weatherInfo.icon}`;


    weatherContent.style.display = "block";

    errorMessage.style.display = "none";

}


// Loading state

function showLoading() {

    loading.style.display = "block";

    weatherContent.style.display = "none";

    errorMessage.style.display = "none";

    searchButton.disabled = true;

    searchButton.textContent = "Searching...";

}


// Hide loading

function hideLoading() {

    loading.style.display = "none";

    searchButton.disabled = false;

    searchButton.textContent = "Search";

}


// Show error

function showError(message) {

    errorText.textContent = message;

    errorMessage.style.display = "flex";

    weatherContent.style.display = "none";

}


// Enter city automatically

cityInput.value = "Madurai";


// Load initial weather

searchWeather("Madurai");