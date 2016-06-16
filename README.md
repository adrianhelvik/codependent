Codependent - A dandy dependency injector
=========================================

We all know about angular style dependency injection. It is nice and sweet,
but what if it could be even better? Due to the lazy loading nature of argument
evaluation with the new ES6 default parameters, it can!

Usage examples
--------------

```javascript
// For classes
class MyClass {
    constructor(something = someInjectable) {
    }
}

// For functions
function myFunc(something = somethingElse) {
}

// For arrow functions
let myFunc = thisIsInjected => {
}

let myFunc = (something = injectedValue) => {
}
```

.. but what if you prefer shorter angular style injections?

```javascript
class MyClass {
    constructor(thisIsInjected) {
    }
}
```

.. or a combination

```javascript
function myFunc(thisIsAlsoInjected, something = andSoIsThis) {
}

```
Extending codependent containers
--------------------------------

Another handy dandy feature is that the container takes care of
newing up your classes and its dependencies.. and its
dependencies.. and so forth. Even if it has to look through
containers that you extend from! This calls for an example.

```javascript
let Codependent = require('codependent');

// 1. First you create a container.
//    You name it to simplify error
//    messages for extended containers.

let a = new Codependent('its name');

// 2. Register some values if you please!

a.value('apiUrl', 'https://a-mighty-secure-api.rocks');

class MyClass {
    constructor(worldsSafestApi = apiUrl) {
        this.worldsSafestApi = apiUrl;
    }
});

a.class('myClass', MyClass);

// 3. Then you create a second container
//    so that you can see the magic of
//    container extension.

let b = new Codependent('A very dandy container');

// 4. Then you set b to extend the first container.

b.extend(a);

//    You can extend multiple containers, and the
//    last registered container will have precedence
//    over all but the current container.
//
//    If you were to change apiUrl in container b,
//    this would not affect the construction of a
//    MyClass-instance as the containers simply
//    query for values prom the containers they
//    extend (through Codependent.prototype.get) if
//    they don't contain a given value.

// 5. What about wrapping up with a singleton
//    - The hipster of design patterns?

b.singleton('evergreen', class {
    constructor(whatevs = myClass) {
        // whatevs is now a newed up instance of MyClass
    }
});
```

Injectable types
================

Values
------

Values are the simplest injectable. You specify a name and a value and
then it can be injected through the container.

```javascript
let Codependent = require('codependent');
let container = new Codependent('some container');

container.value('hello', 'world');

container.callFunction(hello => {
        console.log(hello); // world
});
```

Classes
-------

Classes are newed up whenever they are injected, and its constructor
is dependency injected. A sweet feature of non-angular style injection
is that you can inject multiple instances of the same class.

```javascript
let Codependent = require('codependent');
let container = new Codependent('some other container');

container.class('myClass', MyClass); // Assumes MyClass is a class

container.callFunction((a = myClass, b = myClass) => {
    console.log(a instanceof MyClass); // true
    console.log(b instanceof MyClass); // true

    console.log(a === b); // false
});
```

Singletons
----------
Singletons are just that. A caveat with singletons at the moment is
that they are eager instantiated. This means that everything you
inject into a singleton must be registered beforehand.

```javascript
let Codependent = require('codependent');
let container = new Codependent('a singleton container');

class MyClass {}

container.singleton('myClass', MyClass);

container.callFunction((a = myClass, b = myClass) => {
    console.log(a === b); // true
});

```

Providers
---------
Providers are convenient if you want dependecy injection
when registering any kind of value that shouldn't itself
be injected.

```javascript
let Codependent = require('codependent');
let container = new Codependent('a singleton container');

container.value('config', {
    'dependency injection': 'is sweet'
});

container.provider('importantInfo', (isImportant = config) => {
    let what = Objecy.keys(isImportant)[0];

    return what + ' ' + isImportant[what];
});

container.get('importantInfo'); // => 'dependency injection is sweet'

```

How to dependency inject
========================

In these examples `injected` and `injectedAsWell` are the keys
that are looked up in the injection container and x is a
variable the injected value is assigned to in the function
or class constructor.

into a function
---------------

```javascript
container.callFunction(function (x = injected, injectedAsWell) {
    // ...
});
```

into a class
------------

```javascript
container.instantiatedClass(class {
    constructor(x = injected, injectedAsWell) {
        // ...
    }
});
```

Outside a class or function
---------------------------

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
* Test object method shorthand - as in { x() {} }
* Replace regex with state machine or es6 parser.

