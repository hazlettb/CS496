// CS496 Final Project
// Barbara Hazlett
// 12/06/2014
//
// This is a time card app that sends employee ID and datetime data to 
// GAE.  It takes text input for the ID or will scan a barcode ID using 
// the Scandit module.  The required additional feature is a chat using  
// pubnub.  There is also an admin page that is not fully implemented 
// for uploading employee id, name and photo to GAE.

// Include pubnub 
Ti.include('./pubnub-chat.js');

// Set background color of the master UIView
Titanium.UI.setBackgroundColor('#000');

var win1 = Titanium.UI.createWindow({
	title: "Time Card"
});

//Employee ID - label and button
var emp = Titanium.UI.createLabel({
	text: "Employee Id",	
	left: '20dp',
	top: '20dp'
});

win1.add(emp);

var emp_id = Titanium.UI.createTextArea({
	editable: true,
	textAlign: 'left',
	width: '150dp',
	left: '20dp',
	top: '40dp',
	borderColor: 'grey',
	borderRadius: '2dp',
	borderWidth: '3dp'
	
});

win1.add(emp_id);

// create scanner button
var scanButton = Titanium.UI.createButton({
	width: '150dp',	
	top: '35dp',
	right: '20dp',
	title: "Scan ID"
});

win1.add(scanButton);

scanButton.addEventListener('click', function() {
	openScanner();
});

//Scandit code - essentially from their documentation w/ a few mods
// load the Scandit SDK module
var scanditsdk = require("com.mirasense.scanditsdk");

var picker;

// Create a window to add the picker to and display it.
var window3 = Titanium.UI.createWindow({
	title:'ID Scan',
	navBarHidden:true
});

// Sets up the scanner and starts it in a new window.
var openScanner = function() {
// Instantiate the Scandit SDK Barcode Picker view
	picker = scanditsdk.createView({
	width:"100%",
	height:"50%"
});

// Initialize the barcode picker, remember to paste your own app key here.
picker.init("cI06DoZRNeNs7CwJYtYHHzpLKhdLh2k/2QaKmTKXMAk", 0);
picker.showSearchBar(true);

// add a tool bar at the bottom of the scan view with a cancel button (iphone/ipad only)
picker.showToolBar(true);

// Set callback functions for when scanning succeeds and for when the
// scanning is canceled.
picker.setSuccessCallback(function(e) {
	alert("success (" + e.symbology + "): " + e.barcode);
	emp_id.value = e.barcode;
	closeScanner();
});

picker.setCancelCallback(function(e) {
	closeScanner();
});

window3.add(picker);

window3.addEventListener('open', function(e) {
// Adjust to the current orientation.
// since window.orientation returns 'undefined' on ios devices
// we are using Ti.UI.orientation (which is deprecated and no longer
// working on Android devices.)
	if(Ti.Platform.osname == 'iphone' || Ti.Platform.osname == 'ipad'){
		picker.setOrientation(Ti.UI.orientation);
	}
	else {
		picker.setOrientation(window3.orientation);
	}
	picker.setSize(Ti.Platform.displayCaps.platformWidth,
	Ti.Platform.displayCaps.platformHeight);
	picker.startScanning(); // startScanning() has to be called after the window is opened.
});
window3.open();
};

// Stops the scanner, removes it from the window and closes the latter.
var closeScanner = function() {
	if (picker != null) {
		picker.stopScanning();
		window3.remove(picker);
	}
window3.close();
};

// Changes the picker dimensions and the video feed orientation when the
// orientation of the device changes.
Ti.Gesture.addEventListener('orientationchange', function(e) {
	window3.orientationModes = [Titanium.UI.PORTRAIT, Titanium.UI.UPSIDE_PORTRAIT,
	Titanium.UI.LANDSCAPE_LEFT, Titanium.UI.LANDSCAPE_RIGHT];
	if (picker != null) {
		picker.setOrientation(e.orientation);
		picker.setSize(Ti.Platform.displayCaps.platformWidth,
		Ti.Platform.displayCaps.platformHeight);

// You can also adjust the interface here if landscape should look
// different than portrait.
}
});


//IN button
var inButton = Titanium.UI.createButton({
	title: "IN",
	width: '120dp',
	height: '120dp',
	top: '120dp',
	borderColor: 'green',
	borderRadius: '2dp',
	borderWidth: '3dp',
	font: {fontSize: '35dp'}
});

win1.add(inButton);

inButton.addEventListener('click', function(){
	var in_out = "IN";
	transmit(in_out);
	
	//clear data in form
	emp_id.value = '';
	
});

