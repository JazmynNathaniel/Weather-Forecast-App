const API_KEY = "cc70d4a8c2a802e4a3c491f4149442ac"; //I used the OPENAPI weather API that was recommended

const form = document.querySelector('.WeatherForm');
const weatherEmojiEl = document.querySelector('.weatherEmoji');
const weatherEmojiLegendEl = document.querySelector('.weatherEmojiLegend');
const forecastDailyEl = document.querySelector('.forecastDaily');
const forecastHourlyEl = document.querySelector('.forecastHourly');

hideEmojis();
setForecastMessage('Search for a city to see the forecast.');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const city = document.getElementById('cityInput').value;
    updateWeatherForCity(city);
});

async function getWeather(city) {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
    if (!response.ok) {
        alert('City not found');
        return null;
    }
    const data = await response.json();
    return data;
}

async function getForecast(city) {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`);
    if (!response.ok) {
        return null;
    }
    const data = await response.json();
    return data;
}

function updateUI(data) {
    if (!data) {
        hideEmojis();
        setForecastMessage('Forecast unavailable.');
        return;
    }
    document.querySelector('.city').textContent = `${data.name}, ${data.sys.country}`;
    const tempC = data.main.temp;
    const tempF = (tempC * 9 / 5) + 32;
    document.querySelector('.temp').textContent = `${tempC.toFixed(1)}\u00B0C / ${tempF.toFixed(1)}\u00B0F`;
    document.querySelector('.humidity').textContent = `Humidity: ${data.main.humidity}%`;
    document.querySelector('.description').textContent = `Description: ${data.weather[0].description}`;
    document.querySelector('.wind').textContent = `Wind Speed: ${data.wind.speed} m/s`;
    document.querySelector('.visibility').textContent = `Visibility: ${data.visibility / 1000} km`;
    const weatherEmoji = getWeatherEmoji(data.weather[0].main);
    if (weatherEmojiEl) {
        weatherEmojiEl.textContent = weatherEmoji;
    }
    showEmojiOnly();
}

function getWeatherEmoji(weather) {
    switch (weather) {
        case 'Clear': return '\u2600\uFE0F';
        case 'Clouds': return '\u2601\uFE0F';
        case 'Rain': return '\uD83C\uDF27\uFE0F';
        case 'Snow': return '\u2744\uFE0F';
        case 'Thunderstorm': return '\u26C8\uFE0F';
        case 'Drizzle': return '\uD83C\uDF26\uFE0F';
        default: return '\uD83C\uDF08';
    }

}

async function updateWeatherForCity(city) {
    if (!city || !city.trim()) {
        hideEmojis();
        setForecastMessage('Search for a city to see the forecast.');
        return;
    }
    const [weatherData, forecastData] = await Promise.all([
        getWeather(city),
        getForecast(city)
    ]);
    updateUI(weatherData);
    updateForecastUI(forecastData);
}

function hideEmojis() {
    if (weatherEmojiEl) weatherEmojiEl.style.display = 'none';
    if (weatherEmojiLegendEl) weatherEmojiLegendEl.style.display = 'none';
}

function showEmojiOnly() {
    if (weatherEmojiEl) weatherEmojiEl.style.display = 'inline';
    if (weatherEmojiLegendEl) weatherEmojiLegendEl.style.display = 'none';
}

function setForecastMessage(message) {
    if (forecastDailyEl) {
        forecastDailyEl.innerHTML = `<div class="forecastEmpty">${message}</div>`;
    }
    if (forecastHourlyEl) {
        forecastHourlyEl.innerHTML = `<div class="forecastEmpty">${message}</div>`;
    }
}

function updateForecastUI(data) {
    if (!data || !data.list) {
        setForecastMessage('Forecast unavailable.');
        return;
    }

    const hourlyItems = data.list.slice(0, 8);
    if (forecastHourlyEl) {
        forecastHourlyEl.innerHTML = hourlyItems.map((item) => {
            const time = new Date(item.dt * 1000);
            const hourLabel = time.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
            const tempC = item.main.temp;
            const tempF = (tempC * 9 / 5) + 32;
            const emoji = getWeatherEmoji(item.weather[0].main);
            return `
                <div class="forecastItem">
                    <strong>${hourLabel}</strong>
                    <span>${emoji} ${item.weather[0].main}</span>
                    <span>${tempC.toFixed(1)}\u00B0C / ${tempF.toFixed(1)}\u00B0F</span>
                </div>
            `;
        }).join('');
    }

    const dailyMap = new Map();
    data.list.forEach((item) => {
        const date = new Date(item.dt * 1000);
        const dayKey = date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
        if (!dailyMap.has(dayKey)) {
            dailyMap.set(dayKey, {
                temps: [],
                icon: item.weather[0].main
            });
        }
        dailyMap.get(dayKey).temps.push(item.main.temp);
    });

    const dailyItems = Array.from(dailyMap.entries()).slice(0, 7);
    if (forecastDailyEl) {
        forecastDailyEl.innerHTML = dailyItems.map(([day, info]) => {
            const minTemp = Math.min(...info.temps);
            const maxTemp = Math.max(...info.temps);
            const minF = (minTemp * 9 / 5) + 32;
            const maxF = (maxTemp * 9 / 5) + 32;
            const emoji = getWeatherEmoji(info.icon);
            return `
                <div class="forecastItem">
                    <strong>${day}</strong>
                    <span>${emoji} ${info.icon}</span>
                    <span>${minTemp.toFixed(1)}\u00B0C / ${maxTemp.toFixed(1)}\u00B0C</span>
                    <span>${minF.toFixed(1)}\u00B0F / ${maxF.toFixed(1)}\u00B0F</span>
                </div>
            `;
        }).join('');
    }
}
