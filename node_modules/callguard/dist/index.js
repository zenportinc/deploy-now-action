'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
function handle(handler, err, stacks) {
    try {
        var handledErr = stacks.length === 0 ? err : Object.create(err);
        if (stacks.length > 0) {
            handledErr.stack =
                stacks.concat([err.stack]).join("\nFrom:\n")
                    .replace("\n\n", "\n");
        }
        try {
            handler(handledErr);
        }
        catch (err) {
            console.error("[callguard 1/2]: guard handler threw error", err);
            console.error("[callguard 2/2]: while handling", handledErr);
        }
    }
    catch (err) {
        console.error("[callguard] handle error (probably caused by non-Error throw)]", err);
    }
}
function syncGuard(handler, opts) {
    var captureCallstacks = opts && !!opts.longStackTraces;
    var defaultReturn = (opts && opts.defaultReturn != null)
        ? opts.defaultReturn
        : null;
    var stacks = [];
    return function (fn) {
        if (captureCallstacks)
            stacks.push((new Error("[callguard]")).stack);
        return function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            if (captureCallstacks)
                stacks.push((new Error("[callguard]")).stack);
            try {
                var ret = fn.apply(void 0, args);
                if (opts && opts.catchAsync) {
                    Promise.resolve(ret)
                        .catch(function (err) { return handle(handler, err, stacks); });
                }
                return ret;
            }
            catch (err) {
                handle(handler, err, stacks);
                return defaultReturn;
            }
        };
    };
}
exports.syncGuard = syncGuard;
function asyncGuard(handler, opts) {
    var captureCallstacks = opts && !!opts.longStackTraces;
    var defaultReturn = (opts && opts.defaultReturn != null)
        ? opts.defaultReturn
        : null;
    var stacks = [];
    return function (fn) {
        if (captureCallstacks)
            stacks.push((new Error("[callguard]")).stack);
        return function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            if (captureCallstacks)
                stacks.push((new Error("[callguard]")).stack);
            try {
                return Promise.resolve(fn.apply(void 0, args))
                    .catch(function (err) {
                    handle(handler, err, stacks);
                    return defaultReturn;
                });
            }
            catch (err) {
                handle(handler, err, stacks);
                return defaultReturn;
            }
        };
    };
}
exports.asyncGuard = asyncGuard;
//# sourceMappingURL=index.js.map