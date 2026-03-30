import { elements } from "./dom.js";
import {
    buildDailySummaries,
    formatHourLabel,
    formatTemperaturePair,
    formatTemperatureRange,
    formatVisibilityKm,
    getWeatherEmoji
} from "./utils.js";

export function renderInitialState() {
    hideWeatherEmoji();
    renderForecastMessage("Search for a city to see the forecast.");
}

export function setLoadingState(isLoading) {
    if (!elements.submitButton) {
        return;
    }

    elements.submitButton.disabled = isLoading;
    elements.submitButton.textContent = isLoading ? "Loading..." : "Get Weather";
}

export function renderCurrentWeather(weatherData) {
    if (!weatherData) {
        hideWeatherEmoji();
        return;
    }

    elements.city.textContent = `${weatherData.name}, ${weatherData.sys.country}`;
    elements.temp.textContent = formatTemperaturePair(weatherData.main.temp);
    elements.humidity.textContent = `Humidity: ${weatherData.main.humidity}%`;
    elements.description.textContent = `Description: ${weatherData.weather[0].description}`;
    elements.wind.textContent = `Wind Speed: ${weatherData.wind.speed} m/s`;
    elements.visibility.textContent = `Visibility: ${formatVisibilityKm(weatherData.visibility)}`;
    elements.weatherEmoji.textContent = getWeatherEmoji(weatherData.weather[0].main);
    showWeatherEmoji();
}

export function renderForecasts(forecastData) {
    if (!forecastData || !forecastData.list) {
        renderForecastMessage("Forecast unavailable.");
        return;
    }

    renderHourlyForecast(forecastData.list.slice(0, 8));
    renderDailyForecast(buildDailySummaries(forecastData.list));
}

export function renderErrorState(message) {
    hideWeatherEmoji();
    renderForecastMessage(message);
}

function renderHourlyForecast(hourlyItems) {
    elements.forecastHourly.innerHTML = hourlyItems.map((item) => `
        <div class="forecastItem">
            <strong>${formatHourLabel(item.dt)}</strong>
            <span>${getWeatherEmoji(item.weather[0].main)} ${item.weather[0].main}</span>
            <span>${formatTemperaturePair(item.main.temp)}</span>
        </div>
    `).join("");
}

function renderDailyForecast(dailyItems) {
    elements.forecastDaily.innerHTML = dailyItems.map((item) => {
        const temps = formatTemperatureRange(item.minTemp, item.maxTemp);

        return `
            <div class="forecastItem">
                <strong>${item.day}</strong>
                <span>${getWeatherEmoji(item.icon)} ${item.icon}</span>
                <span>${temps.celsius}</span>
                <span>${temps.fahrenheit}</span>
            </div>
        `;
    }).join("");
}

function renderForecastMessage(message) {
    const markup = `<div class="forecastEmpty">${message}</div>`;
    elements.forecastDaily.innerHTML = markup;
    elements.forecastHourly.innerHTML = markup;
}

function hideWeatherEmoji() {
    elements.weatherEmoji.style.display = "none";
}

function showWeatherEmoji() {
    elements.weatherEmoji.style.display = "inline";
}
