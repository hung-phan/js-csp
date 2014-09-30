var assert = require("chai").assert;
var a = require("../src/csp.test-helpers"),
    it = a.it,
    before = a.before,
    afterEach = a.afterEach,
    beforeEach = a.beforeEach;

var csp = require("../src/csp"),
    chan = csp.chan,
    go = csp.go,
    put = csp.put,
    take = csp.take,
    CLOSED = csp.CLOSED;

var t = require("transducers.js");

function map(f) {
  return function(r) {
    return function(result, input) {
      if (arguments.length === 2) {
        return r(result, f(input));
      } else {
        return result;
      }
    };
  };
}

function filter(f) {
  return function(r) {
    return function(result, input) {
      if (arguments.length === 2) {
        if (f(input)) {
          return r(result, input);
        } else {
          return result;
        }
      } else {
        return result;
      }
    };
  };
}

function inc(x) {
  return x + 1;
}

function even(x) {
  return x % 2 === 0;
}

describe("Transducers", function() {
  describe("map (normal reduction)", function() {
    it("should work without buffer", function*() {
      var ch = chan(null, t.map(inc));
      go(function*() {
        for (var i = 0; i < 6; i++) {
          yield put(ch, i);
        }
      });
      for (var i = 0; i < 6; i++) {
        assert.equal((yield take(ch)), inc(i));
      }
    });

    it("should work with buffer", function*() {
      var ch = chan(3, t.map(inc));
      go(function*() {
        for (var i = 0; i < 6; i++) {
          yield put(ch, i);
        }
      });
      for (var i = 0; i < 6; i++) {
        assert.equal((yield take(ch)), inc(i));
      }
    });
  });

  describe("filter (input-supressing reduction)", function() {
    it("should work without buffer", function*() {
      var ch = chan(null, t.filter(even));
      go(function*() {
        for (var i = 0; i < 6; i++) {
          yield put(ch, i);
        }
      });
      assert.equal((yield take(ch)), 0);
      assert.equal((yield take(ch)), 2);
      assert.equal((yield take(ch)), 4);
    });

    it("should work with buffer", function*() {
      var ch = chan(3, t.filter(even));
      go(function*() {
        for (var i = 0; i < 6; i++) {
          yield put(ch, i);
        }
      });
      assert.equal((yield take(ch)), 0);
      assert.equal((yield take(ch)), 2);
      assert.equal((yield take(ch)), 4);
    });
  });

  describe("take (terminating reduction)", function() {
    it("should work without buffer", function*() {
      var ch = chan(null, t.take(3));
      go(function*() {
        for (var i = 0; i < 6; i++) {
          yield put(ch, i);
        }
      });
      assert.equal((yield take(ch)), 0);
      assert.equal((yield take(ch)), 1);
      assert.equal((yield take(ch)), 2);
      assert.equal((yield take(ch)), CLOSED);
    });

    it("should work with buffer", function*() {
      var ch = chan(2, t.take(3));
      go(function*() {
        for (var i = 0; i < 6; i++) {
          yield put(ch, i);
        }
      });
      assert.equal((yield take(ch)), 0);
      assert.equal((yield take(ch)), 1);
      assert.equal((yield take(ch)), 2);
      assert.equal((yield take(ch)),  CLOSED);
    });
  });
});
