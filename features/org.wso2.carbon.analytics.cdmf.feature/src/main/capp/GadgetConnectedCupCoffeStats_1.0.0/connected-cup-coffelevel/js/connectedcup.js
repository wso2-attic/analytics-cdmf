/*
 * Copyright (c) 2016, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

var palette = new Rickshaw.Color.Palette({scheme: "classic9"});

function drawGraph_connectedcup(from, to) {

    console.log('from'+from+'to'+to);

    $("#y_axis-coffeelevel").html("");
    $("#smoother-coffeelevel").html("");
    $("#legend-coffeelevel").html("");
    $("#chart-coffeelevel").html("");
    $("#x_axis-coffeelevel").html("");
    $("#slider-coffeelevel").html("");

    var devices = $("#connectedcup-details").data("devices");

    console.log(devices);
    var tzOffset = new Date().getTimezoneOffset() * 60;

    var chartWrapperElmId = "#connectedcup-div-chart";
    var graphWidth = $(chartWrapperElmId).width() - 50;

    var coffeelevelGraphConfig = {
        element: document.getElementById("chart-coffeelevel"),
        width: graphWidth,
        height: 400,
        strokeWidth: 2,
        renderer: 'line',
        interpolation: "linear",
        unstack: true,
        stack: false,
        xScale: d3.time.scale(),
        padding: {top: 0.2, left: 0.02, right: 0.02, bottom: 0.2},
        series: []
    };

    if (devices) {
        for (var i = 0; i < devices.length; i++) {

            coffeelevelGraphConfig['series'].push(
                {
                    'color': palette.color(),
                    'data': [{
                        x: parseInt(new Date().getTime() / 1000),
                        y: 0
                    }],
                    'name': devices[i].name
                });
        }
    } else {
        coffeelevelGraphConfig['series'].push(
            {
                'color': palette.color(),
                'data': [{
                    x: parseInt(new Date().getTime() / 1000),
                    y: 0
                }],
                'name':$("#connectedcup-details").data("devicename")
            });
    }

    var coffeelevelGraph = new Rickshaw.Graph(coffeelevelGraphConfig);


    coffeelevelGraph.render();


    var xAxisCoffeelevel = new Rickshaw.Graph.Axis.Time({
        graph: coffeelevelGraph
    });

    xAxisCoffeelevel.render();

    var yAxisCoffeelevel = new Rickshaw.Graph.Axis.Y({
        graph: coffeelevelGraph,
        orientation: 'left',
        element: document.getElementById("y_axis-coffeelevel"),
        width: 40,
        height: 410
    });

    yAxisCoffeelevel.render();

    var sliderCoffee = new Rickshaw.Graph.RangeSlider.Preview({
        graph: coffeelevelGraph,
        element: document.getElementById("slider-coffeelevel")
    });

    var legendCoffee = new Rickshaw.Graph.Legend({
        graph: coffeelevelGraph,
        element: document.getElementById('legend-coffeelevel')
    });

    var hoverDetailCoffeelevel = new Rickshaw.Graph.HoverDetail({
        graph: coffeelevelGraph,
        formatter: function (series, x, y) {
            var date = '<span class="date">' +
                moment((x + tzOffset) * 1000).format('Do MMM YYYY h:mm:ss a') + '</span>';
            var swatch = '<span class="detail_swatch" style="background-color: ' +
                series.color + '"></span>';
            return swatch + series.name + ": " + parseInt(y) + '<br>' + date;
        }
    });

    var shelvingCoffee = new Rickshaw.Graph.Behavior.Series.Toggle({
        graph: coffeelevelGraph,
        legend: legendCoffee
    });


    var highlighterCoffee = new Rickshaw.Graph.Behavior.Series.Highlight({
        graph: coffeelevelGraph,
        legend: legendCoffee
    });


    var deviceIndex = 0;



        var deviceid = $("#connectedcup-details").data("deviceid");
        var coffeeLevelApiUrl = $("#connectedcup-div-chart").data("backend-api-url") + deviceid + "/sensors/coffeelevel"
            + "?from=" + from + "&to=" + to;

        wso2.gadgets.HttpRequest.get(coffeeLevelApiUrl,
            function(data){
               drawCoffeeLevelLineGraph(data);
            },

            function(error){
                $("#y_axis-coffeelevel").html("");
                $("#smoother-coffeelevel").html("");
                $("#legend-coffeelevel").html("");
                $("#chart-coffeelevel").html("");
                $("#x_axis-coffeelevel").html("");
                $("#slider-coffeelevel").html("");
                $("#chart-coffeelevel").html("<br/><h3>No data available..</h3>.");
            }
        );

    function drawCoffeeLevelLineGraph(data) {
        if (data.length === 0 || data.length === undefined) {
            return;
        }

        var chartData = [];
        for (var i = 0; i < data.length; i++) {
            chartData.push(
                {
                    x: parseInt(data[i].values.time) - tzOffset,
                    y: parseInt(data[i].values.coffeelevel)
                }
            );
        }

        coffeelevelGraphConfig.series[deviceIndex].data = chartData;
        coffeelevelGraph.update();
    }
}


// fetch all queryParams from the URL.
urlQueryParams = getAllQueryParamsFromURL();

/**
 * Reads the page's URL Query-Params and returns them as an associative array.
 * @returns {*} an associative array containing the URL QueryParams and corresponding values.
 *                If no such Query-Params exists then returns null.
 */
function getAllQueryParamsFromURL() {
    var queryParamList = [], qParam;
    var urlQueryString = decodeURIComponent(window.top.location.search.substring(1));
    if (urlQueryString) {
        var queryStringPairs = urlQueryString.split('&');
        for (var i = 0; i < queryStringPairs.length; i++) {
            qParam = queryStringPairs[i].split('=');
            queryParamList[i] = qParam[1];

        }
        return queryParamList;

    } else {
        return null;
    }
}


/**
 * Change the back-end api based on query parameters
 */

if (urlQueryParams != null) {

    $('#connectedcup-details').attr('data-devicename', urlQueryParams[1]);
    $('#connectedcup-details').attr('data-deviceid', urlQueryParams[0]);
}


/**
 * Intergadget communication with Date range gadget
 */

gadgets.HubSettings.onConnect = function() {
    gadgets.Hub.subscribe('range-selected', function(topic, data, subscriberData) {

        var timefrom = data.timeFrom,
            timeto = data.timeTo;

        var tzOffset = new Date().getTimezoneOffset() * 60 / 1000;
        timefrom += tzOffset;
        timeto += tzOffset;
        drawGraph_connectedcup(parseInt(timefrom / 1000) , parseInt(timeto / 1000));
    });
};