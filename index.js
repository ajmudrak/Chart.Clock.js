$(document).ready(function() {

    var appointmentList = [
        { start: '12:30 PM', end: '1:45 PM', title: "Luncheon at Abe's" },
        { start: '12:45 PM', end: '1:15 PM', title: "An Overlap" },
        { start: '12:45 PM', end: '1:15 PM', title: "An Overlap" },
        { start: '12:45 PM', end: '1:15 PM', title: "An Overlap" },
        { start: '12:45 PM', end: '1:15 PM', title: "An Overlap" },
        { start: '12:45 PM', end: '1:15 PM', title: "An Overlap" },
        { start: '9:00 AM', end: '11:00 AM', title: "Staff meeting" },
        { start: '3:30 PM', end: '4:30 PM', title: "Late meeting" },
        { start: '11:30 AM', end: '12:15 PM', title: "Morning/Afternoon" },
        { start: '6:00 PM', end: '7:00 PM', title: "dinner" },
        { start: '8:00 PM', end: '8:30 PM', title: "tv" },
    ];
    
    var chart0 = new Chart($('#timechart .morning canvas').get(0).getContext("2d")).Clock(appointmentList, {
        startTime: '12:00 AM',
    });    
    var chart1 = new Chart($('#timechart .evening canvas').get(0).getContext("2d")).Clock(appointmentList, {
        startTime: '12:00 PM',
    });    

});