//OUT button
var outButton = Titanium.UI.createButton({
	title: "OUT",
	width: '120dp',
	height: '120dp',
	top: '270dp',
	borderColor: 'red',
	borderRadius: '2dp',
	borderWidth: '3dp',
	font: {fontSize: '35dp'}
});

win1.add(outButton);

outButton.addEventListener('click', function(){
	var in_out = "OUT";
	transmit(in_out);
	
	//clear data in form
	emp_id.value = '';
	
});

//send timeclock data to google cloud with help from Kate Musik's howto guide
function transmit(in_out){
	var xhr = Titanium.Network.createHTTPClient();
	xhr.open("POST", "http://hazlettb-fp1.appspot.com/native");
	
	xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	
	xhr.onload = function(){
		if(this.status =='200'){
			alert('Transmission successful');
		}else{
			alert('Transmission failed. Try again later. ' + this.status + " " + this.response);
		}
	};
	
	xhr.onerror = function(e){alert('Transmission error: ' + e.error);};
	
	var now = new Date();
	
	Ti.API.info(now.getDate());
			
	var params = "id=" + emp_id.value + "&month=" + (now.getMonth()+1) + "&day=" + now.getDate() + "&year=" + now.getFullYear() +"&hour=" + now.getHours() + "&minute=" + now.getMinutes() + "&second=" + now.getSeconds() + "&in_out=" + in_out; 
	Ti.API.info(params);
	
	xhr.send(params);
}

//Go to admin page
var adminButton = Titanium.UI.createButton({
	title: "Admin",
	width: '150dp',
	right: '20dp',
	bottom: '20dp'
});

win1.add(adminButton);

adminButton.addEventListener("click", function(e){
	win2.open();
});

//Go to chat page
var chatButton = Titanium.UI.createButton({
	title: "Chat",
	width: '150dp',
	left: '20dp',
	bottom: '20dp'
});

win1.add(chatButton);

// Create win for chat
var win3 = Ti.App.Chat({
    "chat-room" : "my-random-conversation",
    "window"    : {
        title           : 'Chat Room',
        backgroundColor : '#000'
    }
});

// Open Chat Window
chatButton.addEventListener("click", function(e){
	win3.chat_window.open();
});

//Create win2 for admin features display
var win2 = Titanium.UI.createWindow({
	title: "Add Employee",
	backgroundColor: '#000'});

var backButton = Titanium.UI.createButton({
	title: "Back",
	width: '150dp',
	right: '20dp',
	bottom: '20dp'
});

//Submit button
var submitTimeButton2 = Titanium.UI.createButton({
	title: "Submit",
	width:'150dp',
	left: '20dp',
	bottom: '20dp'
});

win2.add(submitTimeButton2);

//Back to home page
backButton.addEventListener("click", function(e){
	win2.close();
});

win2.add(backButton);

//Employee ID 
var emp2 = Titanium.UI.createLabel({
	text: "Employee Id",	
	top: '20dp'
});

win2.add(emp2);

var emp_id2 = Titanium.UI.createTextArea({
	editable: true,
	width: '300dp',
	top: '40dp',
	borderColor: 'grey',
	borderRadius: '2dp',
	borderWidth: '3dp'
	
});

win2.add(emp_id2);

//Employee Name 
var emp_name = Titanium.UI.createLabel({
	text: "Employee Name",	
	top: '80dp'
});

win2.add(emp_name);

var emp_name2 = Titanium.UI.createTextArea({
	editable: true,
	width: '300dp',
	top: '100dp',
	borderColor: 'grey',
	borderRadius: '2dp',
	borderWidth: '3dp'
	
});

win2.add(emp_name2);

//camera button
var photoButton = Titanium.UI.createButton({
	title: "Take Photo",
	top: '140dp'
});

win2.add(photoButton);

//code for camera
photoButton.addEventListener("click", function(e){
Titanium.Media.showCamera({
	success:function(event) {
		// called when media returned from the camera
		Ti.API.debug('Our type was: '+event.mediaType);
		if(event.mediaType == Ti.Media.MEDIA_TYPE_PHOTO) {
			var imageView = Ti.UI.createImageView({
				top: '200dp',
				width:120,
				height:120,
				image:event.media
			});
			win2.add(imageView);
		} else {
			alert("got the wrong type back ="+event.mediaType);
		}
	},
	cancel:function() {
		// called when user cancels taking a picture
	},
	error:function(error) {
		// called when there's an error
		var a = Titanium.UI.createAlertDialog({title:'Camera'});
		if (error.code == Titanium.Media.NO_CAMERA) {
			a.setMessage('Please run this test on device');
		} else {
			a.setMessage('Unexpected error: ' + error.code);
		}
		a.show();
	},
	saveToPhotoGallery:true    
});

});

win1.open();
