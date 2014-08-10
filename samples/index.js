/* global Chart */
$(document).ready(function() {

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
    
    var midniteToNoon = $('#timechart .morning canvas').get(0).getContext("2d");
    var midniteToNoonClock = new Chart(midniteToNoon).Clock(appointmentList, {
        startTime: '12:00 AM',
    });    
    var noonToNextDay = $('#timechart .evening canvas').get(0).getContext("2d");
    var noonToNextDayClock = new Chart(noonToNextDay).Clock(appointmentList, {
        startTime: '12:00 PM',
    });

    // The following handles clicking on an event and being able to delete it
	var detailsFunction = function(evt) {
	    // figure out what item you clicked on
	    var clickedItem = this.getItemAtEvent(evt);
	    if (clickedItem === null) {
	        // if it wasn't actually an item, then forget it
	        return;
	    }
	    
	    // Show details about the appointment you clicked on
        $("#details .startTime").text(clickedItem.startTime);
        $("#details .endTime").text(clickedItem.endTime);
        $("#details").css("border-color", clickedItem.fillColor);
        
	    if (clickedItem.isFree) {
	        $("#details .title").text("(Free Time)");
	        $("#details .delete").hide();
	        $("#details .notes").hide();
	    } else {
	        // If the clickedItem is an actual appointment (isFree == false)
	        // Then we can use clickedItem.appointment to refer to the original 
	        // appointment object we put in the list
	        // (Note: this is a reference, so if we change it at any point, we
	        //  should also update the chart.  Not relevant here though.)
	        $("#details .title").text(clickedItem.appointment.title);
	        if (!clickedItem.appointment.notes) {
	            $("#details .notes").empty();
	        } else {
    	        $("#details .notes").text(clickedItem.appointment.notes);
	        }
	        $("#details .notes").show();
	        $("#details .indexAt").val(clickedItem.appointmentIndexAt);
	        $("#details .delete").show();
	    }
        $("#details").show();
	};
	$("#details .delete").click(function (event) {
	    // actually remove the appointment
	    var indexAt = parseInt($("#details .indexAt").val());
	    console.log(indexAt);
	    midniteToNoonClock.removeData(indexAt);
	    noonToNextDayClock.removeData(indexAt);
	    
        // UI cleanup
	    $("#details .indexAt").val("-1");
        $("#details .delete").hide();
        $("#details").hide();
	});
	$("#details").hide();
	// set up the events for clicking on an item in the chart
	Chart.helpers.bindEvents(midniteToNoonClock, ['click'], detailsFunction);
	Chart.helpers.bindEvents(noonToNextDayClock, ['click'], detailsFunction);

	
    // The following handles the add-as-you-go functionality
    $("#start").focus();
    $("#addForm").submit(function (event) {
        event.preventDefault();
        
        // perform validation
        var start = $("#start").val();
        var end = $("#end").val();
        var title = $("#title").val();
        
        var errors = {};
        var emptyStringRegex = /^\s*$/;
        var validTimeRegex = /^(0?[1-9]|1[0-2]):[0-5][0-9] [AP]M$/i;
        
        if (!validTimeRegex.test(start)) {
            errors.start = "Start time must be a valid time (H:MM AM/PM).  The space between time and AM/PM is also required.";
        }
        if (!validTimeRegex.test(end)) {
            errors.end = "Start time must be a valid time (H:MM AM/PM).  The space between time and AM/PM is also required.";
        }
        if (emptyStringRegex.test(title)) {
            errors.title = "Title is required.";
        }
        
        $(this).find(".error").empty();
        if (Object.keys(errors).length > 0) {
            // validation errors, don't continue
            for (var k in errors) {
                $(".error[data-for=" + k + "]").text(errors[k]);
            }
            return;
        }
        
        // actually add the appointment
        midniteToNoonClock.addData({ start: start, end: end, title: title });
        noonToNextDayClock.addData({ start: start, end: end, title: title });
        
        // UI cleanup
        this.reset();
        $("#start").focus();
    });

});
