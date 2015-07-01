var ObjectManipulator = function()
{
    this.quantizer = 1;
    this.multiplier = 1;
    this.selectedObject = undefined;

    this.undo = [];
}

ObjectManipulator.prototype.nudge = function(x, y)
{
    var pos = this.pos();
    this.move(pos.x + x, pos.y + y);
}

ObjectManipulator.prototype.nudgeSize = function(w, h)
{
    var size = this.size();
    this.resize(size.w + w, size.h + h);
}

ObjectManipulator.prototype.move = function(x, y)
{
    x = this.quantize(x);
    y = this.quantize(y);
    this.selectedObject.style.left = x + 'px';
    this.selectedObject.style.top = y + 'px';
}

ObjectManipulator.prototype.pos = function()
{
    return {
        x: parseFloat(this.selectedObject.style.left) || 0,
        y: parseFloat(this.selectedObject.style.top) || 0,
    };
}

ObjectManipulator.prototype.quantize = function(value)
{
    var rest = (value % this.quantizer);
    value -= rest;
    if (rest > this.quantizer / 2) {
        value += this.quantizer;
    }
    return value;
}

ObjectManipulator.prototype.remove = function()
{
    this.undo.push(this.selectedObject);
    this.selectedObject.parentNode.removeChild(this.selectedObject);
}

ObjectManipulator.prototype.resize = function(w, h)
{
    w = this.quantize(w);
    h = this.quantize(h);
    this.selectedObject.style.width = w + 'px';
    this.selectedObject.style.height = h + 'px';
}

ObjectManipulator.prototype.select = function(object)
{
    $(this.selectedObject).removeClass('selected');
    this.selectedObject = object.addClass('selected').get(0);
}

ObjectManipulator.prototype.size = function()
{
    return {
        w: parseFloat(this.selectedObject.style.width),
        h: parseFloat(this.selectedObject.style.height),
    };
}
