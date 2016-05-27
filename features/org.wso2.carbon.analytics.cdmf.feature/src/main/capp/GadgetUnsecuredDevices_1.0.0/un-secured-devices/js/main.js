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

var vb = vb || {};
vb.chart = null;
vb.polling_task = null;
vb.data = [];
vb.filter_context = null;
vb.filters_meta = {};
vb.filters = [];
vb.filter_prefix = "g_";
vb.selected_filter_groups = [];
vb.force_fetch = false;
vb.freeze = false;
vb.div = "#chart";

vb.initialize = function () {
    vb.startPolling();
};

vb.startPolling = function () {
    setTimeout(function () {
        vb.fetch();
        vb.freeze = vb.selected_filter_groups.length > 0;
    }, 500);
    this.polling_task = setInterval(function () {
        vb.fetch();
    }, gadgetConfig.polling_interval);
};


vb.fetch = function () {
    vb.data.length = 0;
    vb.force_fetch = false;

    wso2.gadgets.XMLHttpRequest.get(gadgetConfig.source,
        function(response){
            if (Object.prototype.toString.call(response) === '[object Array]' && response.length === 1) {
                vb.filter_context = response[0].groupingAttribute;
                var data = response[0]["data"];
                if (data && data.length > 0) {
                    var non_complaint1 = document.getElementById('non-complaintSpan');
                    non_complaint1.innerHTML = data[0].deviceCount;
                    var non_complaint = document.getElementById('non-complaint');
                    if (data[0].deviceCount == 0) {
                        if (non_complaint.hasAttribute("onclick")){
                            non_complaint.removeAttribute("onclick");
                        }
                    } else {
                        non_complaint.setAttribute("onclick", "vb.onclick2('"+data[0].group+"')");
                    }
                    var unmonitored1 = document.getElementById('unmonitoredSpan');
                    unmonitored1.innerHTML = data[1].deviceCount;
                    var unmonitored = document.getElementById('unmonitored');
                    if (data[1].deviceCount == 0) {
                        if (unmonitored.hasAttribute("onclick")){
                            unmonitored.removeAttribute("onclick");
                        }
                    } else {
                        unmonitored.setAttribute("onclick", "vb.onclick2('"+data[1].group+"')");
                    }
                }
            } else {
                console.error("Invalid response structure found: " + JSON.stringify(response));
            }
        }, function(){
            console.warn("Error accessing source for : " + gadgetConfig.id);
        });
};

vb.onclick2 = function (filterGroup) {
    var url = getBaseURL() + "devices?g_" + vb.filter_context + "=" + filterGroup;
    window.open(url);
};

$(document).ready(function () {
    vb.initialize();
});