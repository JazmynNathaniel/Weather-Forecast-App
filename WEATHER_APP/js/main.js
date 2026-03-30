import { getForecast, getWeather } from "./api.js";
import { elements } from "./dom.js";
import {
    renderCurrentWeather,
    renderErrorState,
    renderForecasts,
    renderInitialState,
    setLoadingState
} from "./render.js";

renderInitialState();

elements.form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const city = elements.cityInput.value.trim();

    if (!city) {
        renderInitialState();
        return;
    }

    setLoadingState(true);

    try {
        const [weatherData, forecastData] = await Promise.all([
            getWeather(city),
            getForecast(city)
        ]);

        renderCurrentWeather(weatherData);
        renderForecasts(forecastData);
    } catch (error) {
        renderErrorState("City not found or forecast unavailable.");
    } finally {
        setLoadingState(false);
    }
});
