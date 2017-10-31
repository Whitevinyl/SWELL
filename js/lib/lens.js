
//-------------------------------------------------------------------------------------------
//  SETUP
//-------------------------------------------------------------------------------------------

function Lens() {

    this.defaultColors();

    this.alpha = 0.15;
    this.foreground = true;
    this.xScale = 1;
    this.yScale = 1;
    this.scale(1);

    this.ctx = null;
    this.zero = new Vector(0, 0);
    this.restore();
    this.beginPath();
}
var proto = Lens.prototype;


//-------------------------------------------------------------------------------------------
//  COLORS
//-------------------------------------------------------------------------------------------

proto.addColor = function(color, x, y) {
    this.colors.push( new ColorLayer(color, x, y) );
};

proto.clear = function() {
    this.colors = [];
};

proto.defaultColors = function() {
    this.clear();
    this.addColor('#0000ff', -10, -5);
    this.addColor('#ff0088', 10, 5);
    /*this.addColor('#990099', 0, 8);
    this.addColor('#119944', 0, 45);*/
    /*this.addColor('#ff3300', 0, 15);*/
    /*this.addColor('#0000ff', 0, 30);*/
};


//-------------------------------------------------------------------------------------------
//  MODIFIERS
//-------------------------------------------------------------------------------------------

proto.scale = function(m, additive) {
    if (additive) {
        this.xScale += m;
        this.yScale += m;
    }
    else {
        this.xScale = m;
        this.yScale = m;
    }


    this.xScale = valueInRange(this.xScale, 0, 1);
    this.yScale = valueInRange(this.yScale, 0, 1);

    var l = this.colors.length;
    for (var i=0; i<l; i++) {
        var col = this.colors[i];
        col.scaleVector.x = col.vector.x * this.xScale;
        col.scaleVector.y = col.vector.y * this.yScale;
    }
};

proto.scaleX = function(m, additive) {
    if (additive) {
        this.xScale += m;
    }
    else {
        this.xScale = m;
    }

    this.xScale = valueInRange(this.xScale, 0, 1);

    var l = this.colors.length;
    for (var i=0; i<l; i++) {
        var col = this.colors[i];
        col.scaleVector.x = col.vector.x * this.xScale;
    }
};

proto.scaleY = function(m, additive) {
    if (additive) {
        this.yScale += m;
    }
    else {
        this.yScale = m;
    }

    this.yScale = valueInRange(this.yScale, 0, 1);

    var l = this.colors.length;
    for (var i=0; i<l; i++) {
        var col = this.colors[i];
        col.scaleVector.y = col.vector.y * this.yScale;
    }
};

//-------------------------------------------------------------------------------------------
//  DRAWING PATHS
//-------------------------------------------------------------------------------------------

// BEGIN PATH //
proto.beginPath = function() {
    // empty drawing path //
    this.path = [];
    // store memory of ctx color/alpha //
    if (this.ctx) {
        this.fillStyle = this.ctx.fillStyle;
        this.strokeStyle = this.ctx.strokeStyle;
        this.ctxAlpha = this.ctx.globalAlpha;
    }
    else {
        this.fillStyle = null;
        this.strokeStyle = null;
        this.ctxAlpha = 1;
    }

};

// MOVE TO //
proto.moveTo = function(x, y) {
    // add instruction to our path //
    this.path.push( new LinePoint('move', x, y));
};

// LINE TO //
proto.lineTo = function(x, y) {
    // add instruction to our path //
    this.path.push( new LinePoint('line', x, y));
};

// CLOSE PATH //
proto.closePath = function() {
    // add instruction to our path //
    this.path.push( new LinePoint('close', 0, 0));
};

// ARC //
proto.arc = function(x, y, rad, start, end, direction) {
    // add instruction to our path //
    var p = new LinePoint('arc', x, y);
    p.rad = rad;
    p.start = start;
    p.end = end;
    p.direction = direction || false;
    this.path.push( p );
};

// FILL //
proto.fill = function() {
    // colors //
    if ((this.xScale + this.yScale) > 0) {
        // loop through each color and draw path with vector offset //
        var l = this.colors.length;
        this.ctx.globalAlpha = this.alpha * this.ctxAlpha;
        for (var i=0; i<l; i++) {
            this.ctx.fillStyle = this.colors[i].color;
            this._drawPath(this.colors[i].scaleVector);
            this.ctx.fill();
        }
    }

    // foreground //
    this.ctx.fillStyle = this.fillStyle;
    this.ctx.globalAlpha = this.ctxAlpha;
    if (this.foreground) {
        this._drawPath(this.zero);
        this.ctx.fill();
    }
};

