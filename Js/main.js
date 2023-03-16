let today=document.getElementById("day");
let dateDay=document.getElementById("datet");
let locationCity=document.getElementById("location");
let degree=document.getElementById("degree");
let dayIcon=document.getElementById("icon");
let weatherCase=document.getElementById("custom");
let humidity=document.getElementById("humidity");
let wind=document.getElementById("wind");
let compass=document.getElementById("compass");

//other days (card2,card3)
let nextDay=document.querySelectorAll(".otherDay");
let maxDegree=document.querySelectorAll(".max-degree");
let minDegree=document.querySelectorAll(".min-degree");
let otherDayCustom=document.querySelectorAll(".otherday-custom");
let iconODay=document.querySelectorAll(".otherday-icon");
let search=document.getElementById("search");
let details;
let currentArea="cairo";
let date;



let months =["Jan", "Feb", "March", "April", "May", "June", "July", "Aug", "Sept",  "Oct",  "Nov",  "Dec"];
let Days=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
async function checkDayWeather(currentArea){
    response = await fetch( `https://api.weatherapi.com/v1/forecast.json?key=da9d900d3e3a4f229c530034220706&q=${currentArea}07112&days=3`);
    details=await response.json();
    displayDayWeather();
    getOtherDays();
  }
  checkDayWeather(currentArea);
   //search Event
  search.addEventListener("keyup", function () {
    currentArea = search.value;
    checkDayWeather(currentArea);
  });
  // current day
  function displayDayWeather() {
    date = new Date();
    today.innerHTML = Days[date.getDay()];
    dateDay.innerHTML = `${date.getDate()} ${months[date.getMonth()]}`;
    locationCity.innerHTML = details.location.name;
    degree.innerHTML = details.current.temp_c;
    dayIcon.setAttribute(
      "src",
      `https:${details.current.condition.icon}`
    );
    weatherCase.innerHTML = details.current.condition.text;
    humidity.innerHTML = details.current.humidity;
    wind.innerHTML = details.current.wind_kph;
    compass.innerHTML = details.current.wind_dir;
  }
 
  
  // other days
  function  getOtherDays(){
    for(let i=0; i<nextDay.length;i++){
      nextDay[i].innerHTML=Days[new Date(details.forecast.forecastday[i+1].date).getDay()];
      maxDegree[i].innerHTML=details.forecast.forecastday[i+1].day.maxtemp_c;
      minDegree[i].innerHTML=details.forecast.forecastday[i+1] .day.mintemp_c;
      otherDayCustom[i].innerHTML=details.forecast.forecastday[i+1].day.condition.text;
      iconODay[i].setAttribute(
        "src", 
        `https:${details.forecast.forecastday[i+1].day.condition.icon}`
      );

    }
  }
 