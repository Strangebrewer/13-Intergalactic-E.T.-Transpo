var config = {
  apiKey: "AIzaSyBgKlouqsmcIib8pLbCMI3nxpH84jKZbZY",
  authDomain: "et-vessel-schedule.firebaseapp.com",
  databaseURL: "https://et-vessel-schedule.firebaseio.com",
  projectId: "et-vessel-schedule",
  storageBucket: "et-vessel-schedule.appspot.com",
  messagingSenderId: "620447084970"
};
firebase.initializeApp(config);

var alienDb = firebase.database();

$("#vessel-form-btn").on("click", function (event) {
  event.preventDefault();

  var inputName = $("#name-input").val().trim();
  var inputType = $("#type-input").val().trim();
  var inputDest = $("#dest-input").val().trim();
  var inputTime = $("#time-input").val().trim();
  var inputFreq = $("#freq-input").val().trim();

  //  calculating timeUntil so I can disallow invalid times below
  //  These will be calculated again in the "child_added" listener below - at least until I can figure out if one is better than the other for continuous time updates
  var convertedTime = moment(inputTime, "HH:mm");
  var diffTime = moment().diff(moment(convertedTime), "minutes");
  var tRemainder = diffTime % inputFreq;
  var timeUntil = inputFreq - tRemainder;
  
  //  Form field validation
  //  Disallow empty fields
  if (inputName === "" || inputType === "" || inputDest === "" || inputTime === "" || inputFreq === "") {
    $("#form-header").html("Add Vessel");
    $("#form-header").append("<span style='color: red'>&nbsp; - You must fill out all fields</span>");
  }
  //  Disallow invalid times by checking if timeUntil resolves to NaN
  else if (isNaN(timeUntil)) {
    $("#form-header").html("Add Vessel");
    $("#time-input").val("");
    $("#form-header").append("<span style='color: red'>&nbsp; - You must specify a valid 24-hour time</span>");
  }
  //  If all fields validate, create object and push to firebase
  else {
    $("#form-header").html("Add Vessel");

    //  Create database object
    var newVessel = {
      name: inputName
      , type: inputType
      , dest: inputDest
      , time: inputTime
      , freq: inputFreq
      , dateAdded: firebase.database.ServerValue.TIMESTAMP
    }

    //  Push to firebase
    alienDb.ref().push(newVessel);

    //  Clear all input fields
    $("#name-input").val("");
    $("#type-input").val("");
    $("#dest-input").val("");
    $("#time-input").val("");
    $("#freq-input").val("");
  }

});

alienDb.ref().on("child_added", function (childSnapShot, prevChildKey) {
  var outputName = childSnapShot.val().name;
  var outputType = childSnapShot.val().type;
  var outputDest = childSnapShot.val().dest;
  var outputFreq = childSnapShot.val().freq;
  var firstTime = childSnapShot.val().time;
  var convertedTime = moment(firstTime, "HH:mm");
  var diffTime = moment().diff(moment(convertedTime), "minutes");
  var tRemainder = diffTime % outputFreq;
  var timeUntil = outputFreq - tRemainder;
  var nextArrival = moment().add(timeUntil, "minutes").format("h:mm a");
  $("#table-body").append("<tr class='tbody-row'><td>" + outputName + "</td><td>" + outputType + "</td><td>" + outputDest + "</td><td class='td-indent'>" + outputFreq + "</td><td class='td-indent' id='next-arrival'>" + nextArrival + "</td><td class='td-indent' id='time-until'>" + timeUntil + "</td></tr>");
});