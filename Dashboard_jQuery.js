$(document).ready(function () {
    let temperature;
    const my_apiKey = 'd3339907c46e21a29b2901ec928febcf';

    function getWeatherByGeolocation() {  //for fetching and displaying the weather for current location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                const weatherAPI_Url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${my_apiKey}&units=metric`;
                const DayforecastAPI_url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${my_apiKey}&units=metric`;

                //fetching weather details from weather API and calling weather data for displaying weather information
                $.getJSON(weatherAPI_Url, function (data) {   
                    if (data.cod === 200) {
                        WeatherData(data);
                    } else {
                        alert('Unable to retrieve weather data.');
                    }
                }).fail(function () {
                    alert('Error fetching data from the weather API. Please check your network connection.');
                });

                // Fetch forecast data
                fetch(DayforecastAPI_url)  //calling forecast API for five days weather forecast
                    .then(response => response.json())
                    .then(data => {
                        const forecastData = data.list;
                        Process_5_Day_Forcast_Data(forecastData);
                    })
                    //error section
                    .catch(error => {
                        console.error('Error fetching weather data:', error);
                    });
            }, function () {
                alert('Unable to retrieve your location. Enable Location in browser settings.');
            });
        } else {
            alert('Geolocation is not supported by this browser.');
        }
    }

    // Function to display weather data on the page
    function WeatherData(data) {

        //fetching certain information from data
        temperature = data.main.temp;
        const humidity = data.main.humidity;
        const windSpeed = data.wind.speed;
        const weatherDesc = data.weather[0].description;
        const cityName = data.name;
        const date = new Date().toLocaleDateString('en-UK');
        const iconCode = data.weather[0].icon;

        $('#temperature span').text(temperature);
        $('#humidity span').text(humidity);
        $('#windSpeed span').text(windSpeed);
        $('#weatherDescription span').text(weatherDesc.charAt(0).toUpperCase() + weatherDesc.slice(1));
        $('#city span').text(cityName);
        $('#date span').text(date);
        $('#weatherIcon').attr('src', `https://openweathermap.org/img/wn/${iconCode}@2x.png`);

        changeWidgetBackground(weatherDesc.toLowerCase());
    }

    //function for changing temperature from calcius to fehrenheit
    $('#F_temp').click(function () {    
        const Fehrenheit_Temp = (temperature * 9 / 5) + 32;
        $('#temperature span').text(Fehrenheit_Temp.toFixed(2));

        $('#F_temp').css('font-weight', 'bold');
        $('#C_temp').css('font-weight', 'normal');
    });

    //function for reseting temperature to celsius
    $('#C_temp').click(function () {    
        const Celsius_Temp = temperature;
        $('#temperature span').text(Celsius_Temp);

        $('#C_temp').css('font-weight', 'bold');
        $('#F_temp').css('font-weight', 'normal');
    });

    // Call the geolocation function to fetch weather data on page load
    getWeatherByGeolocation();

    
    //when search button clicked do the following actions
    $('#get-city').on('click', function () {
        let city = $('#get-city_input').val().trim(); 
        
        if (city === "") {
            alert("Input field is empty. Please enter a city name.");
        } else {
            fetchCityWeather();
        }
    });
    
    //when enter button pressed do the following actions
    $('.searchBar input[type="text"]').on('keydown', function (event) {
        let city = $(this).val().trim(); 
        if (event.key === 'Enter') {
            event.preventDefault();
            
            if (city === "") {
                alert("Input field is empty. Please enter a city name.");
            } else {
                fetchWeatherData();
            }
        }
    });
    

    //fetching weather data for particular city that is entered by the user
    function fetchWeatherData() {
        const city = $('.searchBar input[type="text"]').val();
        const weatherAPI_Url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${my_apiKey}&units=metric`;
        const geoAPI_url = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${my_apiKey}`;
    
        $.getJSON(geoAPI_url, function (geoData) {
            if (geoData.length > 0) {  //getting city's latitude and longitude
                const cityLatitude = geoData[0].lat;
                const cityLongitude = geoData[0].lon;
    
                const DayforecastAPI_url = `https://api.openweathermap.org/data/2.5/forecast?lat=${cityLatitude}&lon=${cityLongitude}&appid=${my_apiKey}&units=metric`;
    
                fetch(DayforecastAPI_url)  //fetching five days data for displaying in canvas
                    .then(response => response.json())
                    .then(data => {
                        const forecastData = data.list;
                        Process_5_Day_Forcast_Data(forecastData);
                    })
                    .catch(error => {
                        console.error('Error fetching weather data:', error);
                    });
            } else {
                alert('City not found.');
            }
        }).fail(function () {
            alert('Error fetching data from the geo API. Please check your network connection.');
        });
    
        $.getJSON(weatherAPI_Url, function (data)   //if data fetched then call weather data function
        {
            if (data.cod === 200) {
                WeatherData(data);
            } else {
                alert('City not found.');
            }
        }).fail(function () {
            alert('Error fetching data from the weather API. Please check your network connection.');
        });
    }
    
    
    //function for changing background image of weather widget
    function changeWidgetBackground(weatherDesc) {
        let backgroundUrl;

        if (weatherDesc.includes('clear')) {
            backgroundUrl = 'url(images/clear.jpg)';
            $('.weather-widget').css({
                'color': 'black'
           });
        } else if (weatherDesc.includes('clouds')) {
            backgroundUrl = 'url(images/cloudy.webp)';
            $('.weather-widget').css({
                'color': 'black'
           });
        } else if (weatherDesc.includes('rain')) {
            backgroundUrl = 'url(images/rainy.webp)';
            $('.weather-widget').css({
                'color': 'black'
           });
        } else if (weatherDesc.includes('thunderstorm')) {
            backgroundUrl = 'url(images/thunderstorm.webp)';
            $('.weather-widget, #F_temp, #C_temp').css({
                'color': 'white'
            });
        } else if (weatherDesc.includes('drizzle') || weatherDesc.includes('light rain')) {
            backgroundUrl = 'url(images/drizzle.webp)';
            $('.weather-widget').css({
                'color': 'black'
           });
        } else if (weatherDesc.includes('snow')) {
            backgroundUrl = 'url(images/snowy.webp)';
            $('.weather-widget').css({
                'color': 'black'
           });
        } else if (weatherDesc.includes('mist') || weatherDesc.includes('fog') || weatherDesc.includes('haze')) {
            backgroundUrl = 'url(images/Haze.webp)';
            $('.weather-widget').css({
                'color': 'black'
           });
        } else if (weatherDesc.includes('smoke') || weatherDesc.includes('smog') ) {
            backgroundUrl = 'url(images/smog.jpg)';
            $('.weather-widget').css({
                'color': 'black'
           });
        }
        else {
            backgroundUrl = 'url(images/default.jpg)';
        }

        $('.weather-widget').css({
            'background-image': backgroundUrl,
            'background-size': 'cover',
            'background-position': 'center',
            'background-repeat': 'no-repeat',
        });
    }



    //for displaying 5 day forecast in charts
    function Process_5_Day_Forcast_Data(forecastData)
    {
        const temperatures = [];
        const weatherConditions = {};
        const labels = [];

        const today = new Date();

        const nextFiveDays = [];
        for (let i = 0; i < 5; i++) {
            const nextDate = new Date(today);
            nextDate.setDate(today.getDate() + i);
            const options = { weekday: 'short' };
            const dayOfWeek = nextDate.toLocaleDateString('en-US', options);
            const dayOfMonth = nextDate.getDate();
            const formattedDate = `${dayOfWeek}, ${dayOfMonth}`;
            nextFiveDays.push(formattedDate);
        }

        // Process the forecast data
        for (let i = 0; i < forecastData.length; i += 8) {
            const entry = forecastData[i];
            const temp = entry.main.temp;
            const weather = entry.weather[0].main;
            const date = new Date(entry.dt * 1000);
            const options = { weekday: 'short' };
            const dayOfWeek = date.toLocaleDateString('en-US', options);
            const dayOfMonth = date.getDate();
            const formattedDate = `${dayOfWeek}, ${dayOfMonth}`; // Format as "weekday, day"

            if (nextFiveDays.includes(formattedDate)) {
                temperatures.push(temp);
                labels.push(formattedDate);
            }

            weatherConditions[weather] = (weatherConditions[weather] || 0) + 1;
        }

        drawVerticalBarChart(labels, temperatures);
        drawDoughnutChart(weatherConditions);
        drawLineChart(labels, temperatures);
    }

    //defiing bar colors for charts
   const barColors = [
        'rgba(153, 102, 255, 0.5)',
        'rgba(54, 162, 235, 0.5)',
        'rgba(75, 192, 192, 0.5)',
        'rgba(255, 99, 132, 0.5)',
        'rgba(255, 205, 86, 0.5)',
    ];

    const borderColors = [
        'rgba(153, 102, 255, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(255, 99, 132, 1)',
        'rgba(255, 205, 86, 1)',
    ];


    //vertical canvas bar chart for displaying 5 days forcast
    let VerticalChart;
function drawVerticalBarChart(labels, data) {
    const ctx = document.getElementById('vertical_BarChart').getContext('2d');
    
    if (VerticalChart) {
        VerticalChart.destroy(); // Destroy previous chart if it exists
    }

    VerticalChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: "",
                data: data,
                backgroundColor: barColors,
                borderColor: borderColors,
                borderWidth: 1,
                barThickness: 40,
            }]
        },
        options: {
            plugins: {
                legend: {
                    display: true, 
                    labels: {
                        generateLabels: function(chart) {
                            return chart.data.datasets.map(function(dataset, i) {
                                return {
                                    text: dataset.label, 
                                    fillStyle: 'transparent', 
                                    strokeStyle: 'transparent',
                                };
                            });
                        },
                        color: 'white', 
                    },
                    title: {
                        display: true,
                        text: 'Temperature °C for next Five Days',
                        color: 'white',
                    }
                }
            },
            scales: {
                y: {
                    ticks: {
                        color: 'white', 
                    },
                },
                x: {
                    ticks: {
                        color: 'white', 
                    }
                }
            },
            animation: {
                delay: 50, 
            }
        }
    });
}

    // Doughnut canvas chart for displaying 5 days forcast    
    let doughnutChart;
    function drawDoughnutChart(weatherConditions) {
        const ctx = document.getElementById('doughnut_Chart').getContext('2d');
        if (doughnutChart) {
            doughnutChart.destroy();
        }
        const labels = Object.keys(weatherConditions);
        const data = Object.values(weatherConditions);

        doughnutChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Weather Conditions',
                    data: data,
                    backgroundColor: barColors,
                    borderColor: borderColors,
                }]
            },
            options: {
                plugins: {
                    legend: {
                        labels: {
                            color: 'white'
                        }
                    }
                },

                animation: {
                    delay: 50, 
                }

            }
        });
    }

    //Linechart for displaying 5 day forecast
    let LineChart;
    function drawLineChart(labels, data) {
        const ctx = document.getElementById('line_Chart').getContext('2d');
        if (LineChart) {
            LineChart.destroy();
        }
        LineChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: '',
                    data: data,
                    fill: false,
                    borderColor: 'rgba(75, 192, 192, 0.5)',
                    pointBorderColor: barColors,
                    tension: 0.2,
                    pointRadius: 5,
                    borderWidth: 4,                    
                }]
            },
            options: {
                scales: {
                    y: {
                        ticks: {
                            color: 'white',
                        },
                    },
                    x: {
                        ticks: {
                            color: 'white',
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true, 
                        labels: {
                            generateLabels: function(chart) {
                                return chart.data.datasets.map(function(dataset, i) {
                                    return {
                                        text: dataset.label, 
                                        fillStyle: 'transparent', 
                                        strokeStyle: 'transparent',
                                    };
                                });
                            },
                            color: 'white', 
                        },
                        title: {
                            display: true,
                            text: 'Temperature °C Change for Five Days',
                            color: 'white',
                        },
                        // layout: {
                        //     padding: {
                        //         top: 100, // Padding at the top only
                        //     }
                        // },
                    }
                },
                animation: {
                    drop: {
                        duration: 800
                    }
                },
            }
        });
    }
});
