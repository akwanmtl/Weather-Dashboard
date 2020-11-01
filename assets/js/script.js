$(document).ready(function() {

    var apiKey = "69dc4c13998c8b7a4772ce179c71adcb";
    var todayDate = moment().format("MM/DD/YYYY");
    $("#date").text(todayDate);
    
    function getCurrentWeather(city) {
        // fetch request gets a list of all the repos for the node.js organization
        var requestWeather = 'https://api.openweathermap.org/data/2.5/weather?q='+city+'&units=metric&APPID='+apiKey;
        fetch(requestWeather)
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {
                console.log(data)
                
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

                console.log(iconId,iconDescription)
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
                console.log(data)
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
            })
        
    }
      
    function addHistory (city){
        var newCity = $("<li>");
        newCity.addClass("list-group-item");
        newCity.attr("data-city",city);
        newCity.text(city);
        $("#search-history").prepend(newCity);
        
        console.log(city);
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