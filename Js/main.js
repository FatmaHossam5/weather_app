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
let searchBtn=document.querySelector(".search-btn");
let locationBtn=document.getElementById("locationBtn");
let tempToggle=document.getElementById("tempToggle");
let timeDisplay=document.getElementById("timeDisplay");
let weatherCards=document.querySelector(".weather-cards-section");
let details;
let currentArea="cairo";
let date;
let currentUnit = "celsius"; // Default to Celsius
let clockInterval; // For the real-time clock



let months =["Jan", "Feb", "March", "April", "May", "June", "July", "Aug", "Sept",  "Oct",  "Nov",  "Dec"];
let Days=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
async function checkDayWeather(currentArea){
    try {
        // Show loading state
        showLoadingState();
        
        response = await fetch( `https://api.weatherapi.com/v1/forecast.json?key=da9d900d3e3a4f229c530034220706&q=${currentArea}&days=3`);
        
        if (!response.ok) {
            throw new Error(`Weather data not found for "${currentArea}"`);
        }
        
        details = await response.json();
    displayDayWeather();
    getOtherDays();
        hideLoadingState();
        
    } catch (error) {
        console.error('Error fetching weather data:', error);
        showErrorMessage(error.message);
        hideLoadingState();
    }
  }
  checkDayWeather(currentArea);
   //search Event
  // Enhanced search functionality
  let searchTimeout;
  search.addEventListener("input", function () {
    clearTimeout(searchTimeout);
    const searchValue = search.value.trim();
    
    if (searchValue.length > 2) {
        searchTimeout = setTimeout(() => {
            currentArea = searchValue;
            checkDayWeather(currentArea);
        }, 500); // Debounce search
    }
  });
  
  // Search button click event
  searchBtn.addEventListener("click", function(e) {
    e.preventDefault();
    const searchValue = search.value.trim();
    if (searchValue) {
        currentArea = searchValue;
        checkDayWeather(currentArea);
    }
  });
  
  // Enter key support
  search.addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
        e.preventDefault();
        const searchValue = search.value.trim();
        if (searchValue) {
            currentArea = searchValue;
    checkDayWeather(currentArea);
        }
    }
  });

  // Temperature toggle functionality
  tempToggle.addEventListener('click', function() {
    toggleTemperatureUnit();
  });

  // Load saved temperature preference
  loadTemperaturePreference();

  // Navbar functionality
  setupNavbarLinks();

  // Geolocation functionality
  locationBtn.addEventListener('click', function() {
    getCurrentLocation();
  });

  function getCurrentLocation() {
    if (navigator.geolocation) {
      // Show loading state on location button
      locationBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Getting Location...';
      locationBtn.disabled = true;
      
      navigator.geolocation.getCurrentPosition(
        function(position) {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          
          // Use coordinates to get weather
          currentArea = `${latitude},${longitude}`;
          checkDayWeather(currentArea);
          
          // Reset button
          locationBtn.innerHTML = '<i class="fas fa-location-arrow"></i> Use My Location';
          locationBtn.disabled = false;
        },
        function(error) {
          // Handle geolocation errors
          let errorMessage = '';
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied by user. Please enable location access and try again.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable. Please try searching manually.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out. Please try again.';
              break;
            default:
              errorMessage = 'An unknown error occurred while retrieving location.';
              break;
          }
          
          showErrorMessage(errorMessage);
          
          // Reset button
          locationBtn.innerHTML = '<i class="fas fa-location-arrow"></i> Use My Location';
          locationBtn.disabled = false;
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    } else {
      showErrorMessage('Geolocation is not supported by this browser. Please search manually.');
    }
  }

  // Temperature conversion functions
  function celsiusToFahrenheit(celsius) {
    return Math.round((celsius * 9/5) + 32);
  }

  function fahrenheitToCelsius(fahrenheit) {
    return Math.round((fahrenheit - 32) * 5/9);
  }

  function toggleTemperatureUnit() {
    const tempUnits = tempToggle.querySelectorAll('.temp-unit');
    
    if (currentUnit === 'celsius') {
      currentUnit = 'fahrenheit';
      tempToggle.classList.add('fahrenheit');
      tempUnits[0].classList.remove('active');
      tempUnits[1].classList.add('active');
    } else {
      currentUnit = 'celsius';
      tempToggle.classList.remove('fahrenheit');
      tempUnits[1].classList.remove('active');
      tempUnits[0].classList.add('active');
    }

    // Save preference
    localStorage.setItem('temperatureUnit', currentUnit);

    // Update all temperature displays
    updateTemperatureDisplays();
  }

  function loadTemperaturePreference() {
    const savedUnit = localStorage.getItem('temperatureUnit');
    if (savedUnit && savedUnit !== currentUnit) {
      toggleTemperatureUnit();
    }
  }

  function updateTemperatureDisplays() {
    if (!details) return;

    // Update current temperature
    const currentTemp = details.current.temp_c;
    const displayTemp = currentUnit === 'fahrenheit' ? celsiusToFahrenheit(currentTemp) : currentTemp;
    degree.innerHTML = displayTemp;

    // Update unit display
    const unitDisplay = document.querySelector('.temperature-display .unit');
    if (unitDisplay) {
      unitDisplay.innerHTML = currentUnit === 'fahrenheit' ? '<sup>°</sup>F' : '<sup>°</sup>C';
    }

    // Update forecast temperatures
    for (let i = 0; i < maxDegree.length; i++) {
      if (details.forecast && details.forecast.forecastday[i + 1]) {
        const maxTemp = details.forecast.forecastday[i + 1].day.maxtemp_c;
        const minTemp = details.forecast.forecastday[i + 1].day.mintemp_c;
        
        const displayMaxTemp = currentUnit === 'fahrenheit' ? celsiusToFahrenheit(maxTemp) : Math.round(maxTemp);
        const displayMinTemp = currentUnit === 'fahrenheit' ? celsiusToFahrenheit(minTemp) : Math.round(minTemp);
        
        maxDegree[i].innerHTML = displayMaxTemp + (currentUnit === 'fahrenheit' ? '°F' : '°C');
        minDegree[i].innerHTML = displayMinTemp + (currentUnit === 'fahrenheit' ? '°F' : '°C');
      }
    }
  }

  // Real-time clock functionality
  function startClock(timezone = 'local') {
    // Clear existing interval
    if (clockInterval) {
      clearInterval(clockInterval);
    }

    function updateClock() {
      const now = new Date();
      let timeString;

      if (timezone === 'local') {
        timeString = now.toLocaleTimeString();
      } else {
        // For timezone-specific time (using timezone from weather API)
        try {
          timeString = now.toLocaleTimeString('en-US', {
            timeZone: timezone,
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          });
        } catch (error) {
          // Fallback to local time if timezone is invalid
          timeString = now.toLocaleTimeString();
        }
      }

      if (timeDisplay) {
        timeDisplay.textContent = timeString;
      }
    }

    // Update immediately
    updateClock();

    // Update every second
    clockInterval = setInterval(updateClock, 1000);
  }

  // Weather-based background functionality
  function updateWeatherBackground(weatherCondition) {
    // Remove all weather classes
    document.body.classList.remove('sunny', 'clear', 'cloudy', 'overcast', 'rainy', 'drizzle', 'snowy', 'foggy', 'thunderstorm', 'windy');

    if (!weatherCondition) return;

    const condition = weatherCondition.toLowerCase();
    
    // Map weather conditions to background classes
    if (condition.includes('sunny') || condition.includes('clear')) {
      if (condition.includes('night') || condition.includes('clear')) {
        document.body.classList.add('clear');
      } else {
        document.body.classList.add('sunny');
      }
    } else if (condition.includes('cloud') || condition.includes('overcast')) {
      if (condition.includes('overcast')) {
        document.body.classList.add('overcast');
      } else {
        document.body.classList.add('cloudy');
      }
    } else if (condition.includes('rain') || condition.includes('shower')) {
      if (condition.includes('light') || condition.includes('drizzle')) {
        document.body.classList.add('drizzle');
      } else {
        document.body.classList.add('rainy');
      }
    } else if (condition.includes('snow') || condition.includes('blizzard')) {
      document.body.classList.add('snowy');
    } else if (condition.includes('fog') || condition.includes('mist') || condition.includes('haze')) {
      document.body.classList.add('foggy');
    } else if (condition.includes('thunder') || condition.includes('storm')) {
      document.body.classList.add('thunderstorm');
    } else if (condition.includes('wind')) {
      document.body.classList.add('windy');
    } else {
      // Default for unknown conditions
      document.body.classList.add('cloudy');
    }
  }

  // Start the clock when page loads
  startClock();
  
  // Load saved hero background
  loadHeroBackground();
  

  // Navbar functionality
  function setupNavbarLinks() {
    // Home link
    document.getElementById('homeLink').addEventListener('click', function(e) {
      e.preventDefault();
      // Scroll to top smoothly
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setActiveNavLink('homeLink');
    });

    // News link
    document.getElementById('newsLink').addEventListener('click', function(e) {
      e.preventDefault();
      showNewsModal();
      setActiveNavLink('newsLink');
    });

    // Live Cameras link
    document.getElementById('camerasLink').addEventListener('click', function(e) {
      e.preventDefault();
      showCamerasModal();
      setActiveNavLink('camerasLink');
    });

    // Photos link
    document.getElementById('photosLink').addEventListener('click', function(e) {
      e.preventDefault();
      showPhotosModal();
      setActiveNavLink('photosLink');
    });

    // Contact link
    document.getElementById('contactLink').addEventListener('click', function(e) {
      e.preventDefault();
      showContactModal();
      setActiveNavLink('contactLink');
    });

    // Setup settings functionality
    setupSettings();
  }

  function setActiveNavLink(activeId) {
    // Remove active class from all links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => link.classList.remove('active'));
    
    // Add active class to clicked link
    document.getElementById(activeId).classList.add('active');
  }

  function showNewsModal() {
    populateWeatherAlerts();
    const modal = new bootstrap.Modal(document.getElementById('newsModal'));
    modal.show();
  }

  function showCamerasModal() {
    const modal = new bootstrap.Modal(document.getElementById('camerasModal'));
    modal.show();
  }

  function showPhotosModal() {
    populatePhotoGallery();
    const modal = new bootstrap.Modal(document.getElementById('photosModal'));
    modal.show();
  }

  function showContactModal() {
    const modal = new bootstrap.Modal(document.getElementById('contactModal'));
    modal.show();
  }

  function populateWeatherAlerts() {
    const alertsContainer = document.getElementById('alertsContainer');
    
    if (!details) {
      alertsContainer.innerHTML = '<div class="alert alert-warning"><i class="fas fa-exclamation-triangle"></i> Please search for a location to view weather alerts.</div>';
      return;
    }

    let alertsHTML = '';
    
    // Generate alerts based on weather conditions
    const condition = details.current.condition.text.toLowerCase();
    const temp = details.current.temp_c;
    const windSpeed = details.current.wind_kph;
    const humidity = details.current.humidity;

    if (temp > 35) {
      alertsHTML += '<div class="alert alert-warning"><i class="fas fa-thermometer-full"></i> <strong>Heat Advisory:</strong> High temperatures detected. Stay hydrated and avoid prolonged sun exposure.</div>';
    }
    
    if (temp < 0) {
      alertsHTML += '<div class="alert alert-info"><i class="fas fa-snowflake"></i> <strong>Cold Weather Alert:</strong> Freezing temperatures. Dress warmly and protect pipes from freezing.</div>';
    }

    if (windSpeed > 50) {
      alertsHTML += '<div class="alert alert-warning"><i class="fas fa-wind"></i> <strong>High Wind Warning:</strong> Strong winds detected. Secure loose objects and avoid outdoor activities.</div>';
    }

    if (condition.includes('rain') || condition.includes('storm')) {
      alertsHTML += '<div class="alert alert-info"><i class="fas fa-cloud-rain"></i> <strong>Weather Notice:</strong> Rainy conditions expected. Carry an umbrella and drive carefully.</div>';
    }

    if (condition.includes('snow')) {
      alertsHTML += '<div class="alert alert-info"><i class="fas fa-snowflake"></i> <strong>Snow Advisory:</strong> Snow conditions detected. Drive carefully and allow extra travel time.</div>';
    }

    if (humidity > 80) {
      alertsHTML += '<div class="alert alert-info"><i class="fas fa-tint"></i> <strong>High Humidity:</strong> Humid conditions may make it feel warmer than actual temperature.</div>';
    }

    if (alertsHTML === '') {
      alertsHTML = '<div class="alert alert-success"><i class="fas fa-check-circle"></i> <strong>All Clear:</strong> No weather alerts for your current location. Conditions are favorable!</div>';
    }

    // Add general weather info
    alertsHTML += `
      <div class="alert alert-info">
        <i class="fas fa-info-circle"></i>
        <strong>Current Conditions for ${details.location.name}:</strong><br>
        Temperature: ${currentUnit === 'fahrenheit' ? celsiusToFahrenheit(temp) : temp}${currentUnit === 'fahrenheit' ? '°F' : '°C'}<br>
        Condition: ${details.current.condition.text}<br>
        Wind: ${windSpeed} km/h<br>
        Humidity: ${humidity}%
      </div>
    `;

    alertsContainer.innerHTML = alertsHTML;
  }

  function populatePhotoGallery() {
    const photosContainer = document.getElementById('photosContainer');
    
    const weatherPhotos = [
      { src: 'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=1200&h=800&fit=crop', caption: 'Sunny Day', weather: 'sunny' },
      { src: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=1200&h=800&fit=crop', caption: 'Rainy Weather', weather: 'rainy' },
      { src: 'https://images.unsplash.com/photo-1478265409131-1f65c88f965c?w=1200&h=800&fit=crop', caption: 'Cloudy Sky', weather: 'cloudy' },
      { src: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=1200&h=800&fit=crop', caption: 'Snowy Landscape', weather: 'snowy' },
      { src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&fit=crop', caption: 'Misty Morning', weather: 'foggy' },
      { src: 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=1200&h=800&fit=crop', caption: 'Clear Night', weather: 'clear' },
      { src: 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=1200&h=800&fit=crop', caption: 'Storm Clouds', weather: 'thunderstorm' },
      { src: 'https://images.unsplash.com/photo-1536431311719-398b6704d4cc?w=1200&h=800&fit=crop', caption: 'Windy Day', weather: 'windy' }
    ];

    let photosHTML = '';
    const currentHeroBg = localStorage.getItem('heroBackground');
    
    weatherPhotos.forEach((photo, index) => {
      const isActive = currentHeroBg === photo.src ? 'active' : '';
      photosHTML += `
        <div class="col-md-3 col-sm-6 mb-3">
          <div class="photo-item ${isActive}" data-weather="${photo.weather}" data-src="${photo.src}">
            <img src="${photo.src}" alt="${photo.caption}" loading="lazy" onclick="setHeroBackground('${photo.src}', '${photo.caption}')">
            <div class="photo-caption">${photo.caption}</div>
          </div>
        </div>
      `;
    });

    photosContainer.innerHTML = photosHTML;
    
    // Setup reset button
    setupHeroBackgroundReset();
  }

  function setWeatherBackground(weatherType) {
    // Temporarily set background theme
    document.body.classList.remove('sunny', 'clear', 'cloudy', 'overcast', 'rainy', 'drizzle', 'snowy', 'foggy', 'thunderstorm', 'windy');
    document.body.classList.add(weatherType);
    
    // Show feedback
    showErrorMessage(`Background changed to ${weatherType} theme!`, 'success');
  }

  function setHeroBackground(photoSrc, caption) {
    // Get hero section
    const heroSection = document.querySelector('.hero-section');
    if (!heroSection) {
      console.error('Hero section not found');
      return;
    }

    // Update hero background image
    heroSection.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('${photoSrc}')`;
    
    // Save to localStorage
    localStorage.setItem('heroBackground', photoSrc);
    localStorage.setItem('heroBackgroundCaption', caption);
    
    // Update active state in gallery
    updateHeroBackgroundActiveState(photoSrc);
    
    // Show feedback
    showErrorMessage(`Hero background changed to ${caption}!`, 'success');
  }

  function updateHeroBackgroundActiveState(activeSrc) {
    // Remove active class from all items
    document.querySelectorAll('.photo-item').forEach(item => {
      item.classList.remove('active');
    });
    
    // Add active class to selected item
    if (activeSrc) {
      const activeItem = document.querySelector(`[data-src="${activeSrc}"]`);
      if (activeItem) {
        activeItem.classList.add('active');
      }
    }
  }

  function setupHeroBackgroundReset() {
    const resetBtn = document.getElementById('resetHeroBg');
    if (resetBtn) {
      resetBtn.addEventListener('click', function() {
        resetHeroBackground();
      });
    }
  }

  function resetHeroBackground() {
    // Get hero section
    const heroSection = document.querySelector('.hero-section');
    if (!heroSection) {
      console.error('Hero section not found');
      return;
    }

    // Reset to original background
    heroSection.style.backgroundImage = 'linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(../imgs/banner.png)';
    
    // Clear localStorage
    localStorage.removeItem('heroBackground');
    localStorage.removeItem('heroBackgroundCaption');
    
    // Update active state
    updateHeroBackgroundActiveState(null);
    
    // Show feedback
    showErrorMessage('Hero background reset to original!', 'success');
  }

  function loadHeroBackground() {
    const savedBg = localStorage.getItem('heroBackground');
    const savedCaption = localStorage.getItem('heroBackgroundCaption');
    
    if (savedBg) {
      const heroSection = document.querySelector('.hero-section');
      if (heroSection) {
        heroSection.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('${savedBg}')`;
      }
    }
  }


  function setupSettings() {
    // Auto-refresh setting
    document.getElementById('autoRefresh').addEventListener('change', function() {
      const isEnabled = this.checked;
      localStorage.setItem('autoRefresh', isEnabled);
      if (isEnabled) {
        // Start auto-refresh every 10 minutes
        setInterval(() => {
          if (currentArea) {
            checkDayWeather(currentArea);
          }
        }, 600000); // 10 minutes
      }
    });

    // Show clock setting
    document.getElementById('showClock').addEventListener('change', function() {
      const clockElement = document.getElementById('localTime');
      if (this.checked) {
        clockElement.style.display = 'flex';
        startClock();
      } else {
        clockElement.style.display = 'none';
        if (clockInterval) {
          clearInterval(clockInterval);
        }
      }
      localStorage.setItem('showClock', this.checked);
    });

    // Weather theme setting
    document.getElementById('weatherBg').addEventListener('change', function() {
      const isEnabled = this.checked;
      if (!isEnabled) {
        // Reset to default background
        document.body.classList.remove('sunny', 'clear', 'cloudy', 'overcast', 'rainy', 'drizzle', 'snowy', 'foggy', 'thunderstorm', 'windy');
      } else if (details) {
        // Reapply current weather theme
        updateWeatherBackground(details.current.condition.text);
      }
      localStorage.setItem('weatherBg', isEnabled);
    });

    // Load saved settings
    loadSettings();
  }

  function loadSettings() {
    const autoRefresh = localStorage.getItem('autoRefresh');
    const showClock = localStorage.getItem('showClock');
    const weatherBg = localStorage.getItem('weatherBg');

    if (autoRefresh !== null) {
      document.getElementById('autoRefresh').checked = autoRefresh === 'true';
    }
    if (showClock !== null) {
      document.getElementById('showClock').checked = showClock === 'true';
      if (showClock === 'false') {
        document.getElementById('localTime').style.display = 'none';
      }
    }
    if (weatherBg !== null) {
      document.getElementById('weatherBg').checked = weatherBg === 'true';
    }
  }

  // current day
  function displayDayWeather() {
    date = new Date();
    today.innerHTML = Days[date.getDay()];
    dateDay.innerHTML = `${date.getDate()} ${months[date.getMonth()]}`;
    locationCity.innerHTML = details.location.name;
    
    // Display temperature with current unit
    const currentTemp = details.current.temp_c;
    const displayTemp = currentUnit === 'fahrenheit' ? celsiusToFahrenheit(currentTemp) : currentTemp;
    degree.innerHTML = displayTemp;
    
    // Update unit display
    const unitDisplay = document.querySelector('.temperature-display .unit');
    if (unitDisplay) {
      unitDisplay.innerHTML = currentUnit === 'fahrenheit' ? '<sup>°</sup>F' : '<sup>°</sup>C';
    }
    
    dayIcon.setAttribute(
      "src",
      `https:${details.current.condition.icon}`
    );
    weatherCase.innerHTML = details.current.condition.text;
    humidity.innerHTML = details.current.humidity;
    wind.innerHTML = details.current.wind_kph;
    compass.innerHTML = details.current.wind_dir;

    // Update weather-based background
    updateWeatherBackground(details.current.condition.text);

    // Start clock with location timezone (if available)
    if (details.location && details.location.tz_id) {
      startClock(details.location.tz_id);
    } else {
      startClock(); // Fallback to local time
    }
  }
 
  
  // other days
  function  getOtherDays(){
    for(let i=0; i<nextDay.length;i++){
      nextDay[i].innerHTML=Days[new Date(details.forecast.forecastday[i+1].date).getDay()];
      
      // Display temperatures with current unit
      const maxTemp = details.forecast.forecastday[i+1].day.maxtemp_c;
      const minTemp = details.forecast.forecastday[i+1].day.mintemp_c;
      
      const displayMaxTemp = currentUnit === 'fahrenheit' ? celsiusToFahrenheit(maxTemp) : Math.round(maxTemp);
      const displayMinTemp = currentUnit === 'fahrenheit' ? celsiusToFahrenheit(minTemp) : Math.round(minTemp);
      
      maxDegree[i].innerHTML = displayMaxTemp + (currentUnit === 'fahrenheit' ? '°F' : '°C');
      minDegree[i].innerHTML = displayMinTemp + (currentUnit === 'fahrenheit' ? '°F' : '°C');
      
      otherDayCustom[i].innerHTML=details.forecast.forecastday[i+1].day.condition.text;
      iconODay[i].setAttribute(
        "src", 
        `https:${details.forecast.forecastday[i+1].day.condition.icon}`
      );

    }
  }
  
  // Loading and Error State Functions
  function showLoadingState() {
    weatherCards.classList.add('loading');
    searchBtn.disabled = true;
    searchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
  }
  
  function hideLoadingState() {
    weatherCards.classList.remove('loading');
    searchBtn.disabled = false;
    searchBtn.innerHTML = '<i class="fas fa-search"></i> Find';
  }
  
  function showErrorMessage(message, type = 'error') {
    // Create message element
    const messageDiv = document.createElement('div');
    const alertClass = type === 'success' ? 'alert-success' : 'alert-danger';
    const title = type === 'success' ? 'Success!' : 'Error!';
    
    messageDiv.className = `alert ${alertClass} alert-dismissible fade show position-fixed`;
    messageDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; max-width: 400px;';
    messageDiv.innerHTML = `
      <strong>${title}</strong> ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    document.body.appendChild(messageDiv);
    
    // Auto-remove after 3 seconds for success, 5 for error
    const timeout = type === 'success' ? 3000 : 5000;
    setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.remove();
      }
    }, timeout);
  }
 