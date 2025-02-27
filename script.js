const apiKey = "4dbcd924b2b0e74beefdc471c96945fa";
const cityInput = document.querySelector("#cityInput");
const weatherForm = document.querySelector(".weatherForm");
const root = document.querySelector(':root')
const cityV = document.querySelector(".city");
const temperatureV = document.querySelector(".temperature-value");
const descriptionV = document.querySelector(".description");
const feelsLikeV = document.querySelector(".feels-like-value");
const humidityV = document.querySelector(".humidity-value");
const sunV = document.querySelector(".sun-value");
const windV = document.querySelector(".wind-value");
const hightemp = document.querySelector(".high-temp");
const lowtemp = document.querySelector(".low-temp");
const visibilityV = document.querySelector(".visibility-value");
let isSunrise;
let windDeg;
const rootStyle = getComputedStyle(root);
let locationTime;
const utc = Math.floor((new Date()).getTime() / 1000)

document
  .querySelectorAll("body *:not(div):not(form):not(input):not(form button):not(.errorMessage):not(.title)")
  .forEach((element) => {
    element.style.display = "none";
  });
weatherForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const city = cityInput.value;

  if (city) {
    try {
      const weatherData = await getWeatherData(city);
      displayWeatherInfo(weatherData);
      document.querySelector('input').style.border = "";
      
    } catch (error) {
      document.querySelector('.errorMessage').style.display = "block";
      document.querySelector('input').style.border = "2px solid red";

    }
  }
});

async function getWeatherData(city) {
  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;

  const response = await fetch(apiUrl);

  if (!response.ok) {
    throw new Error("Could not fetch weather data");
  }

  return await response.json();
}


function displayWeatherInfo(data) {
  let {
    name: city,
    visibility,
    timezone,
    main: { feels_like, temp, temp_max, temp_min, humidity },
    weather: {
      0: { main: description, id: weatherID },
    },
    wind: { deg, speed, gust },
    sys: { sunrise, sunset, country },
  } = data;
  if(Date.now() > sunrise) isSunrise = false;
  else isSunrise = true;
  locationTime = new Date(utc + timezone  * 1000)
  locationTime = locationTime.getHours() - 4;
  cityV.innerHTML = city + ", " + country;
  temperatureV.innerHTML = (temp - 273.15).toFixed(1) + "&degC";
  feelsLikeV.innerHTML = (feels_like - 273.15).toFixed(1) + "&degC";
  humidityV.innerHTML = humidity + "%";
  descriptionV.innerHTML = description;
  windV.innerHTML =
    (speed * 3.6).toFixed(1) + " km/h " + `[${getWindDirection(deg)}]`;
  sunV.innerHTML = sunRiseOrSet(sunrise, sunset, locationTime);
  sunH3(sunrise, locationTime) ? document.querySelector(".sunH3").innerHTML = "Sunrise" : document.querySelector(".sunH3").innerHTML = "Sunset"
  hightemp.innerHTML = (temp_max - 273.15).toFixed(1) + "&degC";
  lowtemp.innerHTML = (temp_min - 273.15).toFixed(1) + "&degC";
  visibilityV.innerHTML = visibility / 1000 + " km";
  console.log(data);
  document.querySelector("#weather-icon").src = `Images/weather icons/${getWeatherIcon(weatherID, locationTime)}.svg`;
  root.style.setProperty('--top-color', rootStyle.getPropertyValue(colorDeterminer(weatherID, locationTime))); 
  root.style.setProperty('--bottom-color', locationTime < 18 && locationTime > 5 ? rootStyle.getPropertyValue('--day-bottom') : rootStyle.getPropertyValue('--night-bottom'))
  if(locationTime >= 18 || locationTime <= 5) {
    document.querySelectorAll('p, h1, h2').forEach(e => e.style.color = "white")
    document.querySelectorAll('h3').forEach(e => e.style.color = "rgb(127, 160, 194)")
  } else {
    document.querySelectorAll('p, h1, h2').forEach(e => e.style.color = "")
    document.querySelectorAll('h3').forEach(e => e.style.color = "")
  }

  // Render Card
  document.querySelectorAll("*").forEach((element) => {
    element.style.display = "";
  });
}

function getWeatherIcon(weatherID, time) {
  if (time < 18 && time > 5) {
    // ! DAY TIME
    if (weatherID == 300 || weatherID == 310) return "light-drizzle-day";
    else if (weatherID > 300 && weatherID < 500) return "drizzle-day";
    else if(weatherID == 800) return "day"

    
  }
  else if(time >= 18) {
    // ! NIGHT TIME
    if(weatherID == 800) return "night";
    else if(weatherID >= 801) return "cloudy-night"
  }
  if (weatherID == 500 || weatherID == 520) return "light-rain";
  else if (weatherID == 501 || weatherID == 521) return "moderate-rain";
  else if(weatherID > 500 && weatherID < 600 && weatherID != 511) return "heavy-rain";
  else if(weatherID == 511) return "freezing-rain";
  else if(weatherID == 600 || weatherID == 615 || weatherID == 620 || weatherID == 612) return "light-snow";
  else if(weatherID == 601 || weatherID == 616 || weatherID == 621) return "snow";
  else if (weatherID > 600 && weatherID < 623) return "heavy-snow";
  else if(weatherID >= 200 && weatherID <= 232) return "thunderstorm"
  else return "cloudy";
}


function pad(n) {
  return n < 10 ? "0" + n : n;
}

function getWindDirection(d) {
  switch (true) {
    case d == 0:
    case d == 360:
      return "N";
      break;
    case d == 90:
      return "E";
      break;
    case d == 180:
      return "S";
      break;
    case d == 270:
      return "W";
      break;
    case d > 0 && d < 90:
      return "NE";
      break;
    case d > 90 && d < 180:
      return "SE";
      break;
    case d > 180 && d < 270:
      return "SW";
      break;
    case d > 270 && d < 360:
      return "NW";
      break;
    default:
      return "-";
      break;
  }
}

function sunRiseOrSet(sunrise, sunset, time) {
  if (time > sunrise) {
    sunset = new Date(sunset * 1000);
    sunset = sunset.getHours() + ":" + pad(sunset.getMinutes());
    return sunset;
  } else {
    sunrise = new Date(sunrise * 1000);
    sunrise = sunrise.getHours() + ":" + pad(sunrise.getMinutes());
    return sunrise;
  }
}

function sunH3(sunTime, time) {
  sunTime = new Date(sunTime * 1000);
  sunTime = sunTime.getHours() ;
  console.log(time)
  console.log(sunTime)
  if(sunTime < time) return true;
  else return false;

}



function colorDeterminer(weatherID, time) {
  // Maybe use sunrise and sunset time instead in the future
  if(time < 18 && time > 5) {
    // ! DAY TIME 
    if(weatherID < 600) return '--day-rainy'
    else if (weatherID <= 622) return '--day-snowy'
    else if (weatherID < 802 && weatherID >= 800) return '--day-sunny'
    else return '--day-cloudy'
  } else {
    // ! NIGHT TIME
    if(weatherID < 600) return '--night-rainy'
    else if (weatherID <= 622) return '--night-snowy'
    else if (weatherID < 802 && weatherID >= 800) return '--night-clear'
    else return '--night-cloudy'
  }
}
