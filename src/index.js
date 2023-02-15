import { meterSecToKmH, meterSecToMpH, degreesToDirections, speedGustToKmH, speedGustToMpH, utcTogmt } from "./js/weather-data.js";
import { backgroundImageChange } from "./js/background-img.js";
// import { metricToImperial, imperialToMetric } from "./js/units.js";

// get DOM references
const form = document.querySelector("form");
const input = document.querySelector("input");
const msg = document.querySelector(".msg");
const list = document.querySelector(".ajax-section .cities");

// openweathermap API key
const apiKey = "229123719331231a3ae10f87dcb22d0d"; // process.env.REACT_APP_GOOGLE_MAPS_API_KEY

// add event listener to fire the submit event which occurs when the whole page has loaded
form.addEventListener("submit", event => {
  event.preventDefault();
  let inputVal = input.value;

  // check if there's already a city
  const listItems = list.querySelectorAll(".ajax-section .city");
  const listItemsArray = Array.from(listItems);

  if (listItemsArray.length > 0) {
    const filteredArray = listItemsArray.filter(el => {
      let content = "";
      // lisbon,pt
      if (inputVal.includes(",")) {
        // lisbon,pttttt > invalid country code, so we keep only the first part of inputVal
        if (inputVal.split(",")[1].length > 2) {
          inputVal = inputVal.split(",")[0];
          content = el
            .querySelector(".city-name span")
            .textContent.toLowerCase();
        } else {
          content = el.querySelector(".city-name").dataset.name.toLowerCase();
        }
      } else {
        // lisbon
        content = el.querySelector(".city-name span").textContent.toLowerCase();
      }
      return content == inputVal.toLowerCase();
    });

    if (filteredArray.length > 0) {
      msg.textContent = `You already know the weather for ${filteredArray[0].querySelector(".city-name span").textContent
        } ...otherwise be more specific by providing the country code as well 😉`;
      form.reset();
      input.focus();
      return;
    }
  }

  // use fetch method to get JSON (format for storing and transporting data from a web server to a web page)
  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${inputVal}&appid=${apiKey}&units=metric`)
    // represent HTTP response, using json() method extract the JSON body content from the Response object
    .then(response => response.json())
    // access weather data from openweathermap
    .then(data => {
      // destructure assignment to extract values from objects (JSON / data)
      const { dt, main, name, sys, timezone, visibility, weather, wind } = data;
      const { temp, feels_like, temp_min, temp_max, pressure, humidity } = data.main;
      const { country, sunrise, sunset } = data.sys;
      const { speed, deg, gust } = data.wind;
      const { id, description, icon } = data.weather[0];

      // create img element for weather icon
      var img = document.createElement("img");
      img.setAttribute("class", "weather_icon")
      img.setAttribute("src", `http://openweathermap.org/img/wn/${weather[0]["icon"]}@2x.png`);
      img.setAttribute("width", "150");
      img.setAttribute("height", "150");
      img.setAttribute("alt", "Weather icon");
      document.getElementById('weather_icon').appendChild(img);

      // change header text to match either day mode or night mode
      var currentTime = new Date(dt * 1000);
      var sunriseTime = new Date(sunrise * 1000);
      var sunsetTime = new Date(sunset * 1000);

      function dayAndNightModes(currentTime) {
        if (currentTime > sunriseTime && currentTime < sunsetTime) {
          document.getElementById('heading').innerHTML = 'GOOD DAY';
        } else {
          document.getElementById('heading').innerHTML = 'GOOD NIGHT';
        }
      }

      // allow user to switch to metric units of measure 
      var countryUnits = 'metric';

      function metricToImperial() {
        // check if currently set to imperial or metric
        if (countryUnits === 'metric') {
          // convert celsius to fahrenheit
          document.getElementById("temp").innerHTML = `${Math.round((temp * 9 / 5) + 32)}°F`;
          document.getElementById("temp_max").innerHTML = `${Math.round((temp_max * 9 / 5) + 32)}°F &nbsp`;
          document.getElementById("temp_min").innerHTML = `/&nbsp ${Math.round((temp_min * 9 / 5) + 32)}°F &nbsp`;
          document.getElementById("feels_like").innerHTML = `| Feels like ${Math.round((feels_like * 9 / 5) + 32)}°F &nbsp`;
          // convert km/h to mph
          document.getElementById("visibility").innerHTML = `${Math.round((visibility / 1.609) / 1000)} Miles`;
          document.getElementById("wind-speed").innerHTML = meterSecToMpH(speed);
          document.getElementById("wind-gust").innerHTML = speedGustToMpH(gust);
          countryUnits = 'imperial';
        }
      }
      // add onclick event to metric units button
      document.getElementById("imperial").onclick = function () {
        metricToImperial();
      };

      // allow user to switch to imperial units of measure 
      function imperialToMetric() {
        // check if currently set to imperial or metric
        if (countryUnits === 'imperial') {
          // convert fahrenheit to celsius
          document.getElementById("temp").innerHTML = `${Math.round(temp)}°C`;
          document.getElementById("temp_max").innerHTML = `${temp_max.toFixed(0)}°C &nbsp`;
          document.getElementById("temp_min").innerHTML = `/&nbsp ${temp_min.toFixed(0)}°C &nbsp`;
          document.getElementById("feels_like").innerHTML = `| Feels like ${feels_like.toFixed(0)}°C`;
          // convert mph to km/h
          document.getElementById("visibility").innerHTML = `${Math.round(visibility / 1000)} Km`;
          document.getElementById("wind-speed").innerHTML = meterSecToKmH(speed);
          document.getElementById("wind-gust").innerHTML = speedGustToKmH(gust);
          countryUnits = 'metric';
        }
      }
      // add onclick event to imperial units button
      document.getElementById("metric").onclick = function () {
        imperialToMetric();
      };

      // javascript HTML DOM interactivity to show JSON (data from the web server to the HTML element):

      // weather data
      document.getElementById("temp").innerHTML = `${temp.toFixed(0)}°C`;
      document.getElementById("temp_max").innerHTML = `${temp_max.toFixed(0)}°C &nbsp`;
      document.getElementById("temp_min").innerHTML = `/&nbsp ${temp_min.toFixed(0)}°C &nbsp`;
      document.getElementById("feels_like").innerHTML = `| Feels like ${feels_like.toFixed(0)}°C`;
      document.getElementById("descr").innerHTML = `${weather[0]['description']}`;
      document.querySelector(".sunrise").innerHTML = "Sunrise";
      document.getElementById("sunrise").innerHTML = window.moment(sunrise * 1000).format('HH:mm');
      document.querySelector(".sunset").innerHTML = "Sunset";
      document.getElementById("sunset").innerHTML = window.moment(sunset * 1000).format('HH:mm');
      document.querySelector(".humidity").innerHTML = "Humidity";
      document.getElementById("humidity").innerHTML = `${humidity} %`;
      document.querySelector(".visibility").innerHTML = "Visibility";
      document.getElementById("visibility").innerHTML = `${Math.round(visibility / 1000)} Km`;
      document.querySelector(".wind-speed").innerHTML = "Wind speed";
      document.getElementById("wind-speed").innerHTML = meterSecToKmH(speed);
      document.querySelector(".wind-deg").innerHTML = "Wind direction";
      document.getElementById("wind-deg").innerHTML = degreesToDirections(deg);
      document.querySelector(".wind-gust").innerHTML = "Wind gust";
      document.getElementById("wind-gust").innerHTML = meterSecToKmH(gust);

      // header text
      var heading = document.getElementById('heading');
      heading.style.setAttribute = dayAndNightModes(currentTime);

      // background image
      var bi = document.getElementById('background-image');
      bi.style.backgroundImage = backgroundImageChange(id);

      // form (input and button)
      var inputButton = document.getElementById('form');
      inputButton.removeChild(inputButton.firstElementChild);
      inputButton.removeChild(inputButton.lastElementChild);

      // console.log(JSON.stringify(data)) // inserted for reference only
      console.log(data); // inserted for reference only

      // ajax-section
      const li = document.createElement("li");
      li.classList.add("city");

      const markup = `
      <section id="weather-data">
        <div id="map-icon">
          <i class="fas fa-map-marker-alt" style='font-size:25px;color:red'></i>
        </div>

        <div id="location_country_date-time">
          <div id="location_country" data-name_country="${name},${country}">
            <span id="location">${name}</span>
            <sup id="country" style="font-size: 12px;">${country}</sup>
          </div>
          <p id="date-time">${utcTogmt(dt, timezone)}</p>
        </div>
      </section>  
      `;
      li.innerHTML = markup;
      // appendchild method to add a node to the end of the list of children of a specified parent node
      list.appendChild(li);
    })
    // catch statement to define the code block to handle any error
    .catch(() => {
      msg.textContent = "Please search for a valid location 😩";
    });

  msg.textContent = "";
  // reset method to clear all the values of the form elements; in other words, it resets the form
  form.reset();
  // focus method to set focus on the input element / current window
  input.focus();
});