// STROKE //
proto.stroke = function() {
    // colors //
    if ((this.xScale + this.yScale) > 0) {
        // loop through each color and draw path with vector offset //
        var l = this.colors.length;
        this.ctx.globalAlpha = this.alpha * this.ctxAlpha;
        for (var i=0; i<l; i++) {
            this.ctx.strokeStyle = this.colors[i].color;
            this._drawPath(this.colors[i].scaleVector);
            this.ctx.stroke();
        }
    }

    // foreground //
    this.ctx.strokeStyle = this.strokeStyle;
    this.ctx.globalAlpha = this.ctxAlpha;
    if (this.foreground) {
        this._drawPath(this.zero);
        this.ctx.stroke();
    }
};


//-------------------------------------------------------------------------------------------
//  DRAWING RECTS
//-------------------------------------------------------------------------------------------

// FILL RECT //
proto.fillRect = function(x, y, w, h) {
    this.beginPath();
    this.moveTo(x, y);
    this.lineTo(x + w, y);
    this.lineTo(x + w, y + h);
    this.lineTo(x, y + h);
    this.closePath();
    this.fill();
};

// STROKE RECT //
proto.strokeRect = function(x, y, w, h) {
    this.beginPath();
    this.moveTo(x, y);
    this.lineTo(x + w, y);
    this.lineTo(x + w, y + h);
    this.lineTo(x, y + h);
    this.closePath();
    this.stroke();
};


//-------------------------------------------------------------------------------------------
//  DRAWING TEXT
//-------------------------------------------------------------------------------------------

// FILL TEXT //
proto.fillText = function(string, x, y) {
    this.beginPath();
    var point = new LinePoint('move', x, y);
    if (this.translation.x !== 0 || this.translation.y !== 0 || this.rotation !== 0) {
        point = this._translatePoint(point);
    }

    // colors //
    if ((this.xScale + this.yScale) > 0) {
        // loop through each color and draw text with vector offset //
        var l = this.colors.length;
        this.ctx.globalAlpha = this.alpha * this.ctxAlpha;
        for (var i=0; i<l; i++) {
            this.ctx.fillStyle = this.colors[i].color;
            this.ctx.fillText(string, point.x + this.colors[i].scaleVector.x, point.y + this.colors[i].scaleVector.y);
        }
    }

    // foreground //
    this.ctx.fillStyle = this.fillStyle;
    this.ctx.globalAlpha = this.ctxAlpha;
    if (this.foreground) {
        this.ctx.fillText(string, point.x, point.y);
    }
};

// STROKE TEXT //
proto.strokeText = function(string, x, y) {
    this.beginPath();
    var point = new LinePoint('move', x, y);
    if (this.translation.x !== 0 || this.translation.y !== 0 || this.rotation !== 0) {
        point = this._translatePoint(point);
    }

    // colors //
    if ((this.xScale + this.yScale) > 0) {
        // loop through each color and draw text with vector offset //
        var l = this.colors.length;
        this.ctx.globalAlpha = this.alpha * this.ctxAlpha;
        for (var i=0; i<l; i++) {
            this.ctx.strokeStyle = this.colors[i].color;
            this.ctx.strokeText(string, point.x + this.colors[i].scaleVector.x, point.y + this.colors[i].scaleVector.y);
        }
    }

    // foreground //
    this.ctx.strokeStyle = this.strokeStyle;
    this.ctx.globalAlpha = this.ctxAlpha;
    if (this.foreground) {
        this.ctx.strokeText(string, point.x, point.y);
    }
};


//-------------------------------------------------------------------------------------------
//  TRANSFORMS
//-------------------------------------------------------------------------------------------

proto.save = function() {
    this.savedTranslation = this.translation.clone();
    this.savedRotation = this.rotation;
    this.savedCos = this.cos;
    this.savedSin = this.sin;
};

proto.restore = function() {
    if (this.translation) { // restore from previous save
        this.translation = this.savedTranslation;
        this.rotation = this.savedRotation;
        this.cos = this.savedCos;
        this.sin = this.savedSin;
    }
    else { // never previously saved, so create new translations
        this.translation = new Vector(0, 0);
        this.rotation = 0;
        this.cos = Math.cos(this.rotation);
        this.sin = Math.sin(this.rotation);
    }

};

