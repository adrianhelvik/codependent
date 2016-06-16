var assert = require('assert');
var getArgs = require('../get-args');

describe('get-args', () => {
    describe('function', () => {
        it('gets default arguments of function', () => {
            function fn(hello = world) {
            }

            assert.deepEqual(getArgs(fn), ['hello']);
            assert.deepEqual(getArgs.defaults(fn), { 'hello': 'world' });
        });

        it('gets default arguments of arrow functions', () => {
            class Router {
                get(x, fn) {
                    return fn;
                }
            }

            let router = new Router;

            let fn = router.get('/', response => {
                console.log('GETTING INDEX');

                response.status(200).json({
                    success: true,
                    message: 'Welcome'
                });
            });

            assert.deepEqual(getArgs(fn), ['response']);
        });


        it('gets default arguments of arrow functions starting with class', () => {
            class Router {
                get(x, fn) {
                    return fn;
                }
            }

            let router = new Router;

            let fn = router.get('/', classyLady  => {
                console.log('GETTING INDEX');

                response.status(200).json({
                    success: true,
                    message: 'Welcome'
                });
            });

            assert.deepEqual(getArgs(fn), ['classyLady']);
        });
    });

    describe('class', () => {
        it('gets default arguments of class constructor', () => {
            class MyClass {
                someMethod() {
                }

                constructor(a = b, c = d) {
                }
            }

            assert.deepEqual(getArgs(MyClass), ['a', 'c']);
            assert.deepEqual(getArgs.defaults(MyClass), {'a': 'b', 'c': 'd'} );
        });
    });
});
