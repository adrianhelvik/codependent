'use strict';

var assert = require('assert');
var Container = require('../container');

describe('container', () => {

    describe('.constant', () => {

        it('can be registered and taken out', () => {

            // Arrange...
            var container = new Container('container');

            // Act...
            container.constant('hello', 'world');

            // Assert...
            assert.equal(container.get('hello'), 'world');

        });

    });

    describe('.register', () => {

        it('can be registered and taken out', () => {

            // Arrange...
            const container = new Container('container');

            // Act...
            container.register('hello', () => 'world');

            // Assert...
            assert.equal(container.get('hello'), 'world');
        });

        it('can be dependency injected into', () => {
            // Arrage
            const container = new Container('container');

            // Act
            container.constant('foo', 'bar');
            container.register('hello', (foo) => foo + ' world');

            // Assert
            assert.equal(container.get('hello'), 'bar world');
        });

    });

    describe('.provider', () => {

        it('can be registered and taken out', () => {

            // Arrange...
            var container = new Container('container');
            let id = 0;
            container.provider('incrementing', () => {
                return id++;
            });

            // Act / assert...
            container.callFunction((incrementing) => {
                assert.equal(incrementing, 0);
            });
            container.callFunction((incrementing) => {
                assert.equal(incrementing, 1);
            });
        });

    });

    describe('.class', () => {

        it('is instantiated once for every injection', () => {

            // Arrange...
            var container = new Container('set/get class test');
            class MyClass {}

            // Act...
            container.class('MyClass', MyClass);
            var instance1 = container.get('MyClass');
            var instance2 = container.get('MyClass');

            // Assert...
            assert.ok(instance1 instanceof MyClass);
            assert.ok(instance2 instanceof MyClass);
            assert.ok(instance1 !== instance2);
        });

        it('can be dependency injected into', () => {

            // Arrange...
            var container = new Container('inject class test');
            class ClassA {}
            container.class('ClassA', ClassA);

            // Act...
            class ClassB {
                constructor(a = ClassA) {
                    this.a = a;
                }
            }
            container.class('ClassB', ClassB);
            const x = container.get('ClassB');

            // Assert...
            assert.ok(x.a instanceof ClassA);

        });

        it('can be a function', () => {

            // Arrange...
            const c = new Container('c');
            c.class('funcClass', function () {
                this.meaningOfLife = 42;
            });

            // Act...
            const meaningOfLife = c.callFunction(funcClass => funcClass.meaningOfLife);

            // Assert
            assert.equal(meaningOfLife, 42, 'Did the class function get constructed?');
            assert.notEqual(this.meaningOfLife, 42, 'Was it actually newed up?');
        });

        it('produces new instance of class for separate arguments', () => {
            const c = new Container('c');

            class MyClass {}

            c.class('myClass', MyClass);

            c.callFunction((a = myClass, b = myClass) => {
                assert.notEqual(a, b);
                assert.ok(a instanceof MyClass);
                assert.ok(b instanceof MyClass);
            });
        });

        it('does not need a constructor', () => {
            // Arrange...
            const container = new Container('...');
            class MyClass {
                func(a, b, c) {}
            }

            // Act...
            container.class('myClass', MyClass);

            // Assert...
            assert.doesNotThrow(() => {
                container.get('myClass');
            });
        });
    });

    describe('.singleton', () => {

        it('can be registered and taken out', () => {

            // Arrange...
            var c = new Container('container');
            let clazz;
            c.singleton('single', clazz = class {});

            // Act...
            const a = c.get('single');
            const b = c.get('single');

            // Assert...
            assert.ok(a instanceof clazz);
            assert.equal(a, b);

        });

        it('can be dependency injected into', () => {

            // Arrange...
            var c = new Container('container');
            c.register('hello', () => 'world');
            class MyClass {
                constructor(world = hello) {
                    this.world = world;
                }
            };

            // Act...
            c.singleton('myClass', MyClass);

            // Assert...
            assert.equal(c.get('myClass').world, 'world');
        });

        it('is instantiated only once', () => {

            // Arrange...
            var container = new Container('create singleton test');
            class MyClass {}

            // Act...
            container.singleton('myClass', MyClass);
            const a = container.get('myClass');
            const b = container.get('myClass');
            const c = container.callFunction((x = myClass) => x);

            // Assert.
            assert.equal(a, b);
            assert.equal(a, c);

        });

    });

    describe('.get', () => {
        it('can get an injectable value', () => {

            // Arrange...
            var container = new Container('create singleton test');
            container.constant('x', 10);

            // Act...
            let x = container.get('x');

            // Assert.
            assert.equal(x, 10);

        });
    });

    describe('.callFunction', () => {

        it('is called with injected parameters', () => {

            // Arrange...
            const container = new Container('inject function test');
            class Lol {}
            container.class('Lol', Lol);
            var ran = false;

            // Act...
            function fn(l = Lol) {
                ran = true;
                assert.ok(l instanceof Lol);
            }
            container.callFunction(fn);

            // Assert...
            assert.ok(ran);

        });

        it('can set the thisArg of a function that is injected into', () => {

            // Arrange...
            const container = new Container('set thisArg test');
            const thisArg = {};
            let ran = false;
            let gotThisArg;

            // Act...
            function fn() {
                gotThisArg = this;
                ran = true;
            }
            container.callFunction(thisArg, fn);

            // Assert
            assert.equal(thisArg, gotThisArg);
            assert.ok(ran);
        });

    });

    describe('.instantiate', () => {
        it('is instantiated with injected parameters', () => {

            // Arrange...
            const c = new Container('c');
            let i = 0;
            c.provider('count', () => i++);
            class MyClass {
                constructor(a = count, count) {
                    this.first = a;
                    this.second = count;
                }
            }

            // Act...
            const instance = c.instantiate(MyClass);

            // Assert...
            assert.equal(instance.first, 0);
            assert.equal(instance.second, 1);
        });
    });

    describe('.extend', () => {

        it('can extend other containers', () => {

            // Arrange...
            const containerA = new Container('A');
            const containerB = new Container('B');
            const containerC = new Container('C');

            // Act..
            containerB.extend(containerA);
            containerC.extend(containerB);
            containerA.constant('a', 'A');

            // Assert...
            assert.equal(containerC.get('a'), 'A');
        });

        it('gets values from last extended container first', () => {

            // Arrange...
            const a = new Container('a');
            const b = new Container('b');
            const c = new Container('c');

            // Act...
            a.constant('x', 1);
            b.constant('x', 2);
            c.extend(a);
            c.extend(b);

            // Assert...
            assert.equal(c.get('x'), 2);

        });

        it('throws an error if the value was not found', () => {

            // Arrange...
            const a = new Container('a');
            const b = new Container('b');
            const c = new Container('c');
            b.extend(a);
            c.extend(b);

            // Act / assert...
            assert.throws(() => c.get('x'), Error);

        });

    });

});