proto.translate = function(x, y) {
    this.translation.x += x;
    this.translation.y += y;
};

proto.rotate = function(angle) {
    this.rotation -= angle;
    this.cos = Math.cos(this.rotation);
    this.sin = Math.sin(this.rotation);
};


//-------------------------------------------------------------------------------------------
//  PRIVATE METHODS
//-------------------------------------------------------------------------------------------

proto._drawPath = function(vector) {
    // loop through path instructions list //
    this.ctx.beginPath();
    var l = this.path.length;
    for (var i=0; i<l; i++) {
        this._drawTo(this.path[i], vector);
    }
};

proto._drawTo = function(point,vector) {

    // if translation //
    if (this.translation.x !== 0 || this.translation.y !== 0 || this.rotation !== 0) {
        point = this._translatePoint(point);
    }

    // perform drawing action based on instruction //
    switch (point.type) {
        case 'close':
        this.ctx.closePath();
        break;

        case 'line':
        this.ctx.lineTo(point.x + vector.x, point.y + vector.y);
        break;

        case 'arc':
        this.ctx.arc(point.x + vector.x, point.y + vector.y, point.rad, point.start + this.rotation, point.end + this.rotation, point.direction);
        break;

        case 'move':
        default:
        this.ctx.moveTo(point.x + vector.x, point.y + vector.y);
        break;
    }
};

// return point with translation & rotation added //
proto._translatePoint = function(point) {
    var x = (this.cos * (point.x)) + (this.sin * (point.y)) + this.translation.x;
    var y = (this.cos * (point.y)) - (this.sin * (point.x)) + this.translation.y;
    return new LinePoint(point.type, x, y);
};


//-------------------------------------------------------------------------------------------
//  POST PROCESSING
//-------------------------------------------------------------------------------------------

// OFFSET // expensive! //
proto.processOffset = function(canvas, offsets, scale, spacing, thickness, alpha) {
    var i = 0;
    var l = offsets.length;

    // get ctx data //
    var _ctx = canvas.getContext('2d');
    var _width = canvas.width;
    var _height = canvas.height;
    _ctx.globalAlpha = alpha;

    // loop through rows of pixels & calculate/draw offset //
    for (var y=0; y<_height; y+=spacing) {

        var offset = Math.round(offsets[i] * scale);
        if (offset >= 1) {
            _ctx.drawImage(canvas, 0, y, _width - offset, thickness, offset, y, _width - offset, thickness);
        }

        // cycle offset index //
        i++;
        if (i >= l) i = 0;
    }
    _ctx.globalAlpha = 1;
};

// SWEEP //
proto.processSweep = function(canvas, scale, intensity, thickness, alpha) {

    if (!this.xSweep) { // first time //
        this.ySweep = Math.random();
        this.xSweep = Math.random();
    }

    // get ctx data //
    var _ctx = canvas.getContext('2d');
    var _width = canvas.width;
    var _height = canvas.height;
    _ctx.globalAlpha = alpha;

    // randomise sweep //
    intensity /= 10;
    this.xSweep += (-intensity + (Math.random() * (intensity * 2)));
    this.ySweep += (-intensity + (Math.random() * (intensity * 2)));
    this.xSweep = valueInRange(this.xSweep, 0, 1);
    this.ySweep = valueInRange(this.ySweep, 0, 1);
    var y = Math.round(_height * this.ySweep);
    var offset = Math.round(this.xSweep * scale);

    // draw //
    if (offset >= 1) {
        _ctx.drawImage(canvas, 0, y, _width - offset, thickness, offset, y, _width - offset, thickness);
    }
    _ctx.globalAlpha = 1;
};


// SCREEN TEAR //
proto.processTear = function(canvas, scale, intensity, alpha) {

    if (!this.xTear) { // first time //
        this.yTear = Math.random();
        this.xTear = Math.random();
        this.offTear = Math.random();
    }

    // get ctx data //
    var _ctx = canvas.getContext('2d');
    var _width = canvas.width;
    var _height = canvas.height;
    _ctx.globalAlpha = alpha;

    // randomise tear //
    intensity /= 10;
    this.xTear += (-intensity + (Math.random() * (intensity * 2)));
    this.yTear += (-intensity + (Math.random() * (intensity * 2)));
    this.offTear += (-intensity + (Math.random() * (intensity * 2)));
    this.xTear = valueInRange(this.xTear, 0, 1);
    this.yTear = valueInRange(this.yTear, 0, 1);
    this.offTear = valueInRange(this.yTear, 0, 1);
    var y = Math.round(_height * this.yTear);
    var stretch = Math.round(this.xTear * scale);
    var offset = Math.round(this.offTear * scale);

    // draw //
    _ctx.drawImage(canvas, offset, 0, _width - stretch - offset, y, 0, 0, _width, y);

    _ctx.globalAlpha = 1;
};


