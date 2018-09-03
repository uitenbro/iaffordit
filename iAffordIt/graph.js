
function printVerticalStripChart(Array) {
    // For horizontal bar charts, x and y values must will be "flipped"
    // from their vertical bar counterpart.
    // Array is an array of JSON objects {date:logDate.toISOString(), balance:newBalance}
    //var Array1 = [[-200.00,"5/3/17"], [-400.00,"5/4/17"], [600,"5/5/17"], [300,"5/6/17"],[700,"5/7/17"],[700,"5/8/17"]];
    //var Array2 =       [[-200.00,"5/9/17"], [-400.00,"5/10/17"], [600,"5/11/17"], [300,"5/12/17"],[700,"5/13/17"],[700,"5/14/17"]];
    //console.log(Array, labels);
    
    inputArray = Array.reverse();
    var dataArray = [];
    var labelsArray = [];
    //var green = [];
    var black = [];
    //var orange = [];
    //var red = [];
    //var purple = [];

    Xmean = 0
    Ymean = 0
    xMinusX = 0
    yMinusY = 0
    sumxXyY = 0
    sumxXsquared = 0
    prevDate = new Date(inputArray[0].date)
    prevDayNumber = 0
    dayNumber = 0
    dayNumberSum = 0
    dayNumberAvg = 0
    balanceSum = 0
    balanceAvg = 0

    // Calculate the mean X and mean Y
    for (var i=0; i<inputArray.length; i++) {
        var date = new Date(inputArray[i].date);
        // Day number is the x coordinate in days calculated from the date
        dayNumber = prevDayNumber + Math.round((prevDate-date)/(1000*60*60*24));
        dayNumberSum += dayNumber
        prevDate = date
        prevDayNumber = dayNumber
        console.log(dayNumber,inputArray[i].balance)
        balanceSum += inputArray[i].balance
    }
    Xmean = dayNumberSum/i
    Ymean = balanceSum/i
    console.log(Xmean, Ymean, i)

    // Reset day number data
    dayNumberSum = 0
    prevDate = new Date(inputArray[0].date)
    prevDayNumber = 0
    dayNumber = 0

    for (var i=0; i<inputArray.length; i++) {
        var date = new Date(inputArray[i].date);
        var dateString = date.toISOString().split('T')[0];
        dateString = dateString.split('-');
        var printDate = dateString[1]+'-'+dateString[2]+'-'+dateString[0];
        var printDateLabel = dateString[1]+'/'+dateString[2]
        dataArray[i] = [inputArray[i].balance, printDate];
        labelsArray[i] = printDateLabel + ', ' + inputArray[i].balance.toFixed(2);

        //green[i] = [2000,dataArray[i][1]];
        //orange[i] = [1000,dataArray[i][1]];
        black[i] = [0,dataArray[i][1]]; // zero axis
        //red[i] = [-1000,dataArray[i][1]];
        //purple[i] = [-2000,dataArray[i][1]];

        // Day number is the x coordinate in days calculated from the date
        dayNumber = prevDayNumber + Math.round((prevDate-date)/(1000*60*60*24));
        x = dayNumber
        y = inputArray[i].balance

        // Trendline algorithm from https://www.varsitytutors.com/hotmath/hotmath_help/topics/line-of-best-fit
        xMinusX = x - Xmean
        yMinusY = y - Ymean
        sumxXyY += xMinusX*yMinusY
        sumxXsquared += xMinusX*xMinusX

        // Setup for next iteration
        prevDate = date
        prevDayNumber = dayNumber

    }
    // Slope of the trendline in dollars per day
    slope = (sumxXyY)/(sumxXsquared)
    console.log(sumxXyY, sumxXsquared, slope) 
    trendDollarsPerWeek = -7*slope
   
    var minHeight = 40 + (20 * dataArray.length)

    //console.log(dataArray);

    var forecastPlot = $.jqplot('chartdiv', [black, dataArray], {
        height: minHeight,
        title: "<span style='font-size: 14px;'>Trend $" + trendDollarsPerWeek.toFixed(2) + " per week</span>",
        seriesColors: [
            "black",  
            "#0099FF"],
        seriesDefaults: {
            // tell the chart it is oriented horizontally.
            rendererOptions: {
                 barDirection: 'horizontal',
            },
            // default to not showing dots at the points
            showMarker: false, 
            // default series to x2axis 
            xaxis: 'x2axis',
        },
        series: [
            {},
            {
                showMarker: true,
                pointLabels: {labels: labelsArray, show: true, location: 'se', edgeTolerance: 0 },
            }
        ],
        axes: {
            // Use x2axis to put the labels on top
            x2axis: {
                show: true,
                tickOptions: {
                    formatString: "$%'d", 
                    angle: -40
                },
                rendererOptions:{
                   tickRenderer:$.jqplot.CanvasAxisTickRenderer
                },
            },
            yaxis: {
                renderer: $.jqplot.CategoryAxisRenderer,
                tickOptions: {
                    angle: -40,
                    show: true,
                }, 
                rendererOptions: {
                    tickRenderer:$.jqplot.CanvasAxisTickRenderer,
                },              
            },
        },
    });

    //console.log(forecastPlot);
    return slope;
}
