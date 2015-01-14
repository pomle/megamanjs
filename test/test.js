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
var suite = new Test.Suite('Engine.UVAnimator');
suite.add('testInfiniteTime', function() {

	var anim = new Engine.UVAnimator(new THREE.Geometry());
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
	var anim = new Engine.UVAnimator(new THREE.Geometry());
	anim.addFrame('A', 4);
	anim.addFrame('B', 2);
	anim.addFrame('C', 3);
	this.assertEquals('A', anim.getFrameAtTime(0).uvMap);
	this.assertEquals('A', anim.getFrameAtTime(3).uvMap);
	this.assertEquals('B', anim.getFrameAtTime(4).uvMap);
	this.assertEquals('C', anim.getFrameAtTime(8.999).uvMap);
});

test.add(suite);

test.run(document.getElementById('log'));