// JITTER //
proto.processJitter = function(canvas, xScale, yScale, intensity, alpha) {

    if (!this.xJitter) { // first time //
        this.xJitter = -1 + (Math.random() * 2);
        this.yJitter = -1 + (Math.random() * 2);
    }

    // get ctx data //
    var _ctx = canvas.getContext('2d');
    var _width = canvas.width;
    var _height = canvas.height;
    _ctx.globalAlpha = alpha;

    // randomise jitter //
    intensity /= 10;
    this.xJitter += (-intensity + (Math.random() * (intensity * 2)));
    this.yJitter += (-intensity + (Math.random() * (intensity * 2)));
    this.xJitter = valueInRange(this.xJitter, -1, 1);
    this.yJitter = valueInRange(this.yJitter, -1, 1);
    var xOff = Math.round(this.xJitter * xScale);
    var yOff = Math.round(this.yJitter * yScale);

    // draw //
    _ctx.drawImage(canvas, xOff, yOff, _width, _height, 0, 0, _width, _height);

    // borders //
    _ctx.fillStyle = '#000000';
    if (this.xJitter < 0) _ctx.fillRect(0, 0, -xOff, _height);
    if (this.xJitter > 0) _ctx.fillRect(_width - xOff, 0, xOff, _height);
    if (this.yJitter < 0) _ctx.fillRect(0, 0, _width, -yOff);
    if (this.yJitter > 0) _ctx.fillRect(0, _height - yOff, _width, yOff);

    _ctx.globalAlpha = 1;
};


// DELAY //
proto.processDelay = function(canvas, delayTime, feedback, alpha) {

    if (!this.delayBuffer) { // first time //
        this.delayBuffer = [];
    }

    // get ctx data //
    var _ctx = canvas.getContext('2d');
    var _width = canvas.width;
    var _height = canvas.height;
    _ctx.globalAlpha = alpha;

    // cap buffer length //
    while (this.delayBuffer.length >= delayTime) {
        var delay = this.delayBuffer.shift();
    }

    // feedback //
    if (delay) {

        // create temp canvas //
        var scratch = document.createElement('canvas');
        scratch.width = _width;
        scratch.height = _height;
        var scratchCtx = scratch.getContext('2d');
        scratchCtx.putImageData(delay, 0, 0);

        // draw feeback //
        _ctx.globalAlpha = alpha * feedback;
        _ctx.drawImage(scratch, 0, 0);
    }

    // get current screen & add to buffer //
    this.delayBuffer.push( _ctx.getImageData(0, 0, _width, _height) );



    // draw delayed image //
    if (delay) {
        _ctx.globalAlpha = alpha;
        _ctx.drawImage(scratch, 0, 0);

        // remove temp canvas //
        scratch.remove();
    }

    _ctx.globalAlpha = 1;
};


//-------------------------------------------------------------------------------------------
//  LINE POINT OBJECT
//-------------------------------------------------------------------------------------------

function LinePoint(type, x, y) {
    this.type = type;
    this.x = x;
    this.y = y;
}

//-------------------------------------------------------------------------------------------
//  COLOR OBJECT
//-------------------------------------------------------------------------------------------

function ColorLayer(color, x, y) {
    this.color = color;
    this.vector = new Vector(x, y);
    this.scaleVector = new Vector(x, y);
    this.alpha = 1;
}

//-------------------------------------------------------------------------------------------
//  UTILS
//-------------------------------------------------------------------------------------------

// LOCK A VALUE WITHIN GIVEN RANGE //
function valueInRange(value,floor,ceiling) {
    if (value < floor) {
        value = floor;
    }
    if (value> ceiling) {
        value = ceiling;
    }
    return value;
}

function Vector( x, y ) {
    this.x = x || 0;
    this.y = y || 0;
}
Vector.prototype.clone = function() {
    return new Vector(this.x,this.y);
};
Vector.prototype.magnitude = function() {
    return Math.sqrt((this.x*this.x) + (this.y*this.y));
};

Vector.prototype.normalise = function() {
    var m = this.magnitude();
    if (m>0) {
        this.x /= m;
        this.y /= m;
    }
};


var lens = new Lens();
