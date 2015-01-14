var Test = function()
{
	this.suites = [];

	this.add = function(suite) {
		this.suites.push(suite);
	}

	this.run = function(log) {
		var i, j;
		for (i in this.suites) {
			var suite = this.suites[i];
			suite.output = log;
			for (j in suite.tests) {
				var test = suite.tests[j];
				try {
					log.value += '.';
					test.callback.call(suite);
				} catch (e) {
					log.value += "\n" + suite.name + ':' + test.name + ' failed: ' + e.message + "\n";
					throw e;
				}
			}
		}
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

	this.assertEquals = function(v1, v2, m) {
		this.assertions += 1;
		if (v1 !== v2) {
			throw new Error('Failed to assert that ' + v1 + ' equals ' + v2);
		}
	}

	this.log = function(text) {
		this.output.value += text;
	}

}

var test = new Test();
var suite = new Test.Suite('Engine.UVAnimator');
suite.add('testFrames', function() {
	var anim = new Engine.UVAnimator(new THREE.Geometry());
	anim.addFrame({}, 1);
	anim.addFrame({}, 4);
	anim.addFrame({}, 2);
	this.assertEquals(3, anim.frames.length);
	this.assertEquals(7, anim.totalDuration);
	this.assertEquals(0, anim.accumulatedTime);
	this.assertEquals(0, anim.infiniteTime);
	var len = anim.totalDuration;

	anim.timeShift(5);
	this.assertEquals(5, anim.infiniteTime);
	anim.timeShift(5);
	this.assertEquals(3, anim.infiniteTime);

	anim.timeShift(len * -4933);
	this.assertEquals(3, anim.infiniteTime);
	anim.timeShift(len * 6823);
	this.assertEquals(3, anim.infiniteTime);
	anim.timeShift((len * 6823) + 2);
	this.assertEquals(5, anim.infiniteTime);

});

test.add(suite);

test.run(document.getElementById('log'));
