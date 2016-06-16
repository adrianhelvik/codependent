var assert = require('assert');
var Container = require('../container');

describe('container', () => {
    it('can set/get a value', () => {
        var container = new Container('set/get value test');

        container.value('hello', 'world');
        assert.equal(container.get('hello'), 'world');
    });

    it('can set/get a class', () => {
        var container = new Container('set/get class test');

        class MyClass {}

        container.class('MyClass', MyClass);

        var instance1 = container.get('MyClass');
        var instance2 = container.get('MyClass');

        assert.ok(instance1 instanceof MyClass);
        assert.ok(instance2 instanceof MyClass);
        assert.ok(instance1 !== instance2);
    });

    it('can dependency inject into class constructor', () => {
        var container = new Container('inject class test');
        class ClassA {}
        container.class('ClassA', ClassA);

        class ClassB {
            constructor(a = ClassA) {
                this.a = a;
            }
        }

        container.class('ClassB', ClassB);

        let x = container.get('ClassB');

        assert.ok(x.a instanceof ClassA);
    });

    it('can create a singleton', () => {
        var container = new Container('create singleton test');

        class MyClass {}

        container.singleton('MyClass', MyClass);

        let a = container.get('MyClass');
        let b = container.get('MyClass');

        assert.equal(a, b);
    });

    it('can inject into a function', () => {
        let container = new Container('inject function test');

        class Lol {}

        container.class('Lol', Lol);

        var ran = false;
        function fn(l = Lol) {
            ran = true;

            assert.ok(l instanceof Lol);
        }

        container.callFunction(fn);

        assert.ok(ran);
    });

    it('can set the thisArg of a function that is injected into', () => {
        let container = new Container('set thisArg test');
        let thisArg = {};

        var ran = false;
        function fn() {
            assert.ok(this === thisArg);
            ran = true;
        }

        container.callFunction(thisArg, fn);
        assert.ok(ran);
    });

    it('can be extended by other containers', () => {
        let containerA = new Container('A');
        let containerB = new Container('B');
        let containerC = new Container('C')

        containerB.extend(containerA);
        containerC.extend(containerB);

        containerA.value('a', 'A');
        assert.equal(containerC.get('a'), 'A');
    });

    it('can register providers', () => {
        let container = new Container('providers test');
        let something = function () { return 'world'}

        container.value('something', something);

        class MyClass {
            constructor(str, fn) {
                this.str = str + ' ' + fn();
            }
        }

        container.provider('someProvider', (x = something) => {
            return new MyClass('hello', x);
        });

        let instance = container.get('someProvider');

        assert.ok(instance.str === 'hello world');
    });

    it('gets from extended containers in the correct order (newest prioritized)', () => {
        let a = new Container('a');
        let b = new Container('b');
        let c = new Container('c');

        a.value('x', 1);
        b.value('x', 2);

        c.extend(a);
        c.extend(b);

        assert.equal(c.get('x'), 2);
    });

    it('will error if a value was not registered in the container or extended containers', () => {
        let a = new Container('a');
        let b = new Container('b');
        let c = new Container('c');

        b.extend(a);
        c.extend(b);

        assert.throws(() => c.get('x'), Error);
    });

    it('can register a function as a class', () => {
        let c = new Container('c');

        c.class('funcClass', function () {
            this.meaningOfLife = 42;
        });

        let meaningOfLife = null;
        assert.equal(c.callFunction(funcClass => {
            meaningOfLife = funcClass.meaningOfLife;
        }));

        assert.equal(meaningOfLife, 42, 'Did the class function get constructed?');
        assert.notEqual(this.meaningOfLife, 42, 'Was it actually newed up?');
    });

    it('can inject a class multiple times and provide a new instance for each', () => {
        let c = new Container('c');

        class MyClass {}

        c.class('myClass', MyClass);

        c.callFunction((a = myClass, b = myClass) => {
            assert.notEqual(a, b);
            assert.ok(a instanceof MyClass);
            assert.ok(b instanceof MyClass);
        });
    });
});
