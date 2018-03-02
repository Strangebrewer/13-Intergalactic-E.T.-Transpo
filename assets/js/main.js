// Initialize Firebase
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

  var newVessel = {
    name: inputName
    , type: inputType
    , dest: inputDest
    , time: inputTime
    , freq: inputFreq
    , dateAdded: firebase.database.ServerValue.TIMESTAMP
  }

  alienDb.ref().push(newVessel);

  $("#name-input").val("");
  $("#type-input").val("");
  $("#dest-input").val("");
  $("#time-input").val("");
  $("#freq-input").val("");

});

// function update() {
//   $("#table-body").html("");
  alienDb.ref().on("child_added", function (childSnapShot, prevChildKey) {
    var outputName = childSnapShot.val().name;
    var outputType = childSnapShot.val().type;
    var outputDest = childSnapShot.val().dest;
    var outputFreq = childSnapShot.val().freq;
    var firstTime = childSnapShot.val().time;
    var convertedTime = moment(firstTime, "HH:mm").subtract(1, "years");
    var diffTime = moment().diff(moment(convertedTime), "minutes");
    var tRemainder = diffTime % outputFreq;
    var timeUntil = outputFreq - tRemainder;
    var nextArrival = moment().add(timeUntil, "minutes").format("h:mm a");
    $("#table-body").append("<tr class='tbody-row'><td>" + outputName + "</td><td>" + outputType + "</td><td>" + outputDest + "</td><td class='td-indent'>" + outputFreq + "</td><td class='td-indent' id='next-arrival'>" + nextArrival + "</td><td class='td-indent' id='time-until'>" + timeUntil + "</td></tr>");
  });
// }

// $(window).ready( function (){
//   update();
//   setInterval(update, 5000);
// })

// // function update() {
// //   $('#clock').html(moment().format('D. MMMM YYYY H:mm:ss'));
// // }
// //   setInterval(update, 1000);

// var alienDbTime = moment(convertedTime, "X").format("h:mm a");

// alienDb.ref().on("value", function (snapshot) {
//   $("#next-arrivl").html(snapshot.val().nextArrival);
//   $("#time-until").html(snapshot.val().timeUntil);
// });

// function update() {
//   //  update firebase timeInterval
// }
// setInterval(update, 1000);