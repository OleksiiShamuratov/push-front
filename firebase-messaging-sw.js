self.addEventListener('push', function(event) {
    const trackPromise = track(event.data?event.data.json():null);
    const setIdPromise = setUserId(event.data?event.data.json():null);
    const compilePushPromise = new Promise(function (resolve) {
        getUserId().then(function(id) {
            if (event.data) {
                let payload = event.data.json();
                let title = payload.notification.title;
                let link = payload.notification.actions[0].action;
                // append userid to GET params
                if(link.indexOf('?')+1) {
                    link += "&s_id="+id
                }
                else {
                    link += "?s_id="+id
                }
                let data = {};
                // append campaign name and campaign id to GET params for tracking
                if(payload.hasOwnProperty('data')) {
                    if(payload.data.hasOwnProperty('campaign_id')) {
                        data['campaign_id'] = payload.data.campaign_id;
                    }
                    if(payload.data.hasOwnProperty('campaign_name')) {
                        data['campaign_name'] = payload.data.campaign_name;
                    }
                }
                data['link'] = link+(data.hasOwnProperty('campaign_name')?"&campaign_name="+data.campaign_name:"")+(data.hasOwnProperty('campaign_id')?"&campaign_id="+data.campaign_id:"");
                let notification = {
                    click_action: link,
                    body: payload.notification.body,
                    data: data,
                    sound: "default",
                    vibrate: [500, 200, 500, 500, 200, 500, 200, 500, 500, 200, 500],
                }
                if(payload.notification.hasOwnProperty('icon')) {
                    notification['icon'] = payload.notification.icon;
                }
                if(payload.notification.hasOwnProperty('image')) {
                    notification['image'] = payload.notification.image
                }
                if(payload.notification.hasOwnProperty('badge')) {
                    notification['badge'] = payload.notification.badge
                }
                return self.registration.showNotification(title, notification);
            }
            else {
                // Unreachable
                return self.registration.showNotification("Sorry!!!", {body:"We wanted to show something important, but lost data...", data: {campaign: {}}})
            }
        });
    });
    const promiseChain = Promise.all([
        self.registration.update(),
        trackPromise,
        setIdPromise,
        compilePushPromise
    ]);
    event.waitUntil(promiseChain);
});
self.addEventListener('notificationclick', function(e) {
    const trackPromise = track({data:e.notification.data}, 'clicked');
    const openPromise = new Promise(function (resolve) {
        clients.matchAll({ type: 'window' }).then(clientsArr => {
            const hadWindowToFocus = clientsArr.some(windowClient => windowClient.url === e.notification.data.link ? (windowClient.focus(), true) : false);
            if (!hadWindowToFocus) {
                return clients.openWindow(e.notification.data.link).then(windowClient => windowClient ? windowClient.focus() : null);
            }
        });
    })
    const promiseChain = Promise.all([
        trackPromise,
        openPromise
    ]);
    e.waitUntil(promiseChain);
    e.notification.close();
});
// Track for campaigns views and clicks (will work soon)
function track(data, event = "delivered") {
    return new Promise((async (resolve, reject) => {
        if(data) {
            let payload = data;
            if(payload.hasOwnProperty('data')) {
                if(payload.data.hasOwnProperty('campaign_id')) {
                    fetch("https://subscribe.dev.justtrackme.website/"+event, {
                        method: "PUT",
                        headers: {
                            "Content-type": "application/json; charset=UTF-8",
                        },
                        body: JSON.stringify({
                            campaign_id: parseInt(payload.data.campaign_id),
                        })
                    })
                        .then(function () {
                            resolve(null);
                        })
                        .catch(function () {
                            resolve(null);
                        })
                }
            }
        }
        resolve(null);
    }))
}
// Get userid to path throw GET params for tag postback
function getUserId() {
    return new Promise((resolve, reject) => {
        //console.log("Create db promise");
        let db = indexedDB.open("subscriber", 1);
        db.onerror = function(){
            //console.log("Error while connecting");
            resolve(null);
        };
        db.onsuccess = function(){
            //console.log("Connect successful");
            let transaction = db.result.transaction(["data"], "readonly").objectStore("data").get("data");
            transaction.onerror = function () {
                //console.log("Error while getting data");
                resolve(null);
            };
            transaction.onsuccess = function(){
                //console.log("Transaction successful");
                resolve(transaction.result ? transaction.result.id : null);
            }
        };
        db.onupgradeneeded = function(e){
            e.currentTarget.result.createObjectStore("data", { keyPath: "data" });
        }
    });
}

// Fix to get ids from older subscribers
function setUserId(data) {
    return new Promise((resolve, reject) => {
        if(data) {
            let payload = data;
            if(payload.hasOwnProperty('data')) {
                if (payload.data.hasOwnProperty('userid')) {
                    let db = indexedDB.open("subscriber", 1);
                    db.onerror = function () {
                        resolve(null);
                    };
                    db.onsuccess = function () {
                        let transaction = db.result.transaction(["data"], "readwrite").objectStore("data").put({
                            data: 'data',
                            id: payload.data.userid,
                            token: payload.data.hasOwnProperty('token')?payload.data.token:null
                        });
                        transaction.onerror = function () {
                            resolve(null);
                        };
                        transaction.onsuccess = function (err) {
                            resolve(null);
                        }
                    };
                    db.onupgradeneeded = function (e) {
                        e.currentTarget.result.createObjectStore("data", {keyPath: "data"});
                    }
                }
            }
        }
    });
}