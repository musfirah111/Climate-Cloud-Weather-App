$(document).ready(function () {
    const my_weatherApiKey = 'd3339907c46e21a29b2901ec928febcf';
    const my_geminiApiKey = 'AIzaSyDoWYB677EqkwGir6SWIUNb3O0JZHxA_rA';
    const entriesPerPage = 10;
    let currentPage = 1;
    let fiveDayTemperaturesCurrentCity = [];
    let fiveDayTemperaturesSpecifiedCity = [];

    getWeatherByGeolocation();

    //function for displaying weather data for current location
    function getWeatherByGeolocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                fetchWeatherData(lat, lon);
            }, function () {
                alert('Unable to retrieve your location. Enable Location in browser settings.');
            });
        } else {
            alert('Geolocation is not supported by this browser.');
        }
    }

    //when search button pressed after entering city do the following actions
    $('#get-city').on('click', function () {
        let city = $('#get-city_input').val().trim(); 
        
        if (city === "") {
            alert("Input field is empty. Please enter a city name.");
        } else {
            fetchCityWeather();
        }
    });
    
    
    //when enter button is pressed do the following actions
    $('.searchBar input[type="text"]').on('keydown', function (event) {
        let city = $(this).val().trim(); 
        if (event.key === 'Enter') {
            event.preventDefault();  //prevent fault submission
            
            if (city === "") {
                alert("Input field is empty. Please enter a city name.");
            } else {
                fetchWeatherData();
            }
        }
    });
    

    //fetching weather data for particular city to display in tables
    function fetchCityWeather() {
        const city = $('.searchBar input[type="text"]').val();
        const geoAPI_url = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${my_weatherApiKey}`;
    
        $.getJSON(geoAPI_url, function (geoData) {
            if (geoData.length > 0) {
                const cityLatitude = geoData[0].lat;
                const cityLongitude = geoData[0].lon;
                fetchWeatherData(cityLatitude, cityLongitude);
            } else {
                alert('City not found. Please try again.');
            }
        }).fail(function () {
            alert('Failed to fetch location data. Check the city name.');
        });
    }
    
    //fetching weather data for current city to display in tables
    function fetchWeatherData(lat, lon) {
        const weatherAPI_Url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${my_weatherApiKey}&units=metric`;

        $.ajax({
            url: weatherAPI_Url,
            method: 'GET',
            success: function (data) {
                fiveDayTemperaturesCurrentCity = data.list.map(forecast => forecast.main.temp);
                console.log(`Temperatures :`, fiveDayTemperaturesCurrentCity);
                Forecast_Display(data);               
            },
            error: function () {
                alert('Failed in fetching weather data.');
            }
        });
    }

    let weatherDescription;
    let dateObj;
    let weekday, day, formattedDate;
    let iconCode;
    let originalRows = []; 
    let currentRows = []; 
    
    //displaying 5 days wether data in tables and using pagination 
    function Forecast_Display(data) {
        
        const forecastList = data.list;
        const totalEntries = forecastList.length;
        const totalPages = Math.ceil(totalEntries / entriesPerPage);
    

        //rendering equal enteries in each page through pagination
        function renderTable(page) {
            const start = (page - 1) * entriesPerPage;
            const end = Math.min(start + entriesPerPage, totalEntries);
            currentRows = []; 
    
            //fetch particula data 
            for (let i = start; i < end; i++) {
                const temperature = forecastList[i].main.temp.toFixed(0);
                dateObj = new Date(forecastList[i].dt * 1000);
                weekday = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                day = dateObj.toLocaleDateString('en-US', { day: 'numeric' });
                formattedDate = `${weekday}, ${day}`;
                iconCode = forecastList[i].weather[0].icon;
                weatherDescription = forecastList[i].weather[0].description;
    
                //pushing data to the tables
                currentRows.push(`
                    <tr>
                        <td>${dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                        <td>${formattedDate}</td>
                        <td>${temperature} °C</td>
                        <td>
                            <img src="https://openweathermap.org/img/wn/${iconCode}@2x.png" alt="weather icon">
                            <span>${weatherDescription}</span>
                        </td>
                    </tr>
                `);
            }
    
            $('#forcastTable_rows').html(currentRows.join(''));
            Render_Pagination(totalPages);
            originalRows = currentRows.slice(); 
        }
    
        //creating pages and displaying data on each page when page selected
        function Render_Pagination(totalPages) {
            $('.pagination').empty();
    
            const maxVisiblePages = 3;

            //number of enteries at the start and endpage altogether
            let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
            let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
            if (endPage - startPage + 1 < maxVisiblePages) {
                startPage = Math.max(1, endPage - maxVisiblePages + 1);
            }
    
            const Prev_Page = $('<a class="prev_page">«</a>');
            Prev_Page.click(function () {
                if (currentPage > 1) {
                    currentPage--;
                    renderTable(currentPage);
                    Render_Pagination(totalPages);
                }
            });
            $('.pagination').append(Prev_Page);
    
            for (let i = startPage; i <= endPage; i++) {
                const page_button = $(`<a class="page_num">${i}</a>`);
    
                if (i === currentPage) {
                    page_button.addClass('active');
                }
    
                page_button.click(function () {
                    currentPage = i;
                    renderTable(currentPage);
                    Render_Pagination(totalPages);
                });
    
                $('.pagination').append(page_button);
            }
    
            const next_button = $('<a class="next_btn">»</a>');
            next_button.click(function () {
                if (currentPage < totalPages) {
                    currentPage++;
                    renderTable(currentPage);
                    Render_Pagination(totalPages);
                }
            });
            $('.pagination').append(next_button);
        }
    
        renderTable(currentPage);
    }
    

    //if nothing typed in the chatbot search, serch button is inactivated
    var $inputField = $('#chatbot_search');
    var $searchButton = $('#search_gemini');

    function toggleSearchButton() {
        if ($inputField.val().trim() === '') {
            $searchButton.prop('disabled', true); 
            $searchButton.css('background-color', 'grey'); 
        } else {
            $searchButton.prop('disabled', false); 
            $searchButton.css('background-color', '#003550'); 
        }
    }
    //when text entered activate the search button
    $inputField.on('input', toggleSearchButton);
    toggleSearchButton();

    // Function to get response from Gemini API
    function getGeminiResponse(query) {
        const apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=" + my_geminiApiKey;
    
        console.log('Sending query to Gemini API:', query);
    
        return fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            {
                                text: query
                            }
                        ]
                    }
                ]
            })
        })
        .then(response => {
            if (!response.ok){
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data =>
        {     
            if (data.candidates && data.candidates.length > 0 && data.candidates[0].content.parts.length > 0) {
                const generatedResponse = data.candidates[0].content.parts[0].text;
                return generatedResponse; 
            }
            else {
                throw new Error('Unexpected response structure');
            }
        })
        .catch(error => {
            return "Error in fetching response.";
        });
    }
    

    //fetching latitude and lontitude current location to answer today weather in chatbot 
    function getWeatherByGeolocationForChatbot() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                fetchWeatherForChatbot(lat, lon);  // Fetch weather for chatbot
            }, function () {
                displayInChatbot("Unable to retrieve your location.");
            });
        } else {
            displayInChatbot("Geolocation is not supported by this browser.");
        }
    }
    
    //fetching weather data for current location through API to answer today weather in chatbot 
    function fetchWeatherForChatbot(lat, lon) {
        const weatherAPI_Url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${my_weatherApiKey}&units=metric`;
    
        $.ajax({
            url: weatherAPI_Url,
            method: 'GET',
            success: function (data) {
                displayWeatherInChatbot(data); 
            },
            error: function () {
                displayInChatbot('Failed in fetching weather data for the chatbot.');
            }
        });
    }
    
    //fetching weather data for particular city through API to answer today weather in chatbot 
    function fetchCityWeatherforChatbot(city) {
        const weatherAPI_Url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${my_weatherApiKey}&units=metric`;

        $.ajax({
            url: weatherAPI_Url,
            method: 'GET',
            success: function (data) {
                displayWeatherInChatbot(data);  // Display weather in chatbot
            },
            error: function () {
                displayInChatbot('Failed in fetching weather data for the city.');
            }
        });

        
    }
    
        
    //fetching 5 days weather data for particular city through API to answer temperature questions in chatbot 
    function fetch_FivedayCityWeatherforChatbot(city, callback) {
        const fiveDayWeatherAPI_Url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${my_weatherApiKey}&units=metric`;
    
        $.ajax({
            url: fiveDayWeatherAPI_Url,
            method: 'GET',
            success: function (data) {
                fiveDayTemperaturesSpecifiedCity = data.list.map(forecast => forecast.main.temp);
                console.log(`Temperatures for ${city}:`, fiveDayTemperaturesSpecifiedCity);
                if (callback) callback(); // Call the callback after fetching temperatures
            },
            error: function () {
                displayInChatbot('Failed in fetching five-day weather data for the city.');
            }
        });
    }
    
    // Function to display weather in chatbot
    function displayWeatherInChatbot(data) {
        const cityName = data.name;
        const weatherDescription = data.weather[0].description;
        const temp = data.main.temp;
        const humidity = data.main.humidity;

        const weatherMessage = `Weather in ${cityName}: ${weatherDescription}<br>
        Temperature: ${temp}°C<br>
        Humidity: ${humidity}%`;

        $('#chatbot').append(`<div class='chatbot_response'>${weatherMessage}</div>`);
    }
    
   // Function to process weather-related queries
    function processWeatherQuery(query) {
    const lowercaseQuery = query.toLowerCase();

    // Check if asking for the highest temperature in the current city this week
    if (lowercaseQuery.includes("highest temperature this week") && !lowercaseQuery.includes("in")) {
        const highestTemp = Math.max(...fiveDayTemperaturesCurrentCity);
        const response = `The highest temperature this week in your current location is ${highestTemp}°C.`;
        $('#chatbot').append(`<div class='chatbot_response'>${response}</div>`);
        return true;
    }

    // Check if asking for the lowest temperature in the current city this week
    if (lowercaseQuery.includes("lowest temperature this week") && !lowercaseQuery.includes("in")) {
        const lowestTemp = Math.min(...fiveDayTemperaturesCurrentCity);
        const response = `The lowest temperature this week in your current location is ${lowestTemp}°C.`;
        $('#chatbot').append(`<div class='chatbot_response'>${response}</div>`);
        return true;
    }

    // Check if asking for the average temperature in the current city this week
    if (lowercaseQuery.includes("average temperature this week") && !lowercaseQuery.includes("in")) {
        const avgTemp = (fiveDayTemperaturesCurrentCity.reduce((a, b) => a + b, 0) / fiveDayTemperaturesCurrentCity.length).toFixed(2);
        const response = `The average temperature this week in your current location is ${avgTemp}°C.`;
        $('#chatbot').append(`<div class='chatbot_response'>${response}</div>`);
        return true;
    }

    // Check if asking for the highest temperature in the particular city this week
    if (lowercaseQuery.includes("highest temperature this week in")) {
        const city = lowercaseQuery.match(/in (.+)/)[1];
        fetch_FivedayCityWeatherforChatbot(city, () => {
            const highestTemp = Math.max(...fiveDayTemperaturesSpecifiedCity);
            const response = `The highest temperature this week in ${city} is ${highestTemp}°C.`;
            $('#chatbot').append(`<div class='chatbot_response'>${response}</div>`);
        });
        return true; 
    }

    // Check if asking for the lowest temperature in a specific city
    if (lowercaseQuery.includes("lowest temperature this week in")) {
        const city = lowercaseQuery.match(/in (.+)/)[1];
        fetch_FivedayCityWeatherforChatbot(city, () => {
            const lowestTemp = Math.min(...fiveDayTemperaturesSpecifiedCity);
            const response = `The lowest temperature this week in ${city} is ${lowestTemp}°C.`;
            $('#chatbot').append(`<div class='chatbot_response'>${response}</div>`);
        });
        return true; // Return here to avoid premature response
    }

    // Check if asking for the average temperature in a specific city
    if (lowercaseQuery.includes("average temperature this week in")) {
        const city = lowercaseQuery.match(/in (.+)/)[1];
        fetch_FivedayCityWeatherforChatbot(city, () => {
            const avgTemp = (fiveDayTemperaturesSpecifiedCity.reduce((a, b) => a + b, 0) / fiveDayTemperaturesSpecifiedCity.length).toFixed(0);
            const response = `The average temperature this week in ${city} is ${avgTemp}°C.`;
            $('#chatbot').append(`<div class='chatbot_response'>${response}</div>`);
        });
        return true; // Return here to avoid premature response
    }

    // City-based weather
    const matchCityQuery = lowercaseQuery.match(/weather today in (.+)/) || lowercaseQuery.match(/weather today of (.+)/);
    if (matchCityQuery) {
        const city = matchCityQuery[1];
        fetchCityWeatherforChatbot(city);
        return true;
    }

    // Geolocation-based weather
    if (lowercaseQuery.includes("weather today")) {
        getWeatherByGeolocationForChatbot();
        return true;
    }

    return false;
}

//do the following action when searched button pressed in chatbot
$('#search_gemini').click(function () {
    const userQuestion = $('#chatbot_search').val();
    if (userQuestion.trim() === '') return; 

    const questionDiv = $('<div></div>').text(userQuestion).addClass('user-question');
    $('#chatbot').append(questionDiv);

    $('#chatbot_search').val('');

    const isWeatherQuery = processWeatherQuery(userQuestion);
    if (isWeatherQuery) {
        return;
    }

    getGeminiResponse(userQuestion).then(geminiResponse => {
        const answerDiv = $('<div></div>').text(geminiResponse).addClass('chatbot_response');
        $('#chatbot').append(answerDiv);
    });
});
    
    //when enter button pressed do the aboce actions
    $('#chatbot_search').keypress(function (e) {
        if (e.which === 13) { // Enter key pressed
            $('#search_gemini').click(); 
        }
    });


    //toggle function for filter menu 
    const filterMenu = document.getElementById('filter-menu');
    document.addEventListener('click', function (event) {
        
        const filterToggle = document.getElementById('filter-toggle');

        if (filterToggle.contains(event.target))
        {
            if (filterMenu.style.display === 'block')
            {
                filterMenu.style.display = 'none';
            } else {
                filterMenu.style.display = 'block';
            }
        } else if (!filterMenu.contains(event.target)) {
            filterMenu.style.display = 'none';
        }
    });
    

    //filter for Temperature in ascending 
    $('#Asc_temp').click(function () {
        filterMenu.style.display = 'none';
        currentRows.sort((a, b) => 
            parseFloat($(a).children("td").eq(2).text()) -
            parseFloat($(b).children("td").eq(2).text())
        );
        $("#forecastTable tbody").empty();   
        $.each(currentRows, function (index, row) {
            $("#forecastTable tbody").append(row);
        });
    });
    
    //filter for Temperature in descending
    $('#Desc_temp').click(function () {
        filterMenu.style.display = 'none';
        currentRows.sort((a, b) => 
            parseFloat($(b).children("td").eq(2).text()) -
            parseFloat($(a).children("td").eq(2).text())
        );
        $("#forecastTable tbody").empty();   
        $.each(currentRows, function (index, row) {
            $("#forecastTable tbody").append(row);
        });
    });
    
     //filter for rainy days 
    $('#Rainy_days').click(function () {
        filterMenu.style.display = 'none'; 
        var rainyRows = originalRows.filter(row => {
            const weatherDescription = $(row).children("td").eq(3).text(); 
            return weatherDescription.toLowerCase().includes('rain'); 
        });
    
        $("#forecastTable tbody").empty();   
    
        $.each(rainyRows, function (index, row) {
            $("#forecastTable tbody").append(row);
        });
    });
    
    //filter for highest temperature
    $('#High_temp').click(function () {
        filterMenu.style.display = 'none';
        let highestTempRow = currentRows.reduce((maxRow, currentMaxTempRow) => {
            const currentTemp = parseFloat($(currentMaxTempRow).children("td").eq(2).text());
            const maxTemp = parseFloat($(maxRow).children("td").eq(2).text());
            
            return currentTemp > maxTemp ? currentMaxTempRow : maxRow;
        });
    
        // Clear the table and append only the row with the highest temperature
        $("#forecastTable tbody").empty();
        $("#forecastTable tbody").append(highestTempRow);
    });
      
});