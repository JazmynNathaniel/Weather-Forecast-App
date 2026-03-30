export function toFahrenheit(celsius) {
    return (celsius * 9 / 5) + 32;
}

export function formatTemperaturePair(celsius) {
    const fahrenheit = toFahrenheit(celsius);
    return `${celsius.toFixed(1)}\u00B0C / ${fahrenheit.toFixed(1)}\u00B0F`;
}

export function formatTemperatureRange(minCelsius, maxCelsius) {
    const minFahrenheit = toFahrenheit(minCelsius);
    const maxFahrenheit = toFahrenheit(maxCelsius);

    return {
        celsius: `${minCelsius.toFixed(1)}\u00B0C / ${maxCelsius.toFixed(1)}\u00B0C`,
        fahrenheit: `${minFahrenheit.toFixed(1)}\u00B0F / ${maxFahrenheit.toFixed(1)}\u00B0F`
    };
}

export function formatVisibilityKm(visibilityMeters) {
    return `${visibilityMeters / 1000} km`;
}

export function formatHourLabel(unixSeconds) {
    return new Date(unixSeconds * 1000).toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit"
    });
}

export function formatDayLabel(unixSeconds) {
    return new Date(unixSeconds * 1000).toLocaleDateString([], {
        weekday: "short",
        month: "short",
        day: "numeric"
    });
}

export function getWeatherEmoji(weather) {
    switch (weather) {
        case "Clear":
            return "\u2600\uFE0F";
        case "Clouds":
            return "\u2601\uFE0F";
        case "Rain":
            return "\uD83C\uDF27\uFE0F";
        case "Snow":
            return "\u2744\uFE0F";
        case "Thunderstorm":
            return "\u26C8\uFE0F";
        case "Drizzle":
            return "\uD83C\uDF26\uFE0F";
        default:
            return "\uD83C\uDF08";
    }
}

export function buildDailySummaries(forecastList) {
    const dailyMap = new Map();

    forecastList.forEach((item) => {
        const dayKey = formatDayLabel(item.dt);

        if (!dailyMap.has(dayKey)) {
            dailyMap.set(dayKey, {
                temps: [],
                icon: item.weather[0].main
            });
        }

        dailyMap.get(dayKey).temps.push(item.main.temp);
    });

    return Array.from(dailyMap.entries()).slice(0, 7).map(([day, info]) => ({
        day,
        icon: info.icon,
        minTemp: Math.min(...info.temps),
        maxTemp: Math.max(...info.temps)
    }));
}
