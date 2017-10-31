

//-------------------------------------------------------------------------------------------
//  METRICS
//-------------------------------------------------------------------------------------------

function metrics() {

    // GET DISPLAY DIMENSIONS //
    ratio = getPixelRatio();
    width = window.innerWidth * ratio;
    height = window.innerHeight * ratio;


    // SET CANVAS DIMENSIONS //
    canvas.width  = width;
    canvas.height = height;


    // ASPECT //
    if (width > (height)) {
        device = 'desktop';
    } else {
        device = 'mobile';
    }

    if (images.length) {
        if (metricTimer) clearTimeout(metricTimer);
        metricTimer = setTimeout(function() {
            resetImg();
        },500);
    }
}


//-------------------------------------------------------------------------------------------
//  PIXEL RATIO
//-------------------------------------------------------------------------------------------

function getPixelRatio() {
    var dpr = window.devicePixelRatio || 1;
    var bsr = ctx.webkitBackingStorePixelRatio ||
        ctx.mozBackingStorePixelRatio ||
        ctx.msBackingStorePixelRatio ||
        ctx.oBackingStorePixelRatio ||
        ctx.backingStorePixelRatio || 1;
    return dpr / bsr;
}
