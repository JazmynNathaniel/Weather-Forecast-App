async function fetchWeatherJson(path, city) {
    const url = new URL(`/api/${path}`, window.location.origin);
    url.searchParams.set("city", city);

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
