Codependent - A dandy dependency injector
=========================================

We all know about angular style dependency injection. It is nice and sweet,
but what if it could be even better? Due to the lazy loading nature of argument
evaluation with the new ES6 default parameters, it can!

How to create an injection container
------------------------------------

```javascript
const Codependent = require('codependent');

// Constructed with an arbitrary container name - used for error messages
const container = new Codependent('my container');
```

How to register objects in the container
----------------------------------------

container.constant(‹name› ‹value›)
----------------------------------
Stores the value in the container. That simple

```javascript
container.constant('hello', 'world');

container.get('hello'); // => 'world'
```

container.register(‹name›, ‹handler›)
-------------------------------------
The handler is a function that is dependecy
injected. This is useful if you need something
from the container when creating the object.

```javascript
container.contant('apiUrl', 'https://path-to-my.api');
container.register('photosUrl', (apiUrl) => apiUrl + '/photos');

container.get('photosUrl'); // => 'https://path-to-my.api/photos'
```

container.class(‹name›, ‹class or function›)
--------------------------------------------
Creates a new instance of the class every time
it is injected. In an ES6 class, the constructor
is injected, in an ES5 class, the function itself
is injected. Either way it is newed up.

```javascript
class MyClass {
    constructor(meaningOfLife) {
        this.meaningOfLife = meaningOfLife;
    }
}
container.costant('meaningOfLife', 42);
container.class('myClass', MyClass);

container.get('myClass').meaningOfLife === 42 // => true
```

container.singleton(‹name›, ‹class or function›)
------------------------------------------------
Same as function except that only one instance
will ever be created (unless the value is redefined
in the container). Singletons are eagerly
instantiated, so you must register it in the
container before its dependencies

```javascript
container.singleton('myClass', MyClass);
```

container.provider(‹name›, ‹handler›)
-------------------------------------
The handler function is called and injected every
time you inject the value. The return value of
the handler is what is injected.

```javascript
let i = 0;
container.constant('message', 'hello world');
container.provider('counter', message => {
    i += 1;
    return message + ' ' + i;
});

container.get('counter'); // => 'hello world 1'
container.get('counter'); // => 'hello world 2'
container.get('counter'); // => 'hello world 3'
// ...
```

How to create injectable classes, functions and methods
-------------------------------------------------------

### Default argument

```javascript
class MyClass {
    constructor(x = isInjected) {
    }
}

function myFunc(x = isInjected) {
}

let myFunc = (x = isInjected) => {
}

let myObj = {
    myMethod(x = isInjected) {
    }
}

```

### Angular style

```javascript
class MyClass {
    constructor(isInjected) {
    }
}

function myFunc(isInjected) {
}

let myFunc = (isInjected) => {
}

let myFunc = isInjected => {
}

let myObj = {
    myMethod(isInjected) {
    }
}
```

How to inject into a class
--------------------------

```javascript
container.instantiate(MyClass);
```

How to inject into a function
-----------------------------

```
container.callFunction(myFunction);
```

Note
----
This package does not work with older versions of node. You will need
node/6.0.0 or greater.

Extending a Codependent container
---------------------------------

```javascript
const containerA = new Codependent('A');
const containerB = new Codependent('B');

// let containerB access all
// values stored in containerA
containerB.extend(containerA);

containerA.contant('greeting', 'Hello world!');
containerB.get('greeting'); // => 'Hello world'
```

Recursive injection
-------------------

### How it's awesome - simplicity

When a class or provider is injected, all of
its dependencies will themselves be injected.
Thus it all resolves quite nicely into the
desired object.

## How it can be bad - infinite recursion

so if module A requires itself or if another
infinite dependency recursion occurs, it will
cause the call stack size to be exceeded.

### How it can be remedied

Register a value or a provider depending on
your needs and manually create the object.

How to dependency inject
========================

In these examples `injected` and `injectedAsWell` are the keys
that are looked up in the injection container and x is a
variable the injected value is assigned to in the function
or class constructor.

container.callFunction(‹function›)
----------------------------------
Dependency inject the function and call it.

```javascript
container.callFunction(function (x = injected, injectedAsWell) {
    // ...
});
```

container.instantiate(‹class or function›)
------------------------------------------
Dependency inject a class constructor or a function
and create a new instance.

```javascript
class MyClass {
    constructor(x = injected, injectedAsWell) {
        // ...
    }
}
function FnClass(x = injected, injectedAsWell) {}

container.instantiate(MyClass);
container.instantiate(FnClass);
```

container.get(‹name›)
---------------------

```javascript
container.get('injected');
```

Testing
=======

`npm install -g mocha`
`npm install`
`npm test`

Not happy with something?
=========================

Send me a pull request and I will get it sorted out! Tests are mandatory for pull requests.
The get-args function has tests and is working, but it is ugly and probably has suboptimal
performance, so I would be happy about pull requests for that one! :)

TODO
====

get-args
--------

* Refactor get-args into separate npm-module.
* Replace regex with state machine.
* Exhaust all possible ways a function/method can be made in es7
