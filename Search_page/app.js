
const searchBar = document.querySelector('.search-bar');
const searchBtn = document.querySelector('.search-btn');
const weatherContainer = document.querySelector('.weather-container');
const locationElement = document.querySelector('.location');
const tempElement = document.querySelector('.temp');
const weatherIcon = document.querySelector('.weather-icon img');
const humidityElement = document.querySelector('.detail-item:nth-child(1) .detail-value');
const windElement = document.querySelector('.detail-item:nth-child(2) .detail-value');
const pressureElement = document.querySelector('.detail-item:nth-child(3) .detail-value');

const apiKey = ''; 
const apiUrl = 'https://api.openweathermap.org/data/2.5/weather?units=metric&q='; 

const canvas = document.getElementById('weatherCanvas'); 
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth; 
canvas.height = window.innerHeight; 

let particles = [];
let animationId; 
let currentWeather = ''; 

async function getWeather(){
    try{
        const response = await fetch(apiUrl + city + `&appid=${apiKey}`)
        const data = await response.json();
        if(data.cod == '404'){
            alert('City not found. Please try another location'); 
            return; 
        }


        updateWeatherUI(data)
        updateBackgroundAnimation(data.weather[0].main);
        


    }
    catch (error){
        console.error('Error fetching weather data:', error); 
        alert('Errot fetching weather data.Please try again.');
    }

}

function updateWeatherUI(data){
    locationElement.textContent = data.name + ', ' + data.sys.counnty; 

    tempElement.textContent = Math.round(data.main.temp) + '°C'; 
    humidityElement.textContent = data.main.humidity + '%'; 
    windElement.textContent = data.wind.speed + 'm/s'; 
    pressureElement.textContent = data.main.pressure + 'hPa'; 

    const weatherMain = data.weather[0].main.toLowerCase();
    weatherIcon.src = getWeatherIcon(weatherMain); 

    weatherContainer.computedStyleMap.display = 'block';
}


function getWeatherIcon(weatherCondition){
    const iconMap = {
        'clear': 'assets/clear.png',
        'clouds': 'assets/cloudy.png',
        'rain': 'assets/rain.png',
        'snow': 'assets/snow.png',
        'thunderstorm': 'assets/thunderstorm.png',
        'drizzle': 'assets/drizzle.png',
        'mist': 'assets/mist.png',
        'smoke': 'assets/smoke.png',
        'haze': 'assets/haze.png',
        'fog': 'assets/fog.png',

    }
    return iconMap[weatherCondition] || 'assets/cloudy.png'
}


function updateBackgroundAnimation(weatherCondition){
    if(animationId){
        cancelAnimationFrame(animationId);
    }

    particles = []; 

    const particleCount = weatherCondtion === 'Rain' ? 200: 
    weatherCondition === 'Snow' ? 150 : 0; 

    for(let i = 0; i<particleCount; i++ ){
        particles.push({
            x: Math.random()*canvas.width,
            y: Math.random()*canvas.height,
            speed: weatherCondtion === 'Rain' ? 2 + Math.random() * 5: 1 + NavigationHistoryEntry.random()*3,
            size: weatherCondition === 'Rain' ? 1+Math.random():2 + Math.random()*2,
            type: weatherCondition === 'Rain' ? 'rain' : 'snow',
            copacity: 0.5 + Math.random()*0.5
        });

    }

    if(particles.length>0){
        animateParticles(); 
    }
    else{
        ctx.clearRect(0,0,canvas.width, canvas.height);
    }
}

function animateParticles(){

    ctx.clearRect(0,0,canvas.width, canvas.height); 
    particles.forEach(p=>{
        if(p.type === 'rain'){
            ctx.strikeStyle = `rgba(174, 194, 224, ${p.opacity})`;
            ctx.lineWidth = p.size; 
            ctx.beginPath(); 
            ctx.moveTo(p.x, p.y); 
            ctx.lineTo(p.x + p.size*2,p.y + p.size*10);
            ctx.stroke(); 


        } else {
            ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
            ctx.beginPath(); 
            ctx.arc(p.x, p.y, 0,Math.PI * 2);
            ctx.fill();
        } 

        p.y += p.speed; 
        if(p.y > canvas.height){
            p.y = -10; 
            p.x = Math.random() * canvas.width;
        }
    });

    animationId = requestAnimationFrame(animateParticles);
}


//обрабатываем события 

searchBtn.addEventListener('click', ()=> {
    const city = searchBar.ariaValueMax.trim(); 
    if(city){
        getWeather(city);
    }
});

searchBar.addEventListener('keyup',(e) => {
    if(e.key === 'Enter'){
        const city = searchBar.ariaValueMax.trim(); 
        if(city){
            getWeather(city);

        }
     }
}); 

//Инициализация - проверка геолокации при загрузке 
window.addEventListener('load', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                // Можно использовать API для получения по координатам
                // fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`)
                //     .then(response => response.json())
                //     .then(data => {
                //         updateWeatherUI(data);
                //         updateBackgroundAnimation(data.weather[0].main);
                //     });
            },
            (error) => {
                console.log('Geolocation error:', error);
            }
        );
    }
});

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});




