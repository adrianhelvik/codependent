'use strict';

const getArgs = require('./get-args');

class Container {

    /**
     * Create a new container.
     *
     * @param {string} name Used for debugging. Specify context of the container.
     */
    constructor(name) {
        if (typeof name !== 'string') {
            throw Error('Unnamed Container instances not allowed!');
        }

        this.name = name;

        // Injectable storage
        this.values = {};
        this.classes = {};
        this.providers = {};

        // Extended containers
        this.parents = [];
    }

    // setters

    /**
     * Add a singleton instance of a class to the container.
     *
     * @param {string} key   The name of the new injectable.
     * @param {class}  clazz The class to be instantiated and added to the container.
     *
     * @return {Container} This container.
     */
    singleton(key, clazz) {
        this.values[key] = this.instantiate(clazz);

        return this;
    }

    /**
     * Add a value to the container.
     *
     * @param {string} key The name the value can be injected with.
     * @param {any} val The value to be injected.
     *
     * @returns {Container} This container instance.
     */
    constant(key, val) {
        this.deleteIfExists(key);
        this.values[key] = val;

        return this;
    }

    /**
     * Add a class to the continer. The class will be instantiated
     * on injection and its constructor will be dependency injected.
     *
     * @param {string} key The name that class instances can be injected with.
     * @param {class}  val The class to register.
     *
     * @returns {Container} This container instance.
     */
    ['class'](key, val) {
        this.deleteIfExists(key);
        this.classes[key] = val;

        return this;
    }

    /**
     * Register any value in the container through an injectable
     * handler function. This function will be invoked once
     * when the value is registered and will be dependency
     * injected. Its return value will be stored in
     * this container,
     *
     * @param {string}   name    The name of the injectable.
     * @param {function} handler A function that is dependency injected.
     *
     * @returns {Container} This container instance.
     */
    register(name, handler) {
        this.deleteIfExists(name);
        this.constant(name, this.callFunction(handler));

        return this;
    }

    /**
     * TODO: Test
     */
    provider(name, handler) {
        this.deleteIfExists(name);
        this.providers[name] = handler;

        return this;
    }

    /**
     * TODO: Test
     */
    exists(key) {
        return this.values[key] !== undefined ||
            this.providers[key] !== undefined ||
            this.classes[key] !== undefined;
    }

    /**
     * TODO: Test
     */
    deleteIfExists(key) {
        if (this.exists(key)) {
            delete this.values[key];
            delete this.providers[key];
            delete this.classes[key];
        }
    }

    // misc.
    // -----

    /**
     * Instantiate a class and inject its arguments from the container.
     *
     * @param {class} clazz A class which will be newed up with dependency injection.
     *
     * @returns {object} The created instance of the class.
     */
    instantiate(clazz) {
        const argValues = this._getInjectables(clazz);
        const args = [];

        for (let i = 0; i < argValues.length; i++) {
            args.push('argValues[' + i + ']');
        }

        return eval('new clazz(' + args.join(',') + ');');
    }

    /**
     * Call a function with dependency injection.
     *
     * @param {any} [thisArg] Optional this value that the function will be applied with.
     * @param {function} fn The function to be dependency injected.
     *
     * @returns {any} The return value of the function.
     */
    callFunction(thisArg, fn) {
        if (!fn) {
            fn = thisArg;
            thisArg = null;
        }

        if (typeof fn !== 'function') {
            throw TypeError(
                'Invalid type for Container.callFunction: ' +
                'got type "' + typeof fn + '" requires type "function"'
            );
        }

        return fn.apply(thisArg, this._getInjectables(fn));
    }

    _getInjectables(fn) {
        const originalArgs = getArgs.defaults(fn);
        const argValues = [];

        for (const key of Object.keys(originalArgs)) {
            if (originalArgs[key]) {
                argValues.push(this.get(originalArgs[key]));
            } else {
                argValues.push(this.get(key));
            }
        }

        return argValues;
    }

    // getters
    // -------

    /**
     * Get a value from the container.
     *
     * @param {string} key The key to query the container for.
     *
     * @returns {any} The value stored in the container (if
     *               the value is a class and not a singleton:
     *               a new instance of the class will be returned)
     */
    ['get'](key) {
        if (this.values[key] !== undefined) {
            return this.values[key];
        } else if (this.providers[key] !== undefined) {
            return this.callFunction(this.providers[key]);
        } else if (this.classes[key] !== undefined) {
            return this.instantiate(this.classes[key]);
        } else {
            for (let i = this.parents.length - 1; i >= 0; i--) {
                const parent = this.parents[i];
                let found;

                try {
                    found = parent.get(key);
                } catch (err) {}

                if (found !== undefined) {
                    return found;
                }
            }

            return this._error(key + ' is not registered in Container.');
        }
    }

    /**
     * Extend this container with another container.
     * Continers will recursively be queried for
     * an injecection if one is requested.
     *
     * Multiple containers can be extended.
     *
     * @param {Container} otherContainer Container to extend
     *
     * @returns {Container} This container.
     */
    extend(otherContainer) {
        this.parents.push(otherContainer);

        return this;
    }

    // error handling
    // --------------

    _parentString() {
        let parentStr = '';

        if (this.parents && this.parents.length) {
            parentStr += '[' + this.parents.map(p => {
                let superParentString = p._parentString();
                if (superParentString) {
                    superParentString = ' <- ' + superParentString;
                }
                return '"' + p.name + '"' + superParentString;
            }).join(', ') + ']';
        }

        return parentStr;
    }

    _error(msg) {
        let parentString = this._parentString();

        if (parentString) {
            parentString = ' - inheriting from: ' + parentString;
        }

        throw Error(msg + ' Current container: "' + this.name + '"' + parentString);
    }
}


module.exports = Container;
