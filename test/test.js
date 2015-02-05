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
					test.call(suite);
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

	this.add = function(callback) {
		if (!callback.name) {
			throw new Error('All tests need to be named functions.');
		}
		this.tests.push(callback);
	}

	this.assertEquals = function(v2, v1, m) {
		this.assertions++;
		if (v1 !== v2) {
			throw new Error(m || 'Failed to assert that ' + v1 + ' equals expected ' + v2);
		}
	}

	this.assertFalse = function(v, m) {
		this.assertEquals(false, v, m);
	}

	this.assertEqualFloats = function(v2, v1, m) {
		this.assertEquals(v1.toFixed(10), v2.toFixed(10));
	}

	this.assertTrue = function(v, m) {
		this.assertEquals(true, v, m);
	}

	this.log = function(text) {
		this.output.value += text;
	}
}

var test = new Test();
test.add(function() {
	var suite = new Test.Suite('Weapon');

	suite.add(function testAmmo() {
		var weapon = new Engine.assets.Weapon();
		this.assertEquals(0, weapon.ammo.min);
		this.assertEquals(100, weapon.ammo.max);
		this.assertEquals(100, weapon.ammo.value);
		this.assertEquals(0, weapon.projectileCost);

		weapon.ammo.value = 0;
		this.assertTrue(weapon.ammo.refill(50));
		this.assertEquals(50, weapon.ammo.value);
		this.assertTrue(weapon.ammo.refill(60));
		this.assertEquals(100, weapon.ammo.value);

		this.assertTrue(weapon.ammo.reduce(90));
		this.assertEquals(10, weapon.ammo.value);
		this.assertTrue(weapon.ammo.reduce(124124));
		this.assertEquals(0, weapon.ammo.value);

		weapon.ammo.refill(100);
		this.assertEquals(100, weapon.ammo.value);
		weapon.fire();
		this.assertEquals(100, weapon.ammo.value);
		weapon.projectileCost = 25;
		this.assertTrue(weapon.fire());
		this.assertTrue(weapon.fire());
		this.assertTrue(weapon.fire());
		this.assertEquals(25, weapon.ammo.value);
		this.assertTrue(weapon.fire());
		this.assertFalse(weapon.fire());
		weapon.ammo.refill(30);
		this.assertTrue(weapon.fire());
		this.assertFalse(weapon.fire());
		this.assertEquals(5, weapon.ammo.value);
	});

	return suite;
}());

test.add(function() {
	var suite = new Test.Suite('Engine.Timeline');

	suite.add(function testInfiniteTime() {
		var anim = new Engine.Timeline();
		anim.addFrame({}, 1);
		anim.addFrame({}, 4);
		anim.addFrame({}, 2);
		this.assertEquals(3, anim.frames.length);
		this.assertEquals(7, anim.totalDuration);
		this.assertEquals(0, anim.accumulatedTime);
		var len = anim.totalDuration;

		this.assertEquals(4, anim.getLoopTime(-3));
		this.assertEquals(2, anim.getLoopTime(2));

		// Big numbers
		this.assertEquals(2, anim.getLoopTime(2 + len * -4933));
		this.assertEquals(2, anim.getLoopTime(2 + len * 6823));

		// Floats
		this.assertEqualFloats(3.8, anim.getLoopTime(-3.2));
		this.assertEqualFloats(6.3, anim.getLoopTime(6.3));
	});

	suite.add(function testFrameDig() {
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

	suite.add(function testFrameShift() {
		var anim = new Engine.Timeline();
		anim.addFrame('A', 4);
		anim.addFrame('B', 2);
		anim.addFrame('C', 3);
		this.assertEquals('A', anim.getValueAtTime(0));
		this.assertEquals('B', anim.getValueAtTime(4));
		this.assertEquals('C', anim.getValueAtTime(6));
		this.assertEquals('A', anim.getValueAtTime(9));
	});


	suite.add(function testHoldFrame() {
		var anim = new Engine.Timeline();
		anim.addFrame('A', 2);
		anim.addFrame('B', 3);
		anim.addFrame('C');
		this.assertTrue(isNaN(anim.totalDuration));
		this.assertEquals('A', anim.getValueAtTime(1));
		this.assertEquals('B', anim.getValueAtTime(4));
		this.assertEquals('C', anim.getValueAtTime(6));
		this.assertEquals('C', anim.getValueAtTime(9));
		this.assertEquals('C', anim.getValueAtTime(12515152));
	});

	return suite;
}());


test.add(function() {
	var suite = new Test.Suite('Collision');

	suite.add(function testCollision() {
		var collideMock = function(a,b,c) {
			this.args = [a,b,c]
		}

		var energyTank1 = new Engine.assets.objects.items.EnergyTank();
		var energyTank2 = new Engine.assets.objects.items.EnergyTank();
		energyTank1.collides = collideMock;
		energyTank2.collides = collideMock;

		var collision = new Engine.Collision();
		this.assertEquals(0, collision.objects.length);
		this.assertEquals(0, collision.positionCache.length);

		collision.addObject(energyTank1);
		collision.addObject(energyTank2);
		this.assertEquals(2, collision.objects.length);
		this.assertEquals(2, collision.positionCache.length);
		collision.removeObject(energyTank1);
		this.assertEquals(1, collision.objects.length);
		this.assertEquals(collision.objects[0], energyTank2);
		collision.addObject(energyTank1);
		this.assertEquals(collision.objects[0], energyTank2);
		this.assertEquals(collision.objects[1], energyTank1);

		collision.detect();
		this.assertEquals(energyTank1.args[0], energyTank2);
		this.assertEquals(energyTank2.args[0], energyTank1);
	});


	return suite;
}());

test.run(document.getElementById('log'));

