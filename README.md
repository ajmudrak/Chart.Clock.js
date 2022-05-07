Chart.Clock.js - Clock View for a List of appointments (v1.0.3)
==============
(C)2014 Copyright Andy Mudrak, MIT License

Chart.Clock.js is an extension to Chart.js to provide a clock chart that 
displays sections/free time based on a list of appointments, and can also show 
the current time.

## Demo
http://andymudrak.com/demos/Chart.Clock.js/

## Creator's website
Andy Mudrak: http://andymudrak.com/

## Requirements

- Moment.js http://momentjs.com/
- Chart.js http://www.chartjs.org/

## How to Use

Simply load the prerequisites on your page (may vary from below, e.g. if you 
want to use the .min version of each library):
```
<script src="moment.js"></script>
<script src="Chart.js"></script>
```

Then also add the Chart.Clock.js script, which extends Chart.js.
```
<script src="Chart.Clock.js"></script>
```

Then, just like most Chart.js charts, you add a canvas to your page, with an 
appropriate width and height:
```
<canvas id="myClockCanvas" width="400" height="400"></canvas>
```

In JavaScript code, you must then prepare the data (list of times) to be shown 
in the clock view:
```
var appointmentList = [
    { start: '12:30 PM', end: '1:45 PM', title: "Luncheon at Abe's" },
    { start: '12:45 PM', end: '1:15 PM', title: "An Overlap 1" },
    { start: '1:00 PM', end: '2:15 PM', title: "An Overlap 2" },
    { start: '2:00 PM', end: '3:00 PM', title: "An Overlap 3" },
    { start: '9:00 AM', end: '11:00 AM', title: "Staff meeting" },
    { start: '3:30 PM', end: '4:30 PM', title: "Late meeting" },
    { start: '11:30 AM', end: '12:15 PM', title: "Quick reading" },
    { start: '6:00 PM', end: '7:00 PM', title: "dinner" },
    { start: '8:00 PM', end: '8:30 PM', title: "tv", color: '#3a6', highlight: '#5d8' },
];
```

As you can see, the chart data is an array of objects.  Each object should have 
a `start`, `end`, and `title` property.  The start and end properties should 
match the format: "h:mm A", (12-hour hour digits, a colon, and 2 digits for the 
minutes, followed by a space and then AM or PM).  No other time formats are 
accepted.

In addition, there are two optional properties called `color` and `highlight` 
that override the default colors for that specific appointment.

You may include any number of other object properties as you wish.  These can be
referenced later if using events, for instance.

Finally, initialize the canvas with a new clock view and list of appointments, 
using the following JavaScript:
```
var myClockCanvas = document.getElementById("myClockCanvas").getContext("2d");
var myClockParams = {
    startTime: '12:00 AM',
};
var myClock = new Chart(myClockCanvas).Clock(appointmentList, myClockParams);    
```

And that's it!

## Other Notes

The clock view is always a 12-hour view.  Typically you set the 
`startTime` in the chart's options to 12:00AM or 12:00PM.  Though other 
variations are technically possible.  The idea is that 12:00AM (or PM) starts at
the top, where it would on a normal clockface.

In the example above, the time starts at 12:00am, and ends at 12:00pm.  As a 
result, all the appointments in the list that do not fall within that clockface 
are not shown.  Anything that starts before or ends after the clockface will be 
truncated as well.  See the samples for an example how this is handled.

## Options (and Defaults)

The myClockParams variable/parameter in the example above may contain other 
customizations similar to that familiar with Chart.js charts.  The following 
are the defaults for the clock view:
```
{
	//Boolean - Whether we should show a stroke on each segment
	segmentShowStroke : true,

	//String - The color of each segment stroke
	segmentStrokeColor : "#fff",

	//Number - The width of each segment stroke
	segmentStrokeWidth : 2,

	//The percentage of the chart that we cut out of the middle.
	percentageInnerCutout : 50,

	//Number - Amount of animation steps
	animationSteps : 100,

	//String - Animation easing effect
    animationEasing: "easeOutSine",

	//Boolean - Whether we animate the rotation of the Doughnut
	animateRotate : true,

	//Boolean - Whether we animate scaling the Doughnut from the centre
	animateScale : false,

	//String - A legend template
	legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<segments.length; i++){%><li><span style=\"background-color:<%=segments[i].fillColor%>\"></span><%if(segments[i].label){%><%=segments[i].label%><%}%></li><%}%></ul>",
	
	//String - The color of the lines for the hours in the clockface
    hourMarkerColor: '#ccc',
    
    //Number - The width of the lines for the hours in the clockface
    hourMarkerWidth: 1,
    
    //String - The color of the line representing the current time of day
    currentTimeColor: '#000',
    
    //Number - The width of the line representing the current time of day
    currentTimeWidth: 2,
    
    //String - The time for the start of the clock (typically 12:00 AM or 12:00 PM)
    startTime: '12:00 PM',
    
    //String - The template for the tooltip when hovering over an item
    tooltipTemplate: "<%if (label){%><%=label%><%}%><%if (isFree) {%>Free<%}%><%if (isOff) {%>/Off<%}%> (<%=startTime%> - <%=endTime%>)",
    
    //String - The default color of each appointment on the clock
    appointmentColor: '#36a',

    //String - The default highlight color of each appointment on the clock
    appointmentHighlight: '#58d',
    
    //String - The default color of free time on the clock
    freeColor: '#ddd',
    
    //String - The default highlight color of free time on the clock
    freeHighlight: '#eee',
    
    //String - The start time of working hours on the click
    workingHoursStart: '9:00 AM',
    
    //String - The end time of working hours on the click
    workingHoursEnd: '5:00 PM',
    
    //String - The default color of non-working-hours free time on the clock
    offhoursColor: '#999',
    
    //String - The default highlight color of non-working-hours free time
    offhoursHighlight: '#aaa',
    
    //Number - the percentage of maximum radius for overlapping appointments
    overlapRadiusPercent: 25,
}
```

See the Charts.js documentation (http://www.chartjs.org/docs/) for further 
details on additional options and defaults.  

The "Chart Options" are based on the "Pie/Doughnut" graph 
(http://www.chartjs.org/docs/#doughnut-pie-chart-chart-options) in Charts.js.  

## Other Functions

### addData(appointmentItem, indexAt)
This function will allow you to add an appointment to an existing chart object.
The parameter `indexAt` is optional, and if omitted will add to the end of the 
list.  Technically, the order in which you add the item into the list does not 
matter but is used if you wish to remove it later.
```
myClock.addData({ start: '1:00 PM', end: '2:00 PM', title: 'lunch!'});
```

### removeData(indexAt)
This function will allow you to remove an appointment from an existing chart
object.  The `appointmentList` property on an existing chart will give you the
current list.
```
myClock.removeData(myClock.appointmentList.length - 1);
```

### getItemAtEvent(event)
For a given JavaScript event, will determine what item is clicked on (or
mouseover/mouseout, etc.) within the chart.  Returns null if no item is found.
This can be used within Chart.helpers.bindEvents to determine what appointment
in the chart is being interacted with.  However, free time slots are also 
considered.

The item returned will contains properties for `startTime`, `endTime`, 
`appointmentIndexAt` (the index of the item in the chart's `appointmentList`), 
and `appointment` (the original appointment object added to the chart).  

In addition, a property for `isFree` (true/false) indicates if it is free time 
or an appointment.  When free time is true, then the `appointment` property 
will be undefined.  There is also a property for `isOff`, which when true, 
indicates it is outside the working hours.

```
// set up the click function
var clickFunction = function(event) {
    // figure out what item you clicked on
    var clickedItem = this.getItemAtEvent(event);
    if (clickedItem === null) {
        // if it wasn't actually an item, then forget it
        return;
    }
    
    // Show details about the appointment you clicked on
    if (clickedItem.isFree) {
        alert("Free Time! " + clickedItem.startTime + " - " + clickedItem.endTime);
    } else {
        alert(clickedItem.appointment.title + clickedItem.startTime + " - " + clickedItem.endTime);
    }
};

// set up the events for clicking on an item in the chart
Chart.helpers.bindEvents(myClock, ['click'], clickFunction);
```

## Updates / Bug Fixes

### v1.0.3
- Updated Moment.js to v2.29.3 to eliminate vulnerability

### v1.0.2
- fixed a rendering bug when drawing the hour lines and current hour

### v1.0.1
- fixed issues with start/end time for appointments crossing the end or starting before the beginning of a clock face were showing the truncated times, not the full times
- fixed issue with free time appearing as non-working hours if it crossed the end of non-working hours
