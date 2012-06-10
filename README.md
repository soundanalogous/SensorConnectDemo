About
===

This is a simple demo using node.js and Cordova (PhoneGap) to create a communication channel between an iOS device and a web application. The example demonstrates how to send iOS sensor data and custom messages to a web application and how to send commands from the web app to the iOS device.

Currently this demo only works for iOS devices. It could be made to work with Android as well if you add a Cordova websocket
plugin for Android. I just don't have an Anroid device to test with.

Setup
---
Install and setup node.js and the required npm modules (note that the modules are not included in the distribution so you'll need to install them yourself):

1. Install [node.js](http://nodejs.org/) if you have not already.
2. Install the following npm modules. Navigate to Sensorconnect/sensor_connect_server in your terminal:
- type: 'npm install websocket' and hit enter
- type: 'npm install websocket-server' and hit enter 
- type: 'npm install express' and hit enter

If you have trouble and are unfamiliar with node.js and npm, please read up on those topics.

Install and setup Cordova (PhoneGap):

1. Download and install [Cordova (PhoneGap)](http://phonegap.com/) (This demo is using Cordova 1.8.0)
2. Follow the Cordova setup instruction for iOS (use the instruction in the download, not the Cordova website because it's typically out of date).
3. Change line 55 of main.js to the hostname of your computer. You can alternatively use the IP address of you're computer but the hostname is better if you're using a mac since your IP address could change.
4. Open the SensorConnect XCode project and compile for you iOS device.

If this is your first time using Cordova (PhoneGap) first make sure you can run the Cordova demo application before trying to run this demo.

Running
---

Once node.js and Cordova are installed and setup you can run the demo:

1. Open Terminal and navigate the SensorConnect/sensor_connect_server/
2. Type 'node server.js' to startup the server (you should see 'Server is listening on port 8080' if successful).
3. Open SensorConnect/server_connect_client in your browser (I've only tested with Chrome... should also work in Firefox and Safari)
4. Open SensorConnect on your iOS device (either directly if you've already installed it, or run it via Xcode)