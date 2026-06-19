// ===========================================
// ELEMENTOS
// ===========================================

const cityInput = document.getElementById("city");
const searchBtn = document.getElementById("searchBtn");

const weatherCard = document.getElementById("weather");
const loading = document.getElementById("loading");
const error = document.getElementById("error");

const cityName = document.getElementById("cityName");
const temp = document.getElementById("temp");
const feels = document.getElementById("feels");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const condition = document.getElementById("condition");
const icon = document.getElementById("icon");
const date = document.getElementById("date");

// ===========================================
// EVENTOS
// ===========================================

searchBtn.addEventListener("click", buscarClima);

cityInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") buscarClima();
});

// ===========================================
// FUNÇÃO PRINCIPAL
// ===========================================

async function buscarClima() {

    const cidade = cityInput.value.trim();

    if (!cidade) {
        mostrarErro("Digite o nome de uma cidade.");
        return;
    }

    loading.style.display = "block";
    weatherCard.style.display = "none";
    error.innerHTML = "";

    try {

        // 1. PEGAR COORDENADAS (GEOCODING)
        const geoRes = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${cidade}&count=1&language=pt&format=json`
        );

        const geoData = await geoRes.json();

        if (!geoData.results) {
            throw new Error("Cidade não encontrada.");
        }

        const { latitude, longitude, name, country } = geoData.results[0];

        // 2. PEGAR CLIMA
        const weatherRes = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=relative_humidity_2m,precipitation_probability,uv_index&timezone=auto`
        );

        const weatherData = await weatherRes.json();

        const current = weatherData.current_weather;

        const now = new Date();

        // ===========================================
        // PREENCHER UI
        // ===========================================

        cityName.innerHTML = `${name} - ${country}`;

        temp.innerHTML = Math.round(current.temperature);

        wind.innerHTML = Math.round(current.windspeed);

        condition.innerHTML = traduzirClima(current.weathercode);

        humidity.innerHTML = pegarUmidade(weatherData);

        feels.innerHTML = Math.round(current.temperature - 1); // aproximação simples

        icon.src = getIcon(current.weathercode);

        date.innerHTML = now.toLocaleString("pt-BR");

        weatherCard.style.display = "block";

    } catch (err) {
        mostrarErro(err.message);
    } finally {
        loading.style.display = "none";
    }
}

// ===========================================
// UMIDADE (simples extração)
// ===========================================

function pegarUmidade(data) {
    return data.hourly?.relative_humidity_2m?.[0] ?? "--";
}

// ===========================================
// TRADUZIR CLIMA
// ===========================================

function traduzirClima(code) {

    const map = {
        0: "Céu limpo",
        1: "Principalmente limpo",
        2: "Parcialmente nublado",
        3: "Nublado",
        45: "Neblina",
        48: "Neblina congelante",
        51: "Chuvisco leve",
        53: "Chuvisco",
        55: "Chuvisco intenso",
        61: "Chuva leve",
        63: "Chuva moderada",
        65: "Chuva forte",
        80: "Pancadas de chuva",
        81: "Chuva forte",
        82: "Chuva violenta",
        95: "Tempestade"
    };

    return map[code] || "Condição desconhecida";
}

// ===========================================
// ÍCONES
// ===========================================

function getIcon(code) {

    if (code === 0) return "https://cdn-icons-png.flaticon.com/512/869/869869.png";

    if (code <= 3) return "https://cdn-icons-png.flaticon.com/512/1163/1163661.png";

    if (code <= 67) return "https://cdn-icons-png.flaticon.com/512/3351/3351979.png";

    if (code <= 82) return "https://cdn-icons-png.flaticon.com/512/1779/1779807.png";

    if (code >= 95) return "https://cdn-icons-png.flaticon.com/512/1146/1146860.png";

    return "https://cdn-icons-png.flaticon.com/512/1163/1163624.png";
}

// ===========================================
// ERRO
// ===========================================

function mostrarErro(msg) {
    error.innerHTML = msg;
}