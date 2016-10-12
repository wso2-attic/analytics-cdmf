/*
 * Copyright (c)  2016, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

var ov = ov || {};
ov.chart = null;
ov.polling_task = null;
ov.data = [];
ov.filter_context = null;
ov.filters_meta = {};
ov.filters = [];
ov.filter_prefix = "g_";
ov.selected_filter_groups = [];
ov.force_fetch = false;
ov.freeze = false;

ov.initialize = function () {
    ov.startPolling();
};


ov.startPolling = function () {
    setTimeout(function () {
        ov.fetch();
    }, 500);
    //noinspection JSUnusedGlobalSymbols
    this.polling_task = setInterval(function () {
        ov.fetch();
    }, gadgetConfig.polling_interval);
};

ov.fetch = function () {
    ov.data.length = 0;

    //noinspection JSUnresolvedVariable
    wso2.gadgets.XMLHttpRequest.get(
        gadgetConfig.source,
        function (response) {
            console.log(JSON.stringify(response));
            if (Object.prototype.toString.call(response) === '[object Array]' && response.length === 2) {
                var totalDeviceCountData = response[0]["data"];

                if (totalDeviceCountData && totalDeviceCountData.length > 0) {
                    //noinspection JSUnresolvedVariable
                    var totalDeviceCount = totalDeviceCountData[0].deviceCount;
                    if (totalDeviceCount > 0) {
                        $("#TOTAL").css("cursor", "pointer");
                        document.getElementById('deviceCount').innerHTML = totalDeviceCount.toString();
                        document.getElementById('TOTAL').setAttribute("onclick", "ov.onclick('total')");
                        var data = response[1]["data"];
                        if (data && data.length > 0) {
                            ov.filter_context = response[1]["groupingAttribute"];
                            for (var i = 0; i < data.length; i++) {
                                if (data[i].group == "ACTIVE") {
                                    //noinspection JSUnresolvedVariable
                                    var activeDeviceCount = data[i].deviceCount;
                                    document.getElementById('activeDevices').innerHTML = activeDeviceCount.toString();
                                    if (activeDeviceCount > 0) {
                                        $("#ACTIVE").css("cursor", "pointer");
                                        document.getElementById(data[i].group).
                                            setAttribute("onclick", "ov.onclick('" + data[i].group + "')");
                                    } else {
                                        $("#ACTIVE").css("cursor", "default");
                                    }
                                    //updating count as a percentage
                                    document.getElementById('activeDevicesProgress').style.width =
                                        (activeDeviceCount * 100 / totalDeviceCount) + '%';
                                } else if (data[i].group == "UNREACHABLE") {
                                    //noinspection JSUnresolvedVariable
                                    var unreachableDeviceCount = data[i].deviceCount;
                                    document.getElementById('unreachableDevices').innerHTML = unreachableDeviceCount.toString();
                                    if (unreachableDeviceCount > 0) {
                                        $("#UNREACHABLE").css("cursor", "pointer");
                                        document.getElementById(data[i].group).
                                            setAttribute("onclick", "ov.onclick('" + data[i].group + "')");
                                    } else {
                                        $("#UNREACHABLE").css("cursor", "default");
                                    }
                                    //updating count as a percentage
                                    document.getElementById('unreachableDevicesProgress').style.width =
                                        (unreachableDeviceCount * 100 / totalDeviceCount) + '%';
                                } else if (data[i].group == "INACTIVE") {
                                    //noinspection JSUnresolvedVariable
                                    var inactiveDeviceCount = data[i].deviceCount;
                                    document.getElementById('inactiveDevices').innerHTML = inactiveDeviceCount.toString();
                                    if (inactiveDeviceCount > 0) {
                                        $("#INACTIVE").css("cursor", "pointer");
                                        document.getElementById(data[i].group).
                                            setAttribute("onclick", "ov.onclick('" + data[i].group + "')");
                                    } else {
                                        $("#INACTIVE").css("cursor", "default");
                                    }
                                    //updating count as a percentage
                                    document.getElementById('inactiveDevicesProgress').style.width =
                                        (inactiveDeviceCount * 100 / totalDeviceCount) + '%';
                                } else if (data[i].group == "REMOVED") {
                                    //noinspection JSUnresolvedVariable
                                    var removedDeviceCount = data[i].deviceCount;
                                    document.getElementById('removedDevices').innerHTML = removedDeviceCount.toString();
                                    if (removedDeviceCount > 0) {
                                        $("#REMOVED").css("cursor", "pointer");
                                        document.getElementById(data[i].group).
                                            setAttribute("onclick", "ov.onclick('" + data[i].group + "')");
                                    } else {
                                        $("#REMOVED").css("cursor", "default");
                                    }
                                    //updating count as a percentage
                                    document.getElementById('removedDevicesProgress').style.width =
                                        (removedDeviceCount * 100 / totalDeviceCount) + '%';
                                }
                            }
                        }
                    } else {
                        $("#TOTAL").css("cursor", "default");
                        $("#ACTIVE").css("cursor", "default");
                        $("#UNREACHABLE").css("cursor", "default");
                        $("#INACTIVE").css("cursor", "default");
                        $("#REMOVED").css("cursor", "default");
                    }
                }
            } else {
                console.error("Invalid response structure found: " + JSON.stringify(response));
            }
        }, function () {
            console.warn("Error accessing source for : " + gadgetConfig.id);
        });
};

ov.onclick = function (filterGroup) {
    var url;
    if(filterGroup != ""){
        url = getBaseURL() + "devices?g_" + ov.filter_context + "=" + filterGroup;
    } else {
        url = getBaseURL() + "devices";
    }
    window.open(url);
};

$(document).ready(function () {
    ov.initialize();
});