$(document).ready(function() {

    var savedCities = [];
    var apiKey = "69dc4c13998c8b7a4772ce179c71adcb";
    var todayDate = moment().format("MM/DD/YYYY");
    $("#date").text(todayDate);

    initialize();

    function initialize(){
        var cities = JSON.parse(localStorage.getItem("cities"));
        if(cities){
            $.each(cities,function(index,city){
                addHistory(city);
            });
        }
    }
    
    function getCurrentWeather(city) {
        // fetch request gets a list of all the repos for the node.js organization
        var requestWeather = 'https://api.openweathermap.org/data/2.5/weather?q='+city+'&units=metric&APPID='+apiKey;
        var requestForecast = 'https://api.openweathermap.org/data/2.5/forecast?q='+city+'&units=metric&APPID='+apiKey;
        

        fetch(requestWeather)
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {
                console.log("current",data)
                
                if(data.cod=== "404"){
                    return false;
                }
                
                addHistory(data.name);
                $("#cityName").text(data.name);
                $("#temperature").text(Math.round(parseInt(data.main.temp)));
                $("#humidity").text(data.main.humidity);
                $("#wind-speed").text((parseFloat(data.wind.speed)*3.6).toFixed(2));

                var iconId = data.weather[0].icon;
                
                var iconDescription = data.weather[0].description;

                // console.log(iconId,iconDescription)
                var iconUrl = "http://openweathermap.org/img/wn/"+iconId+"@2x.png";
                $("#iconWeather").empty();
                $("#iconWeather").append("<img src="+iconUrl+" alt="+iconDescription+" class='weather-icon'>");
                var lat = data.coord.lat;
                var lon = data.coord.lon;
                var requestUV = 'http://api.openweathermap.org/data/2.5/uvi?lat='+lat+'&lon='+lon+'&appid='+apiKey;
    
                return fetch(requestUV);
            })
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {
                // console.log(data)
                var uv = data.value
                $("#uv-index").text(uv);
                if(uv < 3){
                    $("#uv-index").attr("style","background-color:green");
                }
                else if(uv < 5){
                    $("#uv-index").attr("style","background-color:yellow");
                }
                else if(uv < 7){
                    $("#uv-index").attr("style","background-color:orange");
                }
                else if(uv < 10){
                    $("#uv-index").attr("style","background-color:red");
                }
                else{
                    $("#uv-index").attr("style","background-color:fuchsia");
                }

                $(".hidden").attr("style","visibility:visible");
            });

        fetch(requestForecast)
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {
                console.log(data)
                
                if(data.cod=== "404"){
                    return false;
                }
                
                $("#weekly-forecast").empty();

                var forecast = data.list;
                // console.log('weekly');
                var dayCounter = 1;
                $.each(forecast,function(index,value){
                    var hour = Math.floor(parseInt(moment().format('H'))/3)*3;
                    
                    hour = (hour >= 10)? hour: "0"+hour;
                    // console.log(hour)
                    
                    var check = moment().add(dayCounter,'days').format("YYYY-MM-DD")+" "+hour+":00:00";                    
                    // console.log(check,value.dt_txt);
                    // console.log(check===value.dt_txt);
                    if (value.dt_txt === check){
                        dayCounter++;

                        var temperature = Math.round(parseFloat(value.main.temp));
                        var humidity = value.main.humidity;
                        var day = moment().add(dayCounter,'days').format("MM/DD/YYYY");
    
                        var iconId = value.weather[0].icon;
                        var iconDescription = value.weather[0].description;
        
                        // console.log(iconId,iconDescription)
                        var iconUrl = "http://openweathermap.org/img/wn/"+iconId+"@2x.png";
                        var newItem = $("<div>");
                        newItem.addClass("col-sm-4 col-md-3 col-lg-2 weekly border rounded m-2");
                        newItem.append("<h6>"+day+"</h6>");
                        newItem.append("<img src="+iconUrl+" alt="+iconDescription+" class='weather-icon'>");
                        newItem.append("<p>Temperature: "+temperature+"\xB0C</p>");
                        newItem.append("<p>Humidity: "+humidity+"%</p>");
    
                        $("#weekly-forecast").append(newItem);
                    }
                });

            });   
            
    }
      
    function addHistory (city){
        if(savedCities.indexOf(city) === -1){
            var newCity = $("<li>");
            newCity.addClass("list-group-item");
            newCity.attr("data-city",city);
            newCity.text(city);
            $("#search-history").prepend(newCity);
            savedCities.push(city);
            exceedNum();
            console.log(savedCities);
            localStorage.setItem("cities",JSON.stringify(savedCities));
        }
        else{
            var index = savedCities.indexOf(city);
            savedCities.splice(index,1);
            savedCities.push(city);
            exceedNum();
            console.log('[data-city="'+city+'"]');
            $("#search-history").prepend($('[data-city="'+city+'"]'));
            localStorage.setItem("cities",JSON.stringify(savedCities));
            console.log(savedCities);
        }

    }

    function exceedNum(){
        if(savedCities.length > 10){
            var removedCity = savedCities.splice(0,1);
            console.log(removedCity);
            $('[data-city="'+removedCity+'"]').remove();
        }
    }

    $("button").on("click",function(event){
        event.preventDefault();

        if(!$("#city").val()){
            return false;
        }

        getCurrentWeather($("#city").val());
        $("#city").val("");
        
    });

    $("ul").click(function(event){

        if($(event.target).is("li")){
            
            console.log($(event.target).text());
            getCurrentWeather($(event.target).text());
            
        }
    });

});