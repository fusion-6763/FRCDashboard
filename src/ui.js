// Define UI elements
let ui = {
    timer: document.getElementById('timer'),
    robotState: document.getElementById('robot-state').firstChild,
    hatch: document.getElementById("hatch"),
    clock: document.getElementById("clock"),
    alliance: {
        block: document.getElementById("alliance"),
        text: document.getElementById("alliance-text"),
        station: document.getElementById("station")
    },
    hatch: document.getElementById("hatch"),
    match: document.getElementById("match"),
    tabBar: new mdc.tabBar.MDCTabBar(document.getElementById('camera-tab-bar')),
    autoSelector: new mdc.select.MDCSelect(document.querySelector('.mdc-select')),
    makeySwitch: new mdc.switchControl.MDCSwitch(document.querySelector('.mdc-switch'))
};

ui.autoSelector.listen("MDCSelect:change", function (e) {
    NetworkTables.putValue('/frcdashboard/auto', e.detail.index)
})

// Key Listeners

NetworkTables.addKeyListener('/FMSInfo/IsRedAlliance', (key, value) => {
    ui.alliance.block.style.border = value ? "7px solid red" : "7px solid rgb(0, 150, 255)";
    console.log(value);
});

NetworkTables.addKeyListener('/FMSInfo/StationNumber', (key, value) => {
    ui.alliance.station.innerText = value;
    console.log(value);
});

NetworkTables.addKeyListener('/FMSInfo/MatchNumber', (key, value) => {
    ui.match.innerText = value;
    console.log(value);
});

NetworkTables.addKeyListener('/CameraPublisher', (key, value) => {
    console.log("hi " + value)
})

NetworkTables.addKeyListener('/robot/time', (key, value) => {
    // This is an example of how a dashboard could display the remaining time in a match.
    // We assume here that value is an integer representing the number of seconds left.
    ui.timer.textContent = value < 0 ? '0:00' : Math.floor(value / 60) + ':' + (value % 60 < 10 ? '0' : '') + value % 60;
});

NetworkTables.addKeyListener('/SmartDashboard/hatchOut', (key, value) => {
    ui.hatch.src = (value ? 'img/hatch-out.svg' : 'img/hatch-in.svg');
    if (value) {
        ui.hatch.classList.add("out");
    }
    else {
        ui.hatch.classList.remove("out");
    }
})

addEventListener('error', (ev) => {
    ipc.send('windowError', { mesg: ev.message, file: ev.filename, lineNumber: ev.lineno })
})

setInterval(function () {
    var date = new Date();
    var hours = date.getHours() <= 12 ? date.getHours() : (date.getHours() - 12);
    var hours = hours.toString().length > 1 ? (hours.toString()) : ("0" + hours.toString());

    var minutes = date.getMinutes();
    var minutes = minutes.toString().length > 1 ? (minutes.toString()) : ("0" + minutes.toString());

    var seconds = date.getSeconds();
    var seconds = seconds.toString().length > 1 ? (seconds.toString()) : ("0" + seconds.toString());

    ui.clock.innerText = hours + ":" + minutes;
    console.log("moo")
}, 1000);

NetworkTables.addRobotConnectionListener(con => {
    if (con) {

    }
})

function getCameras() {
    var s = NetworkTables.getKeys().filter(item => {
        return item.includes("CameraPublisher")
    })

    var n = s.map(item => {
        return /^\/CameraPublisher\/([^\/]+)/.exec(item)[1]
    })

    return arrayRemoveDuplicates(n).map(item => {
        return {
            name: item,
            streams: NetworkTables.getValue(`/CameraPublisher/${item}/streams`).map(item => item.replace(/^mjpg:/, ""))
        }
    })
}

function arrayRemoveDuplicates(array) {
    var retVal = []

    array.forEach(item => {
        if (!retVal.includes(item)) { retVal.push(item) }
    })

    return retVal
}

var leftPressed = false
var upPressed = false
var rightPressed = false
var downPressed = false

document.body.addEventListener("keydown", (e) => {
    switch (e.keyCode) {
        case 37:
            leftPressed = true
            break
        case 38:
            upPressed = true
            break
        case 39:
            rightPressed = true
            break
        case 40:
            downPressed = true
            break
    }

    updateMakey()
})

document.body.addEventListener("keyup", (e) => {
    switch (e.keyCode) {
        case 37:
            leftPressed = false
            break
        case 38:
            upPressed = false
            break
        case 39:
            rightPressed = false
            break
        case 40:
            downPressed = false
            break
    }

    updateMakey()
})

function updateMakey() {
    if (ui.makeySwitch.checked) {
        NetworkTables.putValue('/frcdashboard/makey/leftPressed', leftPressed)
        NetworkTables.putValue('/frcdashboard/makey/upPressed', upPressed)
        NetworkTables.putValue('/frcdashboard/makey/rightPressed', rightPressed)
        NetworkTables.putValue('/frcdashboard/makey/downPressed', downPressed)
    }
}