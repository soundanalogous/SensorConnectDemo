(function() {

    var accelWatchID = null;
    var compassWatchID = null;
    var geoWatchID = null;
    var ipAddrInput;
    var ipAddress;
    var RAD_TO_DEG = 180 / Math.PI;

	var commands = document.querySelector('#commands');
	var btn = document.querySelector('#btn');
	var defaultBtn = document.querySelector('#defaultBtn');
	var accelBtn = document.querySelector('#accel');
	var compassBtn = document.querySelector('#compass');
	var gpsBtn = document.querySelector('#gps');
	var socketConnection;
	var accelState = true;
	var compassState = true;
	var gpsState = true;


	document.addEventListener("touchmove", preventBehavior, false);
	document.addEventListener("deviceready", onDeviceReady, false);

	btn.addEventListener("click", function(evt) {
		var msg = "Hello from iOS!";

		commands.innerHTML = "";
		socketConnection.send(JSON.stringify({"command": {"message": msg}}));
	});

	accelBtn.addEventListener("click", function(evt) {
		accelState = !accelState;
		watchAccelerometer(accelState);
	});

	compassBtn.addEventListener("click", function(evt) {
		compassState = !compassState;
		watchCompass(compassState);
	});	

	gpsBtn.addEventListener("click", function(evt) {
		gpsState = !gpsState;
		watchGeo(gpsState);
	});			

	defaultBtn.addEventListener("click", function(evt) {
		// option to use a default IP address so you don't have
		// to keep updating it. Use the IP address of the
		// computer the IOBoard is attached to.		
		//ipAddress = "192.168.2.3";

		// iOS users can alternatively use their computer's hostname
		// open terminal and type "hostname" to get you computer's hostname		
		ipAddress = "soundanalogous.local";

		closeStartScreen();
		setTimeout(startup, 1);
	});	

    /**
     * Prevent dragging
     */
	function preventBehavior(evt) { 
      evt.preventDefault(); 
    }

	function onDeviceReady() {
		ipAddrInput = document.getElementById('ipAddr');
		ipAddrInput.addEventListener('change', ipAddrEntered);
	}

	function ipAddrEntered(evt) {
		closeStartScreen();

		// store the IP address
		ipAddress = this.value;

		// for some reason you can't create a new websocket in
		// response to a form element submission, however
		// setting a timeout to call the method that ultimately
		// creates the websocket does work
		setTimeout(startup, 1);
	}

	function closeStartScreen() {
		ipAddrInput.removeEventListener('change', ipAddrEntered);
		var startScreen = document.querySelector('#startScreen');
		startScreen.style.display = 'none';		
	}	

	function startup() {

		var socket = new WebSocket("ws://" + ipAddress + ":8080");

		socket.onopen = function () {
			socketConnection = socket;

			socket.onmessage = function (msg) {
				var data = JSON.parse(msg.data);
				if (data['command']) {
					parseCommands(data.command);
				}
			};

			socket.onclose = function() {

			};
		};

		watchAccelerometer(false);
		watchCompass(false);
		watchGeo(false);		

	}

	/**
	 * Parse incomming commands from the server.
	 * @param {Object} command The data from the server
	 */
	function parseCommands(command) {
		// console.log(command);

		if (command["notify"]) {
			var notification = command.notify;
			if (notification === "beep") {
				beep();
			} else if (notification === "vibrate") {
				vibrate();
			}
		} else if (command["accelerometer"]) {
			// start or stop the accelerometer (true or false)
			watchAccelerometer(command.accelerometer);
		} else if (command["compass"]) {
			// start or stop the compass (true or false)
			watchCompass(command.compass);
		} else if (command["geo"]) {
			// start or stop GPS (true or false)
			watchGeo(command.geo);
		} else {
			// any other command is displyed on screen
			commands.innerHTML = command;
		}
	}

	function watchAccelerometer(state) {
		// update every 100ms
		var accelOptions = { frequency: 100 };
		accelState = state;

		if (state === true) {
			// start watch
			accelWatchID = navigator.accelerometer.watchAcceleration(onAccelSuccess, onAccelError, accelOptions);
			accelBtn.innerHTML = "Stop Accelerometer";
		} else {
			// clear watch
			if (accelWatchID) {
				navigator.accelerometer.clearWatch(accelWatchID);
				accelWatchID = null;
				accelBtn.innerHTML = "Start Accelerometer";
			}
		}
	}

	function watchCompass(state) {
		// update every 100ms, send only if change of 1 degree
		// filter is only supported for iOS
		var compassOptions = { frequency: 100, filter: 1 };
		compassState = state;

		if (state === true) {
			// start watch
			compassWatchID = navigator.compass.watchHeading(onCompassSuccess, onCompassError, compassOptions)
			compassBtn.innerHTML = "Stop Compass";
		} else {
			// clear watch
			if (compassWatchID) {
				navigator.compass.clearWatch(compassWatchID);
				compassWatchID = null;
				compassBtn.innerHTML = "Start Compass";
			}
		}
	}

	/**
	 * Location-based services must be enabled
	 */
	function watchGeo(state) {
		var geoOptions = { maximumAge: 3000, timeout: 5000, enableHighAccuracy: true };
		geoState = state;

		if (state === true) {
			// start watch
			geoWatchID = navigator.geolocation.watchPosition(onGeoSuccess, onGeoError, geoOptions);
			gpsBtn.innerHTML = "Stop GPS";
		} else {
			// clear watch
			if (geoWatchID) {
				navigator.geolocation.clearWatch(geoWatchID);
				geoWatchID = null;
				gpsBtn.innerHTML = "Start GPS";
			}
		}
	}	
	
	/**
	 * Get pitch in degrees
	 */
	function getPitch(accel) {
		return Math.atan2(accel.x, Math.sqrt(accel.y * accel.y + accel.z * accel.z)) * RAD_TO_DEG;
	}

	/**
	 * Get roll in degrees
	 */
	function getRoll(accel) {
		return Math.atan2(accel.y, Math.sqrt(accel.x * accel.x + accel.z * accel.z)) * RAD_TO_DEG;
	}

	function onAccelSuccess(acceleration) {	
		var accelData = {
			'x': acceleration.x.toFixed(4),
			'y': acceleration.y.toFixed(4),
			'z': acceleration.z.toFixed(4),
			'pitch': getPitch(acceleration).toFixed(2),
			'roll': getRoll(acceleration).toFixed(2)
		};

		socketConnection.send(JSON.stringify({'accelerometer': accelData}));			
	}

	function onAccelError() {
		alert('accelerometer error');
	}		

	function onCompassSuccess(heading) {
		var compassData = {'heading': heading.magneticHeading.toFixed(2)};

		socketConnection.send(JSON.stringify({'compass': compassData}));
	}

	function onCompassError() {
		alert('compass error');
	}

	function onGeoSuccess(position) {
		var geoData = {
			'latitude': position.coords.latitude,
			'longitude': position.coords.longitude,
			'altitude': position.coords.altitude,
			'accuracy': position.coords.accuracy,
			'altitudeAccuracy': position.coords.altitudeAccuracy,
			'heading': position.coords.heading,
			'speed': position.coords.speed
		};

		socketConnection.send(JSON.stringify({'geo': geoData}));
	}

	function onGeoError(error) {
		alert('code: '    + error.code    + '\n' + 
			'message: ' + error.message + '\n');
	}

	function vibrate() {
		// iOS will ignore duration value and vibrate for set time
		navigator.notification.vibrate(500);
	}

	function beep() {
		// need to create file named 'beep.wav' and add to www directory
		navigator.notification.beep(2);
	}			

})();