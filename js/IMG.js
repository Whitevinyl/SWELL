
//-------------------------------------------------------------------------------------------
//  INITIALISE
//-------------------------------------------------------------------------------------------


function Img(ctx, x, y, s, src, callback) {

    this.ctx = ctx;
    this.position = new Point(x, y);
    this.img = new Image();
    var me = this;
    this.img.onload = function() {
        me._begin(s);
    };
    this.img.src = src;

    this.rows = 0;
    this.quality = 1;
    this._linked = false;


    this.index1 = 100;
    this.index2 = 200;
    this.index3 = 300;

    this.index4 = 400;
    this.yIndex = 500;
    this.linkOff = 0;

    // displacement distances //
    this.range = 350;
    this.offsetRange = 500;
    this.yRange = 10;

    this.rowOffset = [];
    this.rowOffsetDest = [];
    this.rowOffsetY = [];
    this.rowOffsetYDest = [];
    this.rowWidth = [];

    this.noise = new SimplexNoise();

    this.callback = callback;
}

Img.prototype._begin = function(s) {
    var m = s / this.img.width;
    this.width = this.img.width * m;
    this.height = this.img.height * m;

    this.rows = Math.min(800, this.height / this.quality);
    this.rowHeight = Math.ceil(this.height / this.rows);

    var dv = 6;
    for (var i=0; i<this.rows; i++) {
        var n = tombola.range(-this.offsetRange/dv, this.offsetRange/dv);
        if (tombola.percent(10)) n = tombola.range(-this.offsetRange, this.offsetRange);
        this.rowOffset.push( n );
        this.rowOffsetDest.push( n );
        this.rowOffsetY.push( 0 );
        this.rowOffsetYDest.push( 0 );
        this.rowWidth.push( 1 );
    }

    this.peaking = tombola.percent(5);
    this.peak = tombola.rangeFloat(0, this.rows);
    this.peakOffset = tombola.range(-100, 100);

    if (this._linked) this.link(this._linked); // this won't work if master img hasn't loaded
    if (this.callback) this.callback();
};

//-------------------------------------------------------------------------------------------
//  LINK
//-------------------------------------------------------------------------------------------

Img.prototype.link = function(master) {
    this.noise = master.noise;
    this.linkOff = ((this.position.y + (this.height/2)) - (master.position.y) + (master.height/2)) / this.quality;
    this._linked = master;
};

//-------------------------------------------------------------------------------------------
//  UPDATE
//-------------------------------------------------------------------------------------------

// we calculate displacement for each row //
Img.prototype.update = function() {

    var i, n, ind;

    var indM = 0.75;
    var scaleM = 1.9;
    var rh = this.rowHeight / ratio;
    var dv = (250 * scaleM) / rh;
    var dv2 = (40 * scaleM) / rh;

    this.yIndex += (0.002 * indM);
    this.index1 += (0.002 * indM);
    this.index2 += (0.005 * indM);
    this.index3 += (0.003 * indM);
    this.index4 = (7 * indM * this.noise.noise(10000, this.yIndex));

    for (i=0; i<this.rows; i++) {
        ind = i + this.linkOff;
        var id = ind/dv;
        var ind1 = this.index1 + (ind/((350 * scaleM) / rh));
        var ind2 = this.index2 + (ind/((250 * scaleM) / rh));
        var ind3 = this.index3 + (ind/((450 * scaleM) / rh));

        // horizontal //
        n = this.noise.noise((ind1/2), ind1) * this.noise.noise(ind2, (ind2/2)) * this.noise.noise(10000 + (ind3/3), ind3);
        n = (this.noise.noise(ind1, ind1) + this.noise.noise(ind2, ind2)) / 2;
        this.rowOffsetDest[i] = n * this.range;

        // vertical //
        n = this.noise.noise(this.index4 + (ind/dv2), 10000);
        this.rowOffsetYDest[i] = n * this.yRange;

        // width //
        n = 1 + (this.noise.noise(10000 + ind3, ind3) * 0.16);
        this.rowWidth[i] = n;

        // peak //
        if (this.peaking && i === Math.round(this.peak)) this.rowOffsetDest[i] += this.peakOffset;

        // spike //
        if (tombola.chance(1,150000)) {
            this.rowOffsetDest[i] += tombola.range(-this.offsetRange, this.offsetRange);
            this.rowOffset[i] = this.rowOffsetDest[i];
        }

        this.rowOffset[i] = lerp(this.rowOffset[i], this.rowOffsetDest[i], 5);
        this.rowOffsetY[i] = lerp(this.rowOffsetY[i], this.rowOffsetYDest[i], 5);
    }

    // move peak //
    if (this.peaking) {
        this.peak += tombola.rangeFloat(-1, 1);
        this.peakOffset += tombola.range(-5, 5);
        this.peak = constrain(this.peak, 0, this.rows);
        this.peakOffset = constrain(this.peakOffset, -this.offsetRange, this.offsetRange);
    }

};



//-------------------------------------------------------------------------------------------
//  DRAW
//-------------------------------------------------------------------------------------------


Img.prototype.draw = function() {

    if (this.img) {
        var i, l;
        var ctx = this.ctx;
        var x = this.position.x;
        var y = this.position.y - (this.height / 2);
        var rx = Math.round(x);
        var ry = Math.round(y);

        // DRAW EACH ROW //
        for (i=0; i<this.rows; i++) {

            var w = this.width * this.rowWidth[i];
            var hw = w/2;
            var bx = rx + this.rowOffset[i] - hw;
            var by = ry + (this.rowHeight * i);



            ctx.save();
            ctx.beginPath();
            ctx.moveTo(bx, by);
            ctx.lineTo(bx + w, by);
            ctx.lineTo(bx + w, by + this.rowHeight);
            ctx.lineTo(bx, by + this.rowHeight);
            ctx.closePath();
            ctx.clip();

            ctx.drawImage(this.img, x + this.rowOffset[i] - hw, y + this.rowOffsetY[i], w, this.height);

            ctx.restore();
        }
    }

    //ctx.drawImage(this.img, x + this.rowOffset[0], y, this.width, this.height);
};
