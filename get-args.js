'use strict';

// --------------
// TODO: Refactor
// --------------
// Shit is getting ugly yo!

var jsTokens = require('js-tokens');

exports = module.exports = getArgs;
exports.defaults = getArgsDefaults;

function getArgs(fn) {
    return Object.keys(getArgsDefaults(fn));
}

function getArgsDefaults(fn) {
    let noComment = removeComments(fn.toString());
    let split = splitArgs(noComment);
    let mapped = mapArgsToDefault(split);

    return mapped;
}

function removeComments(fnStr) {
    let res = [];

    main: for (let i = 0; i < fnStr.length; i++) {
        if (fnStr[i] === '\'') {
            res.push(fnStr[i]);
            i++;
            while (fnStr[i] !== '\'' || fnStr[i-1] === '\\') {
                res.push(fnStr[i]);
                i++;
            }
        }
        if (fnStr[i] === '"') {
            res.push(fnStr[i]);
            i++;
            while (fnStr[i] !== '"' || fnStr[i-1] === '\\') {
                res.push(fnStr[i]);
                i++;
            }
        }
        if (fnStr.substring(i, i+2) === '//') {
            i += 2;
            while (! ['\n', '\l', '\r'].includes(fnStr[i])) {
                i++;
            }
        }

        if (fnStr.substring(i, i+2) === '/*') {
            let start = i;
            i += 2;
            while (fnStr.substring(i, i+2) !== '*/') {
                i++;
            }
            i += 2;
            let end = i;
        }

        res.push(fnStr[i]);
    }

    return res.join('');
}

function mapArgsToDefault(arr) {
    let result = {};

    arr.forEach(arg => {
        let eqIndex = arg.indexOf('=');
        if (eqIndex !== -1) {
            let key = arg.substring(0, eqIndex).trim();
            let val = arg.substring(eqIndex + 1, arg.length).trim();

            // for conformance with no specified default
            if (val === 'undefined')
                val = undefined;

            result[key] = val;
        }
        else result[arg.trim()] = undefined;
    });

    return result;
}

function splitArgs(fnStr) {

    let tokens = fnStr.match(jsTokens);

    // enable x => {} style arrow function args parsing
    for (let i = 0; i < tokens.length; i++) {
        let token = tokens[i];

        if (token === '(') {
            break; // An argument list has been found for arrow fn or object method - as in { x() {} }
        }
        if (token === '=>') {
            // find a non-whitespace token before the => token
            for (let j = i-1; j >= 0; j--) {
                if (! /^\s*$/.test(tokens[j])) {
                    return [tokens[j]];
                }
            }
        }
    }

    if (tokens[0] === 'class') {
        fnStr = getConstructorString(fnStr);
    }

    return splitArgsFunction(fnStr);
}

function splitArgsFunction(fnStr) {
    let argStart = fnStr.indexOf('(') + 1;

    let parenLevel = 1;
    let curlyLevel = 0;
    let bracketLevel = 0;
    let argEnd = -1;

    let args = [];

    let currStart = argStart;
    for (let i = argStart; i < fnStr.length; i++) {
        if (fnStr[i] === '{')
            curlyLevel++;
        if (fnStr[i] === '}')
            curlyLevel--;
        if (fnStr[i] === '[')
            bracketLevel++;
        if (fnStr[i] === ']')
            bracketLevel--;
        if (fnStr[i] === '(')
            parenLevel++;
        if (fnStr[i] === ')')
            parenLevel--;

        if (fnStr[i] === ',' && bracketLevel === 0 && curlyLevel === 0 && parenLevel === 1) {
            args.push(fnStr.substring(currStart, i).trim());
            currStart = i + 1;
        }

        if (parenLevel === 0) {
            argEnd = i;
            let str = fnStr.substring(currStart, i);
            if (str)
                args.push(str);
            break;
        }
    }

    return args;
}

function getConstructorString(classStr) {
    let tokens = classStr.match(jsTokens);

    let start = -1;
    let end = -1;

    let curly = 0;
    let paren = 0;
    let brack = 0;

    let index = -1;
    for (let token of tokens) {
        index++;

        if (token === '{') {
            curly++;
        }
        else if (token === '}') {
            curly--;

            if (start !== -1 && curly === 1 && brack === 0 && paren === 0) {
                end = index + 1;
                break;
            }
        }
        else if (token === '[') {
            brack++;
        }
        else if (token === ']') {
            brack--;
        }
        else if (token === '(') {
            paren++;
        }
        else if (token === ')') {
            paren--;
        }
        else if (curly === 1 && brack === 0 && paren === 0 && token === 'constructor') {
            start = index
        }
    }

    if (start === -1) {
        return [];
    }

    return tokens.slice(start, end).join('');
}
