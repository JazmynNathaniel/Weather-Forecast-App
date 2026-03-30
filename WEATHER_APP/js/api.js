const API_KEY = "cc70d4a8c2a802e4a3c491f4149442ac";
const BASE_URL = "https://api.openweathermap.org/data/2.5";

async function fetchWeatherJson(path, city) {
    const url = new URL(`${BASE_URL}/${path}`);
    url.searchParams.set("q", city);
    url.searchParams.set("appid", API_KEY);
    url.searchParams.set("units", "metric");

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
    }

    return response.json();
}

export async function getWeather(city) {
    return fetchWeatherJson("weather", city);
}

export async function getForecast(city) {
    return fetchWeatherJson("forecast", city);
}
