/* global Chart */

var appointmentList = [
	{ start: '12:30 PM', end: '1:45 PM', title: "Luncheon at Abe's" },
	{ start: '12:45 PM', end: '1:15 PM', title: "An Overlap 1" },
	{ start: '1:00 PM', end: '2:15 PM', title: "An Overlap 2" },
	{ start: '2:00 PM', end: '3:00 PM', title: "An Overlap 3" },
	{ start: '9:00 AM', end: '11:00 AM', title: "Staff meeting" },
	{ start: '3:30 PM', end: '4:30 PM', title: "Late meeting" },
	{ start: '11:30 AM', end: '12:15 PM', title: "Quick reading" },
	{ start: '6:00 PM', end: '7:00 PM', title: "dinner", notes: "Don't each the leftovers from last week" },
	{ start: '8:00 PM', end: '8:30 PM', title: "tv", color: '#3a6', highlight: '#5d8' },
];

// Note: this sample uses jQuery code to obtain the canvas in the HTML
// jQuery is not required, and you could put an ID directly on the canvases
// and instead use document.getElementById("whateverIdsYouChose");

var midniteToNoon = document.getElementById("morning").getContext("2d");
var midniteToNoonClock = new Chart(midniteToNoon).Clock(appointmentList, {
	startTime: '12:00 AM',
});    
var noonToNextDay = document.getElementById("evening").getContext("2d");
var noonToNextDayClock = new Chart(noonToNextDay).Clock(appointmentList, {
	startTime: '12:00 PM',
});
