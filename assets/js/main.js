var config = {
  apiKey: "AIzaSyBgKlouqsmcIib8pLbCMI3nxpH84jKZbZY",
  authDomain: "et-vessel-schedule.firebaseapp.com",
  databaseURL: "https://et-vessel-schedule.firebaseio.com",
  projectId: "et-vessel-schedule",
  storageBucket: "et-vessel-schedule.appspot.com",
  messagingSenderId: "620447084970"
};

firebase.initializeApp(config);

var vesselsOnPage = [];

var alienDb = firebase.database();

var dbObject = 0;

// var n = Math.floor(Math.random() * Math.floor(99));

function newDbObject(p1, p2, p3, p4, p5) {
  var newObjKey = alienDb.ref().push().key;
  //  The below, along with the global var n, produces a random key, but it leaves open the possibility, however remote, of producing a duplicate key. I assume firebase's random key generator has an algorithm to prevent duplicate keys.
  // var newObjKey = Math.floor(Math.random() * Math.floor(999999)) + "ETKey" + n;
  // n++;
  var newVessel = {
    name: p1
    , type: p2
    , dest: p3
    , time: p4
    , freq: p5
    , dateAdded: firebase.database.ServerValue.TIMESTAMP
    , objKey: newObjKey
  }
  return alienDb.ref().child(newObjKey).set(newVessel);
}

//  Submit button event listener to create a database object from form input
$("#vessel-form-btn").on("click", function (event) {
  event.preventDefault();

  var inputName = $("#name-input").val().trim();
  var inputType = $("#type-input").val().trim();
  var inputDest = $("#dest-input").val().trim();
  var inputTime = $("#time-input").val().trim();
  var inputFreq = $("#freq-input").val().trim();

  //  Calculate timeUntil so I can disallow invalid (isNaN) time input in the form
  var convertedTime = moment(inputTime, "HH:mm").subtract(1, "years");
  //  Calc the difference between first vessel and current time
  var diffTime = moment().diff(moment(convertedTime), "minutes");
  //  Calc remainder of time difference / frequency
  var tRemainder = diffTime % inputFreq;
  //  Frequency minus remainder equals time until next vessel, which also happens to resolove to NaN unless inputTime is a valid time
  var timeUntil = inputFreq - tRemainder;


  //  Form field validation
  //  Disallow empty fields
  if (inputName === "" || inputType === "" || inputDest === "" || inputTime === "" || inputFreq === "") {
    $("#form-header").html("Add Vessel");
    $("#form-header").append("<span style='color: #ff0000'>&nbsp; - You must fill out all fields</span>");
  }
  else if (inputFreq <= 0) {
    $("#form-header").html("Add Vessel");
    $("#form-header").append("<span style='color: #ff0000'>&nbsp; - You must specify a valid frequency</span>");
    $("#freq-input").val("");
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

    //  function that creates object and pushes to firebase
    newDbObject(inputName, inputType, inputDest, inputTime, inputFreq);

    //  Clear all input fields
    $("#name-input").val("");
    $("#type-input").val("");
    $("#dest-input").val("");
    $("#time-input").val("");
    $("#freq-input").val("");
  }

});
//  End Submit button event listener

//  Firebase listener pushes each snapshot to vesselsOnPage array
alienDb.ref().on("child_added", function (childSnapshot) {
  var data = childSnapshot.val();
  vesselsOnPage.push({
    name: data.name,
    type: data.type,
    dest: data.dest,
    time: data.time,
    freq: data.freq,
    objKey: data.objKey
  });
});

//  Function to calculate nextArrival and timeAway from the time and frequency in vesselsOnPage array
function tableUpdate() {
  //  Empty the table
  $("#table-body").html("");
  //  Loop through veselsOnPage to rebuild the rows in the table.
  for (let i = 0; i < vesselsOnPage.length; i++) {
    const element = vesselsOnPage[i];
    //  Convert time input to military time format
    var convertedTime = moment(element.time, "HH:mm").subtract(1, "years");
    //  Calc the difference between first vessel and current time
    var diffTime = moment().diff(moment(convertedTime), "minutes");
    //  Calc remainder of time difference / frequency
    var tRemainder = diffTime % element.freq;
    //  Set empty variables and set them in conditional statement below
    var timeUntil = element.freq - tRemainder;
    var nextArrival = moment().add(timeUntil, "minutes").format("h:mm a");

    //  Pull name, type, dest, and freq from the array, but nextArrival and timeUntil are calculated locally with each interval to keep them up to date.
    $("#table-body").append("<tr class='tbody-row'><td><button class='btn rmv-btn' data-index='" + i + "'>X</button></td><td>" + element.name + "</td><td>" + element.type + "</td><td>" + element.dest + "</td><td>" + element.freq + "</td><td id='next-arrival'>" + nextArrival + "</td><td id='time-until'>" + timeUntil + "</td></tr>");
  }
}

$("#table-body").on("click", ".rmv-btn", function () {
  var current = $(this).attr("data-index");
  var myKey = vesselsOnPage[current].objKey;
  alienDb.ref().child(myKey).remove();
  vesselsOnPage.splice(current, 1);
  $(this).closest("tr").remove();
});

//  Erase button empties firebase, the local array, and the table body
$("#erase-btn").on("click", function () {
  alienDb.ref().set(null);
  vesselsOnPage.length = 0;
  $("#table-body").empty();
})

//  Reset button empties firebase and the local array and repopulates firebase with 4 'standard' vessels; these populate the html table on the next interval.
$("#reset-btn").on("click", function () {
  alienDb.ref().set(null);
  vesselsOnPage.length = 0;
  newDbObject("Poptart!", "Snackboat", "Yo Mouf", "0630", "30");
  newDbObject("Subway to Venus", "Luxury Yacht", "New Sri Lanka, Venus", "2345", "30");
  newDbObject("Muthaship to Mars", "Mothership", "Olympus Mons", "1200", "2880");
  newDbObject("The Large Marge Barge", "Garbage Barge", "Sector Xk-98a, aka 'The Dump'", "0600", "120");
});

setTimeout(tableUpdate, 1000);

setInterval(tableUpdate, 1000);