/* global moment, Chart */

(function() {
	var root = this,
		Chart = root.Chart,
		//Cache a local reference to Chart.helpers
		helpers = Chart.helpers;
		
    var defaultConfig = {
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
        overlapRadiusPercent: 25
    };
    
    Chart.Type.extend({
        name: "Clock",
        defaults : defaultConfig,
        appointmentList: null,
        initialize: function(data){
            this.total = 12;
            this.appointmentList = data.slice();
            
            this.beginning = moment(this.options.startTime, "h:mm A").month(1).date(1).year(1970);
            this.ending = moment(this.beginning).add({ hours: this.total });
            this.workbeginning = moment(this.options.workingHoursStart, "h:mm A").month(1).date(1).year(1970);
            this.workending = moment(this.options.workingHoursEnd, "h:mm A").month(1).date(1).year(1970);

            // keep track of original indexes in list before sorting
            var appointmentList = [];
            for (var a = 0; a < this.appointmentList.length; a++) {
                appointmentList.push({ indexAt: a, appointment: this.appointmentList[a] });
            }
            
            for (var i = 0; i < appointmentList.length; i++) {
                appointmentList[i].startMoment = moment(appointmentList[i].appointment.start, "h:mm A").month(1).date(1).year(1970);
                appointmentList[i].endMoment = moment(appointmentList[i].appointment.end, "h:mm A").month(1).date(1).year(1970);
            }
            appointmentList.sort(function (a, b) {
                if(a.startMoment.isBefore(b.startMoment)) {
                    return -1;
                }
                else if (a.startMoment.isAfter(b.startMoment)) {
                    return 1;
                }
                else {
                    // a must be equal to b
                    return 0;
                }
            });

            // convert the appointmentList data to pie chart data
            var last = [ moment(this.beginning) ];
            var maxLast = last[0];
            var layerData = [ [] ];
            for (var i = 0; i < appointmentList.length; i++) {
                var appointment = appointmentList[i].appointment;
                var indexAt = appointmentList[i].indexAt;
                var origStart = appointmentList[i].startMoment;
                var origEnd = appointmentList[i].endMoment;
                var start = moment(origStart);
                var end = moment(origEnd);
                var color = appointment.color || this.options.appointmentColor;
                var highlight = appointment.highlight || this.options.appointmentHighlight;
                if (end.isBefore(start) || start.isAfter(this.ending) || end.isBefore(this.beginning)) {
                    // ends before this chart, or starts after it, or its start/end times are backwards
                    continue;
                }
                if (end.isAfter(this.ending)) {
                    // end has to be truncated to fit in chart
                    end = moment(this.ending);
                }
                if (start.isBefore(this.beginning)) {
                    // start has to be adjusted to fit in chart
                    start = moment(this.beginning);
                }
                var layer = -1;
                
                // if there's overlaps from before, count how many are no longer needed
                if (last.length > 1) {
                    for (var z = 0; z < last.length; z++) {
                        if (last[z] === null || !last[z].isAfter(start)) {
                            if (layer == -1) {
                                // replace the first one we find
                                layer = z;
                                last[z] = end;
                            } else {
                                // null out any others
                                last[z] = null;
                            }
                        }
                    }
                    if (layer == -1) {
                        // it wasn't added yet, so add it to the end as a new overlap
                        layer = last.length;
                        last.push(end);
                    } else {
                        // clean up contiguous nulls from the end
                        for (var n = last.length - 1; n > 0; n--) {
                            if (last[n] === null) {
                                // remove from array
                                last.slice(n, 1);
                            } else {
                                break;
                            }
                        }
                    }
                } else if (last[0].isAfter(start)) {
                    // put it on as a new overlap if it's overlapping
                    last.push(end);
                    layer = 1;
                } else {
                    layer = 0;
                    last[0] = end;
                }
                if (last.length > layerData.length) {
                    layerData.push([]);
                }

                if (layer === 0) {
                    // check to add free time if it's not overlapping
                    if (maxLast.isBefore(start)) {
                        this.addFreeInternal(layerData, maxLast, start);
                    }
                }

                var duration = moment.duration(moment(end).subtract(start)).asHours();
                layerData[layer].push({ appointment: appointment, appointmentIndexAt: indexAt, layer: layer, startAngle: this.calculateCircumference(moment.duration(start).asHours() % 12), value: duration, color: color, highlight: highlight, label: appointment.title, startTime: origStart.format("h:mm A"), endTime: origEnd.format("h:mm A"), segmentStartTime: start.format("h:mm A"), segmentEndTime: end.format("h:mm A"), isOff: false, isFree: false });

                // recalculate maxLast
                maxLast = moment.max(maxLast, end);
            }
            if (maxLast.isBefore(this.ending)) {
                // calculate remainder to fill out the clock and add that to the pie chart
                this.addFreeInternal(layerData, maxLast, this.ending);
            }
            
            // populate chart data from the layers, from the back to front so they're drawn later in the right order
			var chartData = [];
			for (var x = 0; x < layerData.length; x++) {
			   for (var y = 0; y < layerData[x].length; y++) {
			       chartData.push(layerData[x][y]);
			   }
			}
			this.maxLayers = layerData.length;

            // initialize underlying pie chart
            //Declare segments as a static property to prevent inheriting across the Chart type prototype
			this.segments = [];
			this.outerRadius = (helpers.min([this.chart.width,this.chart.height]) -	this.options.segmentStrokeWidth/2)/2;

			this.SegmentArc = Chart.Arc.extend({
				ctx : this.chart.ctx,
				x : this.chart.width/2,
				y : this.chart.height/2
			});

			//Set up tooltip events on the chart
			if (this.options.showTooltips){
				helpers.bindEvents(this, this.options.tooltipEvents, function(evt){
					var activeSegments = (evt.type !== 'mouseout') ? this.getSegmentsAtEvent(evt) : [];

					helpers.each(this.segments,function(segment){
						segment.restore(["fillColor"]);
					});
					helpers.each(activeSegments,function(activeSegment){
						activeSegment.fillColor = activeSegment.highlightColor;
					});
					this.showTooltip(activeSegments);
				});
			}
			
			helpers.each(chartData,function(datapoint, index){
				this.addDataInternal(datapoint, index);
			},this);
			
			this.render();
		},
		addFreeInternal: function(layerData, maxLast, start) {
            // calculate the offset to add first, and add that to pie chart
            var freeStart = moment(maxLast);
            var freeEnd = moment(start);
            if (freeStart.isBefore(this.workbeginning) && freeEnd.isAfter(this.workbeginning)) {
                // split nonworking/free
                var nonduration = moment.duration(moment(this.workbeginning).subtract(freeStart)).asHours();
                layerData[0].push({ layer: 0, startAngle: this.calculateCircumference(moment.duration(freeStart).asHours() % 12), value: nonduration, color: this.options.offhoursColor, highlight: this.options.offhoursHighlight, label: "", startTime: freeStart.format("h:mm A"), endTime: this.workbeginning.format("h:mm A"), segmentStartTime: freeStart.format("h:mm A"), segmentendTime: this.workbeginning.format("h:mm A"), isOff: true, isFree: true });
                freeStart = this.workbeginning;
            }
            if (freeStart.isBefore(this.workending) && freeEnd.isAfter(this.workending)) {
                // split free/nonworking
                var freetruncated = moment.duration(moment(this.workending).subtract(freeStart)).asHours();
                layerData[0].push({ layer: 0, startAngle: this.calculateCircumference(moment.duration(freeStart).asHours() % 12), value: freetruncated, color: this.options.freeColor, highlight: this.options.freeHighlight, label: "", startTime: freeStart.format("h:mm A"), endTime: this.workending.format("h:mm A"), segmentStartTime: freeStart.format("h:mm A"), segmentendTime: this.workending.format("h:mm A"), isOff: false, isFree: true });
                freeStart = this.workending;
            }
            var freeColor;
            var freeHighlight;
            var isoff = false;
            if (freeEnd.isBefore(this.workbeginning) || freeEnd.isSame(this.workbeginning) || freeStart.isAfter(this.workending) || freeStart.isSame(this.workending)) {
                // this is actually non-working time we want
                freeColor = this.options.offhoursColor;
                freeHighlight = this.options.offhoursHighlight;
                isoff = true;
            } else {
                freeColor = this.options.freeColor;
                freeHighlight = this.options.freeHighlight;
            }
            var freeduration = moment.duration(moment(freeEnd).subtract(freeStart)).asHours();
            layerData[0].push({ layer: 0, startAngle: this.calculateCircumference(moment.duration(freeStart).asHours() % 12), value: freeduration, color: freeColor, highlight: freeHighlight, label: "", startTime: freeStart.format("h:mm A"), endTime: freeEnd.format("h:mm A"), segmentStartTime: freeStart.format("h:mm A"), segmentendTime: freeEnd.format("h:mm A"), isOff: isoff, isFree: true });
		},
		update : function(){
		    this.initialize(this.appointmentList);
		},
        reflow: function(){
			helpers.extend(this.SegmentArc.prototype,{
				x : this.chart.width/2,
				y : this.chart.height/2
			});
			this.outerRadius = (helpers.min([this.chart.width,this.chart.height]) -	this.options.segmentStrokeWidth/2)/2;
			helpers.each(this.segments, function(segment){
				segment.update({
					outerRadius : this.getOuterRadius(segment),
					innerRadius : 0
				});
			}, this);
		},
		getOuterRadius: function(segment) {
		    var maxRadius = this.outerRadius;
		    var overlapSize = maxRadius * (this.options.overlapRadiusPercent / 100);
		    var retval = maxRadius - ((overlapSize / this.maxLayers) * segment.layer);
		    return retval;
		},
		addData: function(item, atIndex, silent) {
		    var index = atIndex || this.segments.length;
		    this.appointmentList.splice(index, 0, item);
		    if (!silent) {
		        this.update();
		    }
		},
		removeData: function(atIndex, silent){
			var indexToDelete = (helpers.isNumber(atIndex)) ? atIndex : this.appointmentList.length - 1;
			this.appointmentList.splice(indexToDelete, 1);
			if (!silent) {
			    this.update();
			}
		},
        addDataInternal: function(segment, atIndex){
			var index = atIndex || this.segments.length;
			this.segments.splice(index, 0, new this.SegmentArc({
				value : segment.value,
				outerRadius : (this.options.animateScale) ? 0 : this.getOuterRadius(segment),
				innerRadius : 0,
				fillColor : segment.color,
				highlightColor : segment.highlight || segment.color,
				showStroke : this.options.segmentShowStroke,
				strokeWidth : this.options.segmentStrokeWidth,
				strokeColor : this.options.segmentStrokeColor,
				startAngle : Math.PI * 1.5,
				desiredStartAngle: segment.startAngle,
				layer: segment.layer,
				circumference : (this.options.animateRotate) ? 0 : this.calculateCircumference(segment.value),
				label : segment.label,
				startTime: segment.startTime,
				endTime: segment.endTime,
				isOff: segment.isOff,
				isFree: segment.isFree,
				appointment: segment.appointment,
				appointmentIndexAt: segment.appointmentIndexAt,
				segmentStartTime: segment.segmentStartTime,
				segmentEndTime: segment.segmentEndTime
			}));
		},
        getItemAtEvent : function(e){
			var array = this.getSegmentsAtEvent(e);
			if (array.length === 0) {
			    return null;
			}
			return array[0];
		},
        getSegmentsAtEvent : function(e){
			var segmentsArray = [];

			var location = helpers.getRelativePosition(e);

			helpers.each(this.segments, function(segment) {
				if (segment.inRange(location.x, location.y)) {
				    // only allow one segment at a time to be highlighted
				    segmentsArray[0] = segment;
				}
			}, this);
			return segmentsArray;
		},
		calculateCircumference : function(value){
			return (Math.PI*2)*(value / this.total);
		},
        calculateTotal: function() {
            // time clock is fixed at 12 hours
			this.total = 12;
		},
        drawHourLineRaw: function(hour) {
            this.chart.ctx.beginPath();
            var width = parseInt(this.chart.ctx.canvas.style.width);
            var height = parseInt(this.chart.ctx.canvas.style.height);
            this.chart.ctx.moveTo(width / 2, height / 2);
            this.chart.ctx.lineTo((width / 2) + (Math.sin((hour / -12) * (2 * Math.PI) + Math.PI) * (width - 2) / 2), (height / 2) + (Math.cos((hour / -12) * (2 * Math.PI) + Math.PI) * (height - 2) / 2));
            this.chart.ctx.stroke();
        },
        drawHourLine: function(hour) {
            var hourSegmentAngle = (hour / 12) * (Math.PI * 2) + (Math.PI * 1.5);
            // Only draw hour lines on "free" times
            if (this.segments.some(function (item) { 
                return !item.isFree && hourSegmentAngle >= item.startAngle && hourSegmentAngle <= item.endAngle; 
            })) {
                return;
            }
            this.drawHourLineRaw(hour);
        },
        drawInner: function(easeDecimal) {
            // the following is taken from Chart.Pie.draw()
            var animDecimal = (easeDecimal) ? easeDecimal : 1;
			helpers.each(this.segments,function(segment,index){
				segment.transition({
					circumference : this.calculateCircumference(segment.value),
					outerRadius : this.getOuterRadius(segment),
					innerRadius : 0,
					startAngle: segment.desiredStartAngle
				},animDecimal);

                segment.startAngle += Math.PI * 1.5;
				segment.endAngle = segment.startAngle + segment.circumference;

				segment.draw();
			},this);            
        },
        draw: function(easeDecimal) {
			this.clear();
			this.drawInner(easeDecimal);

            var oldwidth = this.chart.ctx.lineWidth;
            var oldstyle = this.chart.ctx.strokeStyle;
            var oldcap = this.chart.ctx.lineCap;
            this.chart.ctx.lineWidth = this.options.hourMarkerWidth;
            this.chart.ctx.strokeStyle = this.options.hourMarkerColor;
            this.chart.ctx.lineCap = "round";
            for (var i = 0; i < 12; i++) {
                this.drawHourLine(i);
            }
            this.chart.ctx.lineWidth = this.options.currentTimeWidth;
            this.chart.ctx.strokeStyle = this.options.currentTimeColor;
            var now = moment().month(1).date(1).year(1970);
            if (now.isSame(this.beginning) || (now.isAfter(this.beginning) && now.isBefore(this.ending))) {
                this.drawHourLineRaw(moment.duration(now).asHours());
            }
            this.chart.ctx.lineWidth = oldwidth;
            this.chart.ctx.strokeStyle = oldstyle;
            this.chart.ctx.lineCap = oldcap;
            this.chart.ctx.moveTo(this.chart.ctx.canvas.width / 2, this.chart.ctx.canvas.height / 2);
        }
    });
}).call();
