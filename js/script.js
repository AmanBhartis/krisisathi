document.addEventListener('DOMContentLoaded', function() {
    // Crop Suggestion Functionality
    const form = document.getElementById('crop-form');
    const input = document.getElementById('crop-input');
    const result = document.getElementById('crop-suggestion-result');
    const weatherDiv = document.getElementById("weather");
    const irrigationDiv = document.getElementById("irrigation-advice");

    // Store last weather info for crop suggestion and irrigation advice
    let lastWeather = null;

    // Weather code to description mapping
    function weatherDescription(code) {
        const map = {
            0: "Clear sky",
            1: "Mainly clear",
            2: "Partly cloudy",
            3: "Overcast",
            45: "Fog",
            48: "Depositing rime fog",
            51: "Light drizzle",
            53: "Moderate drizzle",
            55: "Dense drizzle",
            56: "Light freezing drizzle",
            57: "Dense freezing drizzle",
            61: "Slight rain",
            63: "Moderate rain",
            65: "Heavy rain",
            66: "Light freezing rain",
            67: "Heavy freezing rain",
            71: "Slight snow fall",
            73: "Moderate snow fall",
            75: "Heavy snow fall",
            77: "Snow grains",
            80: "Slight rain showers",
            81: "Moderate rain showers",
            82: "Violent rain showers",
            85: "Slight snow showers",
            86: "Heavy snow showers",
            95: "Thunderstorm",
            96: "Thunderstorm with slight hail",
            99: "Thunderstorm with heavy hail"
        };
        return map[code] || "Unknown";
    }

    function weatherIcon(code) {
        const icons = {
            0: "☀️",
            1: "🌤️",
            2: "⛅",
            3: "☁️",
            45: "🌫️",
            48: "🌫️",
            51: "🌦️",
            53: "🌦️",
            55: "🌧️",
            56: "🌧️",
            57: "🌧️",
            61: "🌦️",
            63: "🌧️",
            65: "🌧️",
            66: "🌧️",
            67: "🌧️",
            71: "🌨️",
            73: "🌨️",
            75: "❄️",
            77: "❄️",
            80: "🌦️",
            81: "🌧️",
            82: "⛈️",
            85: "🌨️",
            86: "❄️",
            95: "⛈️",
            96: "⛈️",
            99: "⛈️"
        };
        return icons[code] || "❔";
    }

    // Weather Functionality
    if (weatherDiv) {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(success, error);
        } else {
            weatherDiv.textContent = "Geolocation is not supported by your browser.";
        }
    }

    function success(position) {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`)
            .then(res => res.json())
            .then(data => {
                if (data.current_weather) {
                    const w = data.current_weather;
                    lastWeather = w; // Save for crop suggestion and irrigation
                    const icon = weatherIcon(w.weathercode);
                    weatherDiv.innerHTML = `
                        <strong>Temperature:</strong> ${w.temperature}°C<br>
                        <strong>Wind:</strong> ${w.windspeed} km/h<br>
                        <strong>Weather:</strong> ${icon} ${weatherDescription(w.weathercode)}
                    `;
                    // Show irrigation advice based on weather
                    if (irrigationDiv) {
                        irrigationDiv.innerHTML = getIrrigationAdvice(w.weathercode, w.temperature);
                    }
                } else {
                    weatherDiv.textContent = "Weather data not available.";
                }
            })
            .catch(() => {
                weatherDiv.textContent = "Unable to fetch weather data.";
            });
    }

    function error() {
        weatherDiv.textContent = "Unable to retrieve your location.";
    }

    // Irrigation advice based on weather code and temperature
    function getIrrigationAdvice(code, temp) {
        if ([61,63,65,80,81,82].includes(code)) {
            return "Rainy weather detected. Reduce irrigation, monitor for waterlogging.";
        } else if (temp >= 32) {
            return "High temperature detected. Increase irrigation frequency, especially for sensitive crops.";
        } else if ([0,1,2,3].includes(code)) {
            return "Clear or partly cloudy. Regular irrigation recommended.";
        } else if ([45,48].includes(code)) {
            return "Foggy conditions. Monitor soil moisture, irrigate if dry.";
        } else {
            return "Check local soil moisture and crop needs for best irrigation schedule.";
        }
    }

    // Crop Suggestion Functionality (now includes weather-based advice)
    if (form && input && result) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const value = input.value.trim().toLowerCase();
            let suggestion = '';

            // Check if input is a pH value
            const ph = parseFloat(value);
            if (!isNaN(ph)) {
                if (ph < 5.5) {
                    suggestion = 'Highly acidic soil. Best crops: Tea, Potato, Pineapple';
                } else if (ph >= 5.5 && ph < 6.5) {
                    suggestion = 'Moderately acidic soil. Best crops: Rice, Maize, Groundnut';
                } else if (ph >= 6.5 && ph < 7.5) {
                    suggestion = 'Neutral soil. Best crops: Wheat, Barley, Pulses, Most vegetables';
                } else if (ph >= 7.5 && ph < 8.5) {
                    suggestion = 'Alkaline soil. Best crops: Cotton, Barley, Sugar beet';
                } else if (ph >= 8.5) {
                    suggestion = 'Highly alkaline soil. Limited crops: Barley, Sugar beet, Cotton';
                } else {
                    suggestion = 'Please enter a valid pH value.';
                }
            } else {
                // Check for soil type keywords
                if (value.includes('clay')) {
                    suggestion = 'Best crops: Rice, Wheat, Sugarcane';
                } else if (value.includes('sandy')) {
                    suggestion = 'Best crops: Groundnut, Potato, Watermelon';
                } else if (value.includes('loam')) {
                    suggestion = 'Best crops: Maize, Cotton, Pulses';
                } else if (value.includes('acidic')) {
                    suggestion = 'Best crops: Tea, Potato, Pineapple';
                } else if (value.includes('alkaline')) {
                    suggestion = 'Best crops: Barley, Cotton, Sugar beet';
                } else {
                    suggestion = 'Please enter a valid soil type or pH value (e.g., "clay", "sandy", "loam", "6.5", etc.)';
                }
            }

            // Add weather-based crop suggestion if weather data is available
            if (lastWeather) {
                if ([61,63,65,80,81,82].includes(lastWeather.weathercode)) {
                    suggestion += " | Weather is rainy: Rice, Jute, Sugarcane are recommended.";
                } else if (lastWeather.temperature >= 32) {
                    suggestion += " | High temperature: Maize, Cotton, Groundnut are suitable.";
                } else if ([0,1,2,3].includes(lastWeather.weathercode)) {
                    suggestion += " | Clear weather: Wheat, Barley, Pulses, Vegetables are suitable.";
                }
            }

            result.textContent = suggestion;
            result.style.display = 'block';
        });
    }
});

