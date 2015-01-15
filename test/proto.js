//Derived.prototype = Object.create(Base.prototype); Derived.prototype.constructor = Derived; And Base.call(this, ...); in Derived.
Object.prototype.inherits = function(f)
{
  if (typeof(f) != 'function') {
    throw new Error('Not function');

  }
  this.prototype = Object.create(f.prototype);
  this.constructor = f;
}


function Animal()
{

}

function Dog()
{
  this.__proto__ = new Animal();
}

var dog = new Dog();
console.log(dog instanceof Animal);





// Shape - superclass
function Shape(name) {
  this.name = name;
  this.x = 0;
  this.y = 0;
  this.test = 1;
}

// superclass method
Shape.prototype.move = function(x, y) {
  this.x += x;
  this.y += y;
  console.log('Moving %s to %f, %f', this, this.x, this.y);
};

Shape.prototype.isSelf = function(object)
{
  console.log(object == this, object === this);
}

Shape.prototype.whereami = function() {
  console.log(this.test);
	console.info('%s is at %f, %f', this.name, this.x, this.y);
}

// Rectangle - subclass
function Rectangle(name) {
  Shape.call(this, 'Rectangle: ' + name); // call super constructor.
  this.test = 2;
  this.isSelf(1);
}

// subclass extends superclass
Rectangle.prototype = Object.create(Shape.prototype);
//Rectangle.prototype.constructor = Rectangle;
Rectangle.prototype.parent = Shape;

Rectangle.prototype.move = function (x, y)
{
    this.test++;
    //Base.prototype.methodName.call(this, ...)
    Shape.prototype.move.call(this, x*2, y*2);
};

function Square(name)
{
  Rectangle.call(this, 'Square: ' + name); // call super constructor.
}

Square.prototype = Object.create(Rectangle.prototype);
//Square.prototype.constructor = Square;


Square.prototype.move = function (x)
{
    //Base.prototype.methodName.call(this, ...)
    Rectangle.prototype.move.call(this, x, x);
};

square = new Square('A square');
square.move(5);
console.log(square);



var i;
var rects = [];
for (i=0;i<10;i++) {
	rects.push(new Rectangle(i));
}

var r;
for (i in rects) {
	r = rects[i];
	console.log("Is rect an instance of Rectangle? " + (r instanceof Rectangle)); // true
	console.log("Is rect an instance of Shape? " + (r instanceof Shape)); // true
	r.move(i*1.2,1.3*i);
	r.whereami();
}

rects[0].isSelf(rects[1]);
rects[0].isSelf(rects[0]);
