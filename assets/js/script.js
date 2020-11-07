$(document).ready(function() {
    
    // declare variables
    var savedCities = [];
    
    initialize();

    // initalizes the list of cities in search histories from local storage
    function initialize(){
        var cities = JSON.parse(localStorage.getItem("cities"));
        if(cities){
            $.each(cities,function(index,city){
                addHistory(city);
            });
        }
        setTimeout(function(){
            // $('#body').attr("style","visibility:visible");
            $('#body').css("visibility","visible");
        },0);
        // $('#body').attr("style","visibility:visible");
    }
    

    // function that calls 2 apis to get the current weather and 5 day forecast
    function getCurrentWeather(city) {
        
        // urls to request data
        var apiKey = "69dc4c13998c8b7a4772ce179c71adcb";
        var requestWeather = 'https://api.openweathermap.org/data/2.5/weather?q='+city+'&units=metric&APPID='+apiKey;
        var requestForecast = 'https://api.openweathermap.org/data/2.5/forecast?q='+city+'&units=metric&APPID='+apiKey;
        
        // fetch request for current weather
        fetch(requestWeather)
            .then(function (response) {
                // if the city cannot be found, throw an error to stop the promise
                if(response.status === 404){
                    $(".feedback").css("visibility","visible");
                    throw new Error("Invalid city name");
                }
                // else return the response that has been parsed
                else{
                    return response.json();
                }
            })
            .then(function (data) {
                console.log("current",data)
                
                //empty the input text field
                $("#city").val("");

                //add the name of the city and country to the list using the function addHistory
                addHistory(data.name+", "+data.sys.country);

                //add the appropriate values for the current weather section
                $("#cityName").text(data.name);
                $("#temperature").text(Math.round(parseInt(data.main.temp)));
                $("#humidity").text(data.main.humidity);
                $("#wind-speed").text((parseFloat(data.wind.speed)*3.6).toFixed(2));
                $("#date").text(moment.unix(data.dt+data.timezone).utc().format("MM/DD/YYYY"));

                //get the corresponding weather icon from the openwewathermap 
                var iconId = data.weather[0].icon;
                var iconDescription = data.weather[0].description;
                var iconUrl = "http://openweathermap.org/img/wn/"+iconId+"@2x.png";
                $("#iconWeather").empty();
                $("#iconWeather").append("<img src="+iconUrl+" alt="+iconDescription+" class='weather-icon-current'>");

                //get the latitude and longitude value that are needed to request the url for uv index
                var lat = data.coord.lat;
                var lon = data.coord.lon;
                var requestUV = 'http://api.openweathermap.org/data/2.5/uvi?lat='+lat+'&lon='+lon+'&appid='+apiKey;
    
                //request uv index
                return fetch(requestUV);
            })
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {

                console.log('uv',data)
                var uv = data.value;

                $("#uv-index").text(uv);
                if(uv < 3){
                    $("#uv-index").css("background-color","green");
                }
                else if(uv < 5){
                    $("#uv-index").css("background-color","yellow");
                }
                else if(uv < 7){
                    $("#uv-index").css("background-color","orange");
                }
                else if(uv < 10){
                    $("#uv-index").css("background-color","red");
                }
                else{
                    $("#uv-index").css("background-color","fuchsia");
                }
            })
            // catch any unexpected error
            .catch(function(err){
                console.log(err);
            });

        //fetch request for 5 day forecast/3 hour data
        fetch(requestForecast)
            .then(function (response) {
                // if the city cannot be found, throw an error to stop the promise
                if(response.status === 404){
                    console.log('not a city');
                    throw new Error("Invalid city name");
                }
                // else return the response that has been parsed
                else{
                    return response.json();
                }
            })
            .then(function (data) {
                console.log(data);
                
                //remove any previous 5 day forecast
                $("#weekly-forecast").empty();

                var forecast = data.list;
                // var startDate = moment.unix(data.city.sunrise+data.city.timezone).utc().format("YYYY-MM-DD");
                var startDate = moment.unix(forecast[0].dt+data.city.timezone).utc().format("YYYY-MM-DD")
                console.log(startDate);
                
                var groupedForecast = {};
                for(var i = 0; i < 6; i++){
                    groupedForecast[moment(startDate,"YYYY-MM-DD").add(i,'days').format("YYYY-MM-DD")] = [];
                }
                console.log('hello',groupedForecast);

                $.each(forecast,function(index,value){
                    var temperature = value.main.temp;//Math.round(parseFloat(value.main.temp));
                    var humidity = value.main.humidity;
                    var iconId = value.weather[0].icon;
                    var iconDescription = value.weather[0].description;
                    var day = moment.unix(value.dt+data.city.timezone).utc().format("YYYY-MM-DD");
                    var time = moment.unix(value.dt+data.city.timezone).utc().format("HH:MM:SS");
                    console.log(day + " " + time)
                    groupedForecast[day].push({
                        temperature: temperature,
                        humidity : humidity,
                        iconId: iconId,
                        iconDescription : iconDescription,
                        time: time
                    });
                });

                console.log(groupedForecast);


                if(parseInt(moment.unix(forecast[0].dt+data.city.timezone).utc().format("HH")) > 14){
                    startDate = moment(startDate,"YYYY-MM-DD").add(1,'days').format("YYYY-MM-DD");
                }

                for(var i = 0; i < 5; i++){
                    var date = moment(startDate,"YYYY-MM-DD").add(i,'days').format("YYYY-MM-DD");
                    var dayForecast = groupedForecast[date];
                    
                    dayForecast.sort(function(a,b){
                        return b.temperature - a.temperature;
                    });

                    var iconUrl = "http://openweathermap.org/img/wn/"+dayForecast[0].iconId+"@2x.png";
                    var newItem = $("<div>");
                    newItem.addClass("col-5 col-sm-5 col-md-3 col-lg-2 weekly border rounded-lg m-2");
                    newItem.append("<h6>"+moment(date,"YYYY-MM-DD").format("MM/DD/YYYY")+"</h6>");
                    newItem.append("<img src="+iconUrl+" alt="+dayForecast[0].iconDescription+" class='weather-icon-weekly'>");
                    newItem.append("<p>Temperature: "+Math.round(parseFloat(dayForecast[0].temperature))+"\xB0C</p>");
                    newItem.append("<p>Humidity: "+dayForecast[0].humidity+"%</p>");

                    $("#weekly-forecast").append(newItem);

                }
                /*
                var forecast = data.list;
                var dayCounter = 1;

                $.each(forecast,function(index,value){

                    console.log(moment.unix(value.dt+data.city.timezone).utc().format("YYYY-MM-DD HH:MM:SS"))
                                        
                    var check = moment().add(dayCounter,'days').format("YYYY-MM-DD")+" 12:00:00";                    
                    
                    if (value.dt_txt === check){

                        var temperature = Math.round(parseFloat(value.main.temp));
                        var humidity = value.main.humidity;
                        var day = moment().add(dayCounter,'days').format("MM/DD/YYYY");
    
                        var iconId = value.weather[0].icon;
                        var iconDescription = value.weather[0].description;
        
                        // console.log(iconId,iconDescription)
                        var iconUrl = "http://openweathermap.org/img/wn/"+iconId+"@2x.png";
                        var newItem = $("<div>");
                        newItem.addClass("col-5 col-sm-5 col-md-3 col-lg-2 weekly border rounded-lg m-2");
                        newItem.append("<h6>"+day+"</h6>");
                        newItem.append("<img src="+iconUrl+" alt="+iconDescription+" class='weather-icon-weekly'>");
                        newItem.append("<p>Temperature: "+temperature+"\xB0C</p>");
                        newItem.append("<p>Humidity: "+humidity+"%</p>");
    
                        $("#weekly-forecast").append(newItem);

                        
                        dayCounter++;
                    }
                });
                 */

            })
            //throw any unexpected error
            // .catch(function(err){
            //     console.log(err);
            // });   
            
    }
      
    // function that adds the city name to the top list of search history
    // if the city already exists, move the item to the top
    // there is a max of 10 cities in the search history
    function addHistory (city){
        //if city does not exist in the list
        if(savedCities.indexOf(city) === -1){
            //create a new list item
            var newCity = $("<li>");
            newCity.addClass("list-group-item");
            newCity.attr("data-city",city);
            newCity.text(city);
            //add it to the beginning of the list
            $("#search-history").prepend(newCity);
            //add it to the array of city
            savedCities.push(city);
            //checks if there are are more then 10 using the function exceedNum
            if(savedCities.length > 10){
                var removedCity = savedCities.splice(0,1);
                console.log(removedCity);
                $('[data-city="'+removedCity+'"]').remove();
            }
            //save the array local storage with the key cities
            localStorage.setItem("cities",JSON.stringify(savedCities));
        }

        // if city exists in teh list
        else{
            // move the city at the end of the array
            var index = savedCities.indexOf(city);
            savedCities.splice(index,1);
            savedCities.push(city);
            // move the list item to the top of the list
            $("#search-history").prepend($('[data-city="'+city+'"]'));
            // save the array in local storage with the key cities
            localStorage.setItem("cities",JSON.stringify(savedCities));
        }
    }


    // listens for when the user searches for a city
    $("button").on("click",function(event){
        event.preventDefault();

        // returns false if nothing was entered
        if(!$("#city").val()){
            return false;
        }

        //calls the function that will request the api
        getCurrentWeather($("#city").val());
        
    });

    // listens for when the user clicks on the input field to remove the feedback if any
    $("#city").on("click",function(event){
        $(".feedback").css("visibility","hidden");        
    });
        
    // listens when the list is clicked
    $("ul").click(function(event){

        // if the list item is clicked, call the fuction that will request the api
        if($(event.target).is("li")){
            
            $(".feedback").css("visibility","hidden");
            getCurrentWeather($(event.target).text());
            
        }
    });

});