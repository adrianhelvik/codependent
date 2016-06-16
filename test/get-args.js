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

        describe('can handle single line comments', () => {
            it('in regular functions', () => {
                function myFn(a // Ignore me
                                  = // .. and me
                                      b, // and me
                              c // aaand me
                                  = // aaaand me
                                      d // aaaaand me
                             ) {
                }

                assert.deepEqual(getArgs(myFn), ['a', 'c']);
                assert.deepEqual(getArgs.defaults(myFn), {'a': 'b', 'c': 'd'} );
            });

            it('in arrow functions with parens', () => {
                function myFn(a // Ignore me
                              = // .. and me
                                  b, // and me
                          c // aaand me
                              = // aaaand me
                                  d // aaaaand me
                             ) {
                }

                assert.deepEqual(getArgs(myFn), ['a', 'c']);
                assert.deepEqual(getArgs.defaults(myFn), {'a': 'b', 'c': 'd'} );
            });
        });

        describe('can handle multiline comments', () => {
            it('in regular functions,', () => {
                function /* ({[ */ fn /* ({[ */ ( /* ([{ */ a /* = */ = /**/ 10 ) {
                }

                assert.deepEqual(getArgs(fn), ['a']);
                assert.deepEqual(getArgs.defaults(fn), {'a': '10'});
            });
            it('in arrow functions with parens', () => {
                let fn = /* => { */ (a /* ({[// */ = 10) => {
                }

                assert.deepEqual(getArgs(fn), ['a']);
                assert.deepEqual(getArgs.defaults(fn), {'a': '10'});
            });
            it('in arrow functions without parens', () => {
                let fn = /* => { */ a /* ({[// */ => {
                }

                assert.deepEqual(getArgs(fn), ['a']);
                assert.deepEqual(getArgs.defaults(fn), {'a': undefined});
            });
        });

        it('wont parse comments within strings', () => {
            function fn(x = '/*', y = '*/', z = '//', w) {
                // ...
            }

            assert.deepEqual(getArgs(fn), ['x', 'y', 'z', 'w']);
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

        it('can handle single line comments', () => {
            class MyClass {
                // ({[{(
                someMethod() {
                }

                constructor(a // Ignore me
                            = // .. and me
                            b, // and me
                            c // aaand me
                            = // aaaand me
                            d // aaaaand me
                           ) {
                }
            }

            assert.deepEqual(getArgs(MyClass), ['a', 'c']);
            assert.deepEqual(getArgs.defaults(MyClass), {'a': 'b', 'c': 'd'} );
        });

        it('can handle multi line comments', () => {
            class MyClass {
                /* ({[{( */
                someMethod() {
                }
                /**/constructor(a /* Ignore me,
                                 I should be removed*/
                            =  /* .. and me */
                            b, /* and me
                                  */
                            c /* aaand me */
                            = /* aaaand me */
                            d /* aaaaand me */
                           ) {
                }
            }

            assert.deepEqual(getArgs(MyClass), ['a', 'c']);
            assert.deepEqual(getArgs.defaults(MyClass), {'a': 'b', 'c': 'd'} );
        });

        it ('won\'t parse comments within strings', () => {
            class MyClass {
                someMethod() {
                }

                constructor(a = "/* Do not ignore",
                            c = '// We don\'t like being ignored */'
                           ) {
                }
            }

            assert.deepEqual(getArgs(MyClass), ['a', 'c']);
            assert.deepEqual(getArgs.defaults(MyClass), {'a': '"/* Do not ignore"', 'c': "'// We don\\'t like being ignored */'"} );
        });
    });
});
