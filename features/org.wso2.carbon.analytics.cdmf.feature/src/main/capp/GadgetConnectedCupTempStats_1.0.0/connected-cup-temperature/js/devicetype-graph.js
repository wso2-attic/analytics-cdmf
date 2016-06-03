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
        drawGraph(parseInt(timefrom / 1000) , parseInt(timeto / 1000));
    });
};



function drawGraph(from, to) {
    retrieveDataAndDrawLineGraph("temperature", from, to);

}

function retrieveDataAndDrawLineGraph(sensorType, from, to) {
    var deviceid = $("#details").data("deviceid");
    var backendApiUrl = $("#device-chart").data("backend-api-url") + deviceid + "/sensors/" + sensorType + "?from=" + from + "&to=" + to;


    wso2.gadgets.HttpRequest.get(backendApiUrl,
        function(data){
            drawLineGraph(data, sensorType);
        },

        function(error){
            $("#chart-temperature").html("<br/>No data available...");
        }
    );


}

function drawLineGraph(data, type) {

    var chartWrapperElmId = "#device-chart";
    var graphWidth = $(chartWrapperElmId).width() - 50;
    if (data.length == 0 || data.length == undefined) {
        $("#chart-" + type).html("<br/>No data available...");
        return;
    }
    $("#chart-" + type).empty();

    var graphConfig = {
        element: document.getElementById("chart-" + type),
        width: graphWidth,
        height: 290,
        strokeWidth: 2,
        renderer: 'line',
        interpolation: "linear",
        unstack: true,
        stack: false,
        xScale: d3.time.scale(),
        padding: {top: 0.2, left: 0.02, right: 0.02, bottom: 0.2},
        series: []
    };

    var tzOffset = new Date().getTimezoneOffset() * 60;

    var chartData = [];

    for (var i = 0; i < data.length; i++) {
        var y_val = parseInt(getData(data[i], type));
        chartData.push(
            {
                x: parseInt(data[i].values.time) - tzOffset,
                y: y_val
            }
        );
    }
    graphConfig['series'].push(
        {
            'color': palette.color(),
            'data': chartData,
            'name': type,
            'scale': d3.scale.linear().domain([0,100]).nice()
        }
    );

    var graph = new Rickshaw.Graph(graphConfig);

    graph.render();

    var xAxis = new Rickshaw.Graph.Axis.Time({
        graph: graph
    });

    xAxis.render();

    var yAxis = new Rickshaw.Graph.Axis.Y.Scaled({
        graph: graph,
        orientation: 'left',
        element: document.getElementById("y_axis-" + type),
        width: 40,
        height: 410,
        'scale': d3.scale.linear().domain([Math.min(min, range_min), Math.max(max, range_max)]).nice()
    });

    yAxis.render();

    var slider = new Rickshaw.Graph.RangeSlider.Preview({
        graph: graph,
        element: document.getElementById("slider-" + type)
    });

    var legend = new Rickshaw.Graph.Legend({
        graph: graph,
        element: document.getElementById('legend-' + type)
    });

    var hoverDetail = new Rickshaw.Graph.HoverDetail({
        graph: graph,
        formatter: function (series, x, y) {
            var date = '<span class="date">' +
                moment((x + tzOffset) * 1000).format('Do MMM YYYY h:mm:ss a') + '</span>';
            var swatch = '<span class="detail_swatch" style="background-color: ' +
                series.color + '"></span>';
            return swatch + series.name + ": " + parseInt(y) + '<br>' + date;
        }
    });

    var shelving = new Rickshaw.Graph.Behavior.Series.Toggle({
        graph: graph,
        legend: legend
    });

    var order = new Rickshaw.Graph.Behavior.Series.Order({
        graph: graph,
        legend: legend
    });

    var highlighter = new Rickshaw.Graph.Behavior.Series.Highlight({
        graph: graph,
        legend: legend
    });
}

function getData(data, type) {
    var columnData
    switch (type) {
        case "temperature" :
            columnData = data.values.temperature
            break;
        case "coffeelevel" :
            columnData = data.values.coffeelevel
            break;
    }

    return columnData;
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

    $('#details').attr('data-devicename', urlQueryParams[1]);
    $('#details').attr('data-deviceid', urlQueryParams[0]);
}