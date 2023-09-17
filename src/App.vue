<!-- eslint-disable no-unused-vars -->
<!-- eslint-disable no-unused-vars -->
<!-- eslint-disable no-undef -->
<!-- eslint-disable no-undef -->
<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div id="ancestor">
    <div class="container-fluid" id="app">
      <div class="row">
        <div id="sidebar" class="col-md-3 col-sm-4 col-xs-12 sidebar">
          <div id="search">
            <input
              id="location-input"
              type="text"
              ref="input"
              placeholder="Location?"
              @keyup.enter="organizeAllDetails"
            />
            <button id="search-btn" @click="organizeAllDetails">
              <img src="./assets/search.svg" width="24" height="24" />
            </button>
          </div>
          <div id="info">
            <div class="wrapper-left">
              <div id="current-weather">
                {{ currentWeather.temp }}
                <span>°C</span>
              </div>
              <div id="weather-desc">{{ currentWeather.summary }}</div>
              <div class="temp-max-min">
                <div class="max-desc">
                  <div id="max-detail">
                    <i>▲</i>
                    {{ currentWeather.todayHighLow.todayTempHigh }}
                    <span>°C</span>
                  </div>
                  <div id="max-summary">at {{ currentWeather.todayHighLow.todayTempHighTime }}</div>
                </div>
                <div class="min-desc">
                  <div id="min-detail">
                    <i>▼</i>
                    {{ currentWeather.todayHighLow.todayTempLow }}
                    <span>°C</span>
                  </div>
                  <div id="min-summary">at {{ currentWeather.todayHighLow.todayTempLowTime }}</div>
                </div>
              </div>
            </div>
            <div class="wrapper-right">
              <div class="date-time-info">
                <div id="date-desc">
                  <img src="./assets/calendar.svg" width="20" height="20" />
                  {{ currentWeather.time }}
                </div>
              </div>
              <div class="location-info">
                <div id="location-desc">
                  <img
                    src="./assets/location.svg"
                    width="10.83"
                    height="15.83"
                    style="opacity0.9"
                  />
                  {{ currentWeather.full_location }}
                  <div id="location-detail" class="mt-1">
                    Lat: {{ currentWeather.formatted_lat }}
                    <br />
                    Long: {{ currentWeather.formatted_long }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <content
          class="col-md-9 col-sm-8 col-xs-12 content"
          id="dashboard-content"
          :highlights="highlights"
          :tempVar="tempVar"
        ></content>
      </div>
    </div>
  </div>
</template>
<script setup>
import Content from './components/Content.vue'
import axios from 'axios'
import { onMounted, ref } from 'vue'
import {
  unixToHuman,
  convertToTitleCase,
  formatPossibility,
  fahToCel,
  mileToKilometer,
  deriveWindDir
} from './constants/index'
// const weatherDetails= ref(false);
const location = ref('Lagos')
const lat = ref('')
const long = ref('')
const pirateApikey = '6XJbJYwPPwLGuTfb'
const completeWeatherApi = ref('')
const rawWeatherData = ref('')
const currentWeather = ref({
  full_location: '',
  formatted_lat: '',
  formatted_long: '',
  time: '',
  temp: '',
  todayHighLow: {
    todayTempHigh: '',
    todayTempHighTime: '',
    todayTempLow: '',
    todayTempLowTime: ''
  },
  summary: '',
  possibility: ''
})
const tempVar = ref({
  tempToday: []
})
const highlights = ref({
  uvIndex: '',
  visibility: '',
  windStatus: {
    windSpeed: '',
    windDirection: '',
    derivedWindDirection: ''
  }
})
const input = ref(null)
function makeTempVarTodayEmpty() {
  tempVar.value.tempToday = []
}
function makeInputEmpty() {
  input.value.value = ''
}
function locationEntered() {
  var inputValue = input.value.value;
  // console.log(input.value.value)
  if (inputValue == '') {
    location.value = 'Lagos'
  } else {
    location.value = convertToTitleCase(inputValue)
  }

  makeInputEmpty()
  makeTempVarTodayEmpty()
}
function getCoordinates() {
  locationEntered()
  var loc = location.value
  var coords;
  // console.log(location.value)
  // eslint-disable-next-line no-undef
  var geocoder = new google.maps.Geocoder()
  // console.log('geocoder', geocoder)
  return new Promise(function (resolve) {
    geocoder.geocode({ address: loc }, function (results, status) {
      // console.log('status', status)
      if (status == 'OK') {
        // console.log(results[0])
        lat.value = results[0]?.geometry?.location?.lat()
        long.value = results[0]?.geometry?.location?.lng()
        currentWeather.value.full_location = results[0].formatted_address
        coords = {
          lat: lat.value ?? '',
          long: long.value ?? '',
          full_location: currentWeather.value.full_location
        }
        // console.log('coords', coords)
        resolve(coords)
      } else {
        console.log("Oops! Couldn't get data for the location")
      }
    })
  })
}
async function setFormatCoordinates() {
  var coordinates = await getCoordinates()
  lat.value = coordinates.lat
  long.value = coordinates.long
  currentWeather.value.full_location = coordinates.full_location
  // Remember to beautify lat for N/S
  if (coordinates.lat > 0) {
    currentWeather.value.formatted_lat =
      (Math.round(coordinates.lat * 10000) / 10000).toString() + '°N'
  } else if (coordinates.lat < 0) {
    currentWeather.value.formatted_lat =
      (-1 * (Math.round(coordinates.lat * 10000) / 10000)).toString() + '°S'
  } else {
    currentWeather.value.formatted_lat = (Math.round(coordinates.lat * 10000) / 10000).toString()
  }
  // Remember to beautify long for N/S
  if (coordinates.long > 0) {
    currentWeather.value.formatted_long =
      (Math.round(coordinates.long * 10000) / 10000).toString() + '°E'
  } else if (coordinates.long < 0) {
    currentWeather.value.formatted_long =
      (-1 * (Math.round(coordinates.long * 10000) / 10000)).toString() + '°W'
  } else {
    currentWeather.value.formatted_long = (Math.round(coordinates.long * 10000) / 10000).toString()
  }
}
async function fixWeatherApi() {
  await setFormatCoordinates()
  var weatherApi = `https://api.pirateweather.net/forecast/${pirateApikey}/${lat.value},${long.value}`
  completeWeatherApi.value = weatherApi
}
async function fetchWeatherData() {
  await fixWeatherApi() // for handling weather api promise
  try {
    const weatherApiResponse = await axios.get(completeWeatherApi.value)
    // console.log(
    //   weatherApiResponse.data,
    //   'wiwoeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeatherApiResponse'
    // )
    if (weatherApiResponse.status === 200) {
      rawWeatherData.value = weatherApiResponse.data
    } else {
      console.log('Hmm... Seems like our weather experts are busy!')
    }
  } catch (err) {
    console.log(err.response.data)
  }
}
function getTimezone() {
  return rawWeatherData.value?.timezone
}
function getSetCurrentTime() {
  var currentTime = rawWeatherData.value?.currently.time
  var timezone = getTimezone() ?? ''
  currentWeather.value.time = unixToHuman(timezone, currentTime).fullTime
}
function getSetSummary() {
  var currentSummary = convertToTitleCase(rawWeatherData.value?.currently?.summary)
  if (currentSummary.includes(' And')) {
    currentSummary = currentSummary.replace(' And', ',')
  }
  currentWeather.value.summary = currentSummary
}
function getSetPossibility() {
  var possible = formatPossibility(rawWeatherData.value.daily.icon)
  if (possible.includes(' And')) {
    possible = possible.replace(' And', ',')
  }
  currentWeather.value.possibility = possible
}
function getSetCurrentTemp() {
  var currentTemp = rawWeatherData.value.currently.temperature
  currentWeather.value.temp = fahToCel(currentTemp)
}
function getTodayDetails() {
  return rawWeatherData.value.daily.data[0]
}
function getSetTodayTempHighLowWithTime() {
  var timezone = getTimezone()
  var todayDetails = getTodayDetails()
  currentWeather.value.todayHighLow.todayTempHigh = fahToCel(todayDetails.temperatureMax)
  currentWeather.value.todayHighLow.todayTempHighTime = unixToHuman(
    timezone,
    todayDetails.temperatureMaxTime
  ).onlyTime
  currentWeather.value.todayHighLow.todayTempLow = fahToCel(todayDetails.temperatureMin)
  currentWeather.value.todayHighLow.todayTempLowTime = unixToHuman(
    timezone,
    todayDetails.temperatureMinTime
  ).onlyTime
}
function getHourlyInfoToday() {
  return rawWeatherData.value.hourly.data
}
function getSetHourlyTempInfoToday() {
  var unixTime = rawWeatherData.value.currently.time
  var timezone = getTimezone()
  var todayMonthDate = unixToHuman(timezone, unixTime).onlyMonthDate
  var hourlyData = getHourlyInfoToday()
  for (var i = 0; i < hourlyData.length; i++) {
    var hourlyTimeAllTypes = unixToHuman(timezone, hourlyData[i].time)
    var hourlyOnlyTime = hourlyTimeAllTypes.onlyTime
    var hourlyMonthDate = hourlyTimeAllTypes.onlyMonthDate
    if (todayMonthDate === hourlyMonthDate) {
      var hourlyObject = { hour: '', temp: '' }
      hourlyObject.hour = hourlyOnlyTime
      hourlyObject.temp = fahToCel(hourlyData[i].temperature).toString()
      tempVar.value.tempToday.push(hourlyObject)
    }
  }
  if (tempVar.value.tempToday.length <= 2) {
    var minTempObject = {
      hour: currentWeather.value.todayHighLow.todayTempHighTime,
      temp: currentWeather.value.todayHighLow.todayTempHigh
    }
    var maxTempObject = {
      hour: currentWeather.value.todayHighLow.todayTempLowTime,
      temp: currentWeather.value.todayHighLow.todayTempLow
    }
    tempVar.value.tempToday.unshift(maxTempObject, minTempObject)
  }
}

// For Today Highlights
function getSetUVIndex() {
  var uvIndex = rawWeatherData.value.currently.uvIndex
  highlights.value.uvIndex = uvIndex
}
function getSetVisibility() {
  var visibilityInMiles = rawWeatherData.value.currently.visibility
  highlights.value.visibility = mileToKilometer(visibilityInMiles)
}
function getSetWindStatus() {
  var windSpeedInMiles = rawWeatherData.value.currently.windSpeed
  highlights.value.windStatus.windSpeed = mileToKilometer(windSpeedInMiles)
  var absoluteWindDir = rawWeatherData.value.currently.windBearing
  highlights.value.windStatus.windDirection = absoluteWindDir
  highlights.value.windStatus.derivedWindDirection = deriveWindDir(absoluteWindDir)
}

// top level for info section
function organizeCurrentWeatherInfo() {
  getSetCurrentTime()
  getSetCurrentTemp()
  getSetTodayTempHighLowWithTime()
  getSetSummary()
  getSetPossibility()
}
function organizeTodayHighlights() {
  // top level for highlights
  getSetUVIndex()
  getSetVisibility()
  getSetWindStatus()
}

// topmost level orchestration
async function organizeAllDetails() {
  // top level organization
  await fetchWeatherData()
  organizeCurrentWeatherInfo()
  organizeTodayHighlights()
  getSetHourlyTempInfoToday()
}
onMounted(() => {
  location.value = 'Lagos'
  organizeAllDetails()
})
</script>
