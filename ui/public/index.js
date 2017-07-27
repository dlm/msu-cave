var firebase= require('firebase');

firebase.initializeApp({
            apiKey: "AIzaSyBMcXd3cG8JoinbmykBtXyWTJZn9P-XYDY",
            databaseURL: "https://msu-cave.firebaseio.com/",
            authDomain: "msu-cave.firebaseapp.com",
         });
firebase.auth().signInWithEmailAndPassword("admin@holter.com", "msu-cave-rocks").catch(function(error) {
            console.log("Add some things in here");
            var errorCode = error.code;
            var errorMessage = error.message;
        });

var ui = firebase.database().ref('installations/holter/ui');
var off_button = ui.child('button01_off');
var power_button = ui.child('button02_power');
var shutdownToggle = ui.child('shutdown/pod1_shutdown'); //need to change to correct pod id


// call shutdown function when button01_off is true
off_button.on("value", function(snap) {
	if (snap.val() == true) {
		shutdown_procedure();
	}
});

// turn off pi when button02_power is true
power_button.on("value", function(snap) {
	if (snap.val() == true) {
		shutdownToggle.set(false);
		//execSync('shutdown -h now');
	}
});


function shutdown_procedure() {
	
	// shutdown stuff goes here

	shutdownToggle.set(true);
}

