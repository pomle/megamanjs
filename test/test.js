var Test = function()
{
	this.suites = [];

	this.add = function(suite) {
		this.suites.push(suite);
	}

	this.run = function(log) {
		var i, j;
		var tests = 0;
		var assertions = 0;
		for (i in this.suites) {
			var suite = this.suites[i];
			suite.output = log;
			suite.assertions = 0;
			for (j in suite.tests) {
				var test = suite.tests[j];
				try {
					log.value += '.';
					test.callback.call(suite);
					tests++;
				} catch (e) {
					log.value += "\n" + suite.name + ':' + test.name + ' failed: ' + e.stack + "\n";
				}
			}
			assertions += suite.assertions;
		}
		log.value += "\n" + tests + ' tests, ' + assertions + ' assertions ' + "\n";
	}
}

Test.Suite = function(name)
{
	this.name = name;
	this.tests = [];

	this.add = function(name, callback) {
		this.tests.push({
			'name': name,
			'callback': callback
		});
	}

	this.assertEquals = function(v2, v1, m) {
		this.assertions++;
		if (v1 !== v2) {
			throw new Error('Failed to assert that ' + v1 + ' equals expected ' + v2);
		}
	}

	this.assertEqualFloats = function(v2, v1, m) {
		this.assertions++;
		if (v1.toFixed(10) !== v2.toFixed(10)) {
			throw new Error('Failed to assert that ' + v1 + ' float close to ' + v2);
		}
	}

	this.log = function(text) {
		this.output.value += text;
	}
}

var test = new Test();
var suite = new Test.Suite('Engine.Timeline');
suite.add('testInfiniteTime', function() {

	var anim = new Engine.Timeline();
	anim.addFrame({}, 1);
	anim.addFrame({}, 4);
	anim.addFrame({}, 2);
	this.assertEquals(3, anim.frames.length);
	this.assertEquals(7, anim.totalDuration);
	this.assertEquals(0, anim.accumulatedTime);
	this.assertEquals(0, anim.infiniteTime);
	var len = anim.totalDuration;

	anim.timeShift(-3);
	this.assertEquals(4, anim.infiniteTime);
	anim.timeShift(5);
	this.assertEquals(2, anim.infiniteTime);

	// Big numbers
	anim.timeShift(len * -4933);
	this.assertEquals(2, anim.infiniteTime);
	anim.timeShift(len * 6823);
	this.assertEquals(2, anim.infiniteTime);
	anim.timeShift((len * 6823) + 2);
	this.assertEquals(4, anim.infiniteTime);
	anim.timeShift(-4);
	this.assertEquals(0, anim.infiniteTime);

	// Floats
	anim.timeShift(-3.2);
	this.assertEqualFloats(3.8, anim.infiniteTime);
	anim.timeShift(9.5);
	this.assertEqualFloats(6.3, anim.infiniteTime);
	anim.timeShift(-6.3);
	this.assertEqualFloats(0, anim.infiniteTime);
});

suite.add('testFrameDig', function() {
	var anim = new Engine.Timeline();
	anim.addFrame('A', 4);
	anim.addFrame('B', 2);
	anim.addFrame('C', 3);
	this.assertEquals(0, anim.getIndexAtTime(0));
	this.assertEquals('A', anim.getValueAtTime(0));
	this.assertEquals(0, anim.getIndexAtTime(3));
	this.assertEquals('A', anim.getValueAtTime(3));
	this.assertEquals(1, anim.getIndexAtTime(4));
	this.assertEquals('B', anim.getValueAtTime(4));
	this.assertEquals(2, anim.getIndexAtTime(8.999));
	this.assertEquals('C', anim.getValueAtTime(8.999));

	anim.timeShift(2);
	this.assertEquals(0, anim.getIndex());
	this.assertEquals('A', anim.getValue());
	anim.timeShift(1);
	this.assertEquals(0, anim.getIndex());
	this.assertEquals('A', anim.getValue());
	anim.timeShift(1);
	this.assertEquals(1, anim.getIndex());
	this.assertEquals('B', anim.getValue());
	anim.timeShift(4.999);
	this.assertEquals(2, anim.getIndex());
	this.assertEquals('C', anim.getValue());
});

suite.add('testFrameShift', function() {
	var anim = new Engine.Timeline();
	anim.addFrame('A', 4);
	anim.addFrame('B', 2);
	anim.addFrame('C', 3);
	this.assertEquals('A', anim.getValue());
	this.assertEquals(0, anim.infiniteTime);
	anim.frameShift(1);
	this.assertEquals('B', anim.getValue());
	this.assertEquals(4, anim.infiniteTime);
	anim.frameShift(1);
	this.assertEquals('C', anim.getValue());
	this.assertEquals(6, anim.infiniteTime);
	anim.frameShift(1);
	this.assertEquals('A', anim.getValue());
	this.assertEquals(0, anim.infiniteTime);
});

test.add(suite);

test.run(document.getElementById('log'));
