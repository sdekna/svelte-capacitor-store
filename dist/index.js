"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.variableStore = exports.objectStore = exports.arrayStore = void 0;
var indexeddb_wrapper_1 = __importDefault(require("./indexeddb-wrapper"));
var preferences_1 = require("@capacitor/preferences");
var core_1 = require("@capacitor/core");
var isDeviceNative = core_1.Capacitor.isNativePlatform();
var indexedbInitialized = false;
var indexedDbWrapper;
function arrayStore(_a) {
    var storeName = _a.storeName, noDuplication = _a.noDuplication, persist = _a.persist, initialValue = _a.initialValue, _b = _a.browserStorage, browserStorage = _b === void 0 ? 'indexedDB' : _b, initFunction = _a.initFunction, validationStatement = _a.validationStatement;
    if (browserStorage === 'indexedDB' && !indexedDbWrapper && typeof window !== 'undefined') {
        if (!(window === null || window === void 0 ? void 0 : window.indexedDB))
            browserStorage = 'localStorage';
        else {
            indexedDbWrapper = new indexeddb_wrapper_1.default('persistance-database', 'main-store');
            indexedDbWrapper.init().then(function () { return (indexedbInitialized = true); });
        }
    }
    var currentValue = initialValue;
    var previousValue = initialValue;
    var subscribers = new Set();
    // const { set } = writable(initialValue) as Writable<T>;
    function getValue() {
        return __awaiter(this, void 0, void 0, function () {
            var storedValue, storedPreviousValue, _a, value, previousValue_1, _b, value, previousValue_2, _c, value, previousValue_3, error_1;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 9, , 10]);
                        if (typeof window === 'undefined')
                            return [2 /*return*/, { value: null, previousValue: null }];
                        storedValue = void 0;
                        storedPreviousValue = void 0;
                        if (!!persist) return [3 /*break*/, 1];
                        storedValue = currentValue;
                        storedPreviousValue = previousValue;
                        return [3 /*break*/, 8];
                    case 1:
                        if (!isDeviceNative) return [3 /*break*/, 3];
                        return [4 /*yield*/, getCapacitorStore(storeName)];
                    case 2:
                        _a = _d.sent(), value = _a.value, previousValue_1 = _a.previousValue;
                        storedPreviousValue = previousValue_1;
                        storedValue = value;
                        return [3 /*break*/, 8];
                    case 3:
                        if (!(browserStorage === 'indexedDB')) return [3 /*break*/, 7];
                        if (!!indexedbInitialized) return [3 /*break*/, 5];
                        return [4 /*yield*/, indexedDbWrapper.init()];
                    case 4:
                        _d.sent();
                        _d.label = 5;
                    case 5: return [4 /*yield*/, getIndexedDBStore(storeName)];
                    case 6:
                        _b = _d.sent(), value = _b.value, previousValue_2 = _b.previousValue;
                        storedPreviousValue = previousValue_2;
                        storedValue = value;
                        return [3 /*break*/, 8];
                    case 7:
                        _c = getLocalStorageStore(storeName), value = _c.value, previousValue_3 = _c.previousValue;
                        storedPreviousValue = previousValue_3;
                        storedValue = value;
                        _d.label = 8;
                    case 8:
                        if (Array.isArray(storedValue))
                            return [2 /*return*/, { value: storedValue, previousValue: storedPreviousValue }];
                        else
                            return [2 /*return*/, { value: null, previousValue: null }];
                        return [3 /*break*/, 10];
                    case 9:
                        error_1 = _d.sent();
                        // console.error(`Error at getValue function, store: ${storeName}.`, { error });
                        return [2 /*return*/, { value: null, previousValue: null }];
                    case 10: return [2 /*return*/];
                }
            });
        });
    }
    var set = function (value) {
        if (typeof window === 'undefined' || !Array.isArray(value))
            return;
        if (noDuplication && currentValue && areArraysEqual(value, currentValue))
            return;
        if (validationStatement && !validationStatement(value))
            return;
        previousValue = currentValue;
        currentValue = value;
        if (persist)
            persistStore(storeName, value, previousValue, browserStorage);
        broadcastValue(value, previousValue);
    };
    function init() {
        return __awaiter(this, void 0, void 0, function () {
            var storedValue, storedPreviousValue, _a, value, previousValue_4, _b, value, previousValue_5, initialSetValue, error_2;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (typeof window === 'undefined' || !persist)
                            return [2 /*return*/];
                        if (!(!isDeviceNative && browserStorage === 'indexedDB' && !indexedbInitialized)) return [3 /*break*/, 3];
                        if (!!(window === null || window === void 0 ? void 0 : window.indexedDB)) return [3 /*break*/, 1];
                        browserStorage = 'localStorage';
                        return [3 /*break*/, 3];
                    case 1: return [4 /*yield*/, indexedDbWrapper.init()];
                    case 2:
                        _c.sent();
                        indexedbInitialized = true;
                        _c.label = 3;
                    case 3: return [4 /*yield*/, getValue()];
                    case 4:
                        _a = _c.sent(), value = _a.value, previousValue_4 = _a.previousValue;
                        storedValue = value;
                        storedPreviousValue = previousValue_4;
                        if (!isDeviceNative && browserStorage === 'indexedDB' && storedValue == null && storedPreviousValue == null) {
                            _b = getLocalStorageStore(storeName), value = _b.value, previousValue_5 = _b.previousValue;
                            if (Array.isArray(value) && (!validationStatement || (validationStatement && validationStatement(value)))) {
                                persistStore(storeName, value, previousValue_5, browserStorage);
                                localStorage.removeItem(storeName);
                            }
                            storedValue = value;
                            storedPreviousValue = previousValue_5;
                        }
                        initialSetValue = !validationStatement && Array.isArray(storedValue) ? storedValue
                            : validationStatement && Array.isArray(storedValue) && validationStatement(storedValue) ? storedValue
                                : initialValue;
                        currentValue = initialSetValue;
                        if (storedPreviousValue !== null)
                            previousValue = storedPreviousValue;
                        broadcastValue(initialSetValue, previousValue);
                        if (!initFunction) return [3 /*break*/, 8];
                        _c.label = 5;
                    case 5:
                        _c.trys.push([5, 7, , 8]);
                        return [4 /*yield*/, initFunction(storedValue, previousValue, set, reset)];
                    case 6:
                        _c.sent();
                        return [3 /*break*/, 8];
                    case 7:
                        error_2 = _c.sent();
                        console.error(error_2);
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        });
    }
    init();
    var subscribe = function (callback) {
        subscribers.add(callback);
        callback(currentValue, previousValue);
        return function () {
            subscribers.delete(callback);
        };
    };
    var update = function (callback) {
        var newValue = callback(structuredClone(currentValue), previousValue);
        if (Array.isArray(newValue))
            set(newValue);
    };
    function reset() {
        if (typeof window === 'undefined')
            return;
        // set(initialValue)
        previousValue = currentValue;
        currentValue = initialValue;
        if (persist)
            persistStore(storeName, initialValue, previousValue, browserStorage);
        broadcastValue(initialValue, previousValue);
    }
    function broadcastValue(value, previousValue) {
        subscribers.forEach(function (callback) {
            callback(value, previousValue);
        });
    }
    function get() {
        return currentValue;
    }
    return {
        getValue: getValue,
        subscribe: subscribe,
        update: update,
        reset: reset,
        init: init,
        get: get,
        set: set,
    };
}
exports.arrayStore = arrayStore;
function objectStore(_a) {
    var storeName = _a.storeName, noDuplication = _a.noDuplication, initialValue = _a.initialValue, _b = _a.browserStorage, browserStorage = _b === void 0 ? 'indexedDB' : _b, initFunction = _a.initFunction, validationStatement = _a.validationStatement, persist = _a.persist;
    if (browserStorage === 'indexedDB' && !indexedDbWrapper && typeof window !== 'undefined') {
        if (!(window === null || window === void 0 ? void 0 : window.indexedDB))
            browserStorage = 'localStorage';
        else {
            indexedDbWrapper = new indexeddb_wrapper_1.default('persistance-database', 'main-store');
            indexedDbWrapper.init().then(function () { return (indexedbInitialized = true); });
        }
    }
    var currentValue = initialValue;
    var previousValue = initialValue;
    var subscribers = new Set();
    function getValue() {
        return __awaiter(this, void 0, void 0, function () {
            var storedValue, storedPreviousValue, _a, value, previousValue_6, _b, value, previousValue_7, _c, value, previousValue_8, error_3;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 9, , 10]);
                        if (typeof window === 'undefined')
                            return [2 /*return*/, { value: null, previousValue: null }];
                        storedValue = void 0;
                        storedPreviousValue = void 0;
                        if (!!persist) return [3 /*break*/, 1];
                        storedValue = currentValue;
                        storedPreviousValue = previousValue;
                        return [3 /*break*/, 8];
                    case 1:
                        if (!isDeviceNative) return [3 /*break*/, 3];
                        return [4 /*yield*/, getCapacitorStore(storeName)];
                    case 2:
                        _a = _d.sent(), value = _a.value, previousValue_6 = _a.previousValue;
                        storedPreviousValue = previousValue_6;
                        storedValue = value;
                        return [3 /*break*/, 8];
                    case 3:
                        if (!(browserStorage === 'indexedDB')) return [3 /*break*/, 7];
                        if (!!indexedbInitialized) return [3 /*break*/, 5];
                        return [4 /*yield*/, indexedDbWrapper.init()];
                    case 4:
                        _d.sent();
                        _d.label = 5;
                    case 5: return [4 /*yield*/, getIndexedDBStore(storeName)];
                    case 6:
                        _b = _d.sent(), value = _b.value, previousValue_7 = _b.previousValue;
                        storedPreviousValue = previousValue_7;
                        storedValue = value;
                        return [3 /*break*/, 8];
                    case 7:
                        _c = getLocalStorageStore(storeName), value = _c.value, previousValue_8 = _c.previousValue;
                        storedPreviousValue = previousValue_8;
                        storedValue = value;
                        _d.label = 8;
                    case 8:
                        if (storedValue)
                            return [2 /*return*/, { value: storedValue, previousValue: storedPreviousValue }];
                        return [2 /*return*/, { value: null, previousValue: null }];
                    case 9:
                        error_3 = _d.sent();
                        // console.error(`Error at getValue function, store: ${storeName}.`, { error });
                        return [2 /*return*/, { value: null, previousValue: null }];
                    case 10: return [2 /*return*/];
                }
            });
        });
    }
    var set = function (value) {
        if (typeof window === 'undefined' || !value)
            return;
        if (noDuplication && currentValue && areObjectsEqual(value, currentValue))
            return;
        if (validationStatement && !validationStatement(value))
            return;
        previousValue = currentValue;
        currentValue = value;
        if (persist)
            persistStore(storeName, value, previousValue, browserStorage);
        broadcastValue(currentValue, previousValue);
    };
    function init() {
        return __awaiter(this, void 0, void 0, function () {
            var storedValue, storedPreviousValue, _a, value, previousValue_9, _b, value, previousValue_10, initialSetValue, error_4;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (typeof window === 'undefined' || !persist)
                            return [2 /*return*/];
                        if (!(browserStorage === 'indexedDB' && !indexedbInitialized)) return [3 /*break*/, 3];
                        if (!!(window === null || window === void 0 ? void 0 : window.indexedDB)) return [3 /*break*/, 1];
                        browserStorage = 'localStorage';
                        return [3 /*break*/, 3];
                    case 1: return [4 /*yield*/, indexedDbWrapper.init()];
                    case 2:
                        _c.sent();
                        indexedbInitialized = true;
                        _c.label = 3;
                    case 3: return [4 /*yield*/, getValue()];
                    case 4:
                        _a = _c.sent(), value = _a.value, previousValue_9 = _a.previousValue;
                        storedValue = value;
                        storedPreviousValue = previousValue_9;
                        if (browserStorage === 'indexedDB' && storedValue == null && storedPreviousValue == null) {
                            _b = getLocalStorageStore(storeName), value = _b.value, previousValue_10 = _b.previousValue;
                            if (value && (!validationStatement || (validationStatement && validationStatement(value)))) {
                                persistStore(storeName, value, previousValue_10, browserStorage);
                                localStorage.removeItem(storeName);
                            }
                            storedValue = value;
                            storedPreviousValue = previousValue_10;
                        }
                        initialSetValue = !validationStatement && storedValue ? storedValue
                            : validationStatement && storedValue && validationStatement(storedValue) ? storedValue
                                : initialValue;
                        currentValue = initialSetValue;
                        if (storedPreviousValue !== null)
                            previousValue = storedPreviousValue;
                        broadcastValue(initialSetValue, previousValue);
                        if (!initFunction) return [3 /*break*/, 8];
                        _c.label = 5;
                    case 5:
                        _c.trys.push([5, 7, , 8]);
                        return [4 /*yield*/, initFunction(initialSetValue, previousValue, set, reset)];
                    case 6:
                        _c.sent();
                        return [3 /*break*/, 8];
                    case 7:
                        error_4 = _c.sent();
                        console.error(error_4);
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        });
    }
    init();
    var subscribe = function (callback) {
        subscribers.add(callback);
        callback(currentValue, previousValue);
        return function () {
            subscribers.delete(callback);
        };
    };
    var update = function (callback) {
        var newValue = callback(structuredClone(currentValue), previousValue);
        if (newValue)
            set(newValue);
    };
    function reset() {
        if (typeof window === 'undefined')
            return;
        previousValue = currentValue;
        currentValue = initialValue;
        if (persist)
            persistStore(storeName, initialValue, previousValue, browserStorage);
        broadcastValue(initialValue, previousValue);
    }
    function broadcastValue(value, previousValue) {
        subscribers.forEach(function (callback) {
            callback(value, previousValue);
        });
    }
    function get() {
        return currentValue;
    }
    return {
        getValue: getValue,
        subscribe: subscribe,
        update: update,
        reset: reset,
        init: init,
        get: get,
        set: set,
    };
}
exports.objectStore = objectStore;
function variableStore(_a) {
    var storeName = _a.storeName, noDuplication = _a.noDuplication, initialValue = _a.initialValue, _b = _a.browserStorage, browserStorage = _b === void 0 ? 'indexedDB' : _b, initFunction = _a.initFunction, validationStatement = _a.validationStatement, persist = _a.persist;
    if (browserStorage === 'indexedDB' && !indexedDbWrapper && typeof window !== 'undefined') {
        if (!(window === null || window === void 0 ? void 0 : window.indexedDB))
            browserStorage = 'localStorage';
        else {
            indexedDbWrapper = new indexeddb_wrapper_1.default('persistance-database', 'main-store');
            indexedDbWrapper.init().then(function () { return (indexedbInitialized = true); });
        }
    }
    var currentValue = initialValue;
    var previousValue = initialValue;
    var subscribers = new Set();
    function getValue() {
        return __awaiter(this, void 0, void 0, function () {
            var storedValue, storedPreviousValue, _a, value, previousValue_11, _b, value, previousValue_12, _c, value, previousValue_13, error_5;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 9, , 10]);
                        if (typeof window === 'undefined')
                            return [2 /*return*/, { value: null, previousValue: null }];
                        storedValue = void 0;
                        storedPreviousValue = void 0;
                        if (!!persist) return [3 /*break*/, 1];
                        storedValue = currentValue;
                        storedPreviousValue = previousValue;
                        return [3 /*break*/, 8];
                    case 1:
                        if (!isDeviceNative) return [3 /*break*/, 3];
                        return [4 /*yield*/, getCapacitorStore(storeName)];
                    case 2:
                        _a = _d.sent(), value = _a.value, previousValue_11 = _a.previousValue;
                        storedPreviousValue = previousValue_11;
                        storedValue = value;
                        return [3 /*break*/, 8];
                    case 3:
                        if (!(browserStorage === 'indexedDB')) return [3 /*break*/, 7];
                        if (!!indexedbInitialized) return [3 /*break*/, 5];
                        return [4 /*yield*/, indexedDbWrapper.init()];
                    case 4:
                        _d.sent();
                        _d.label = 5;
                    case 5: return [4 /*yield*/, getIndexedDBStore(storeName)];
                    case 6:
                        _b = _d.sent(), value = _b.value, previousValue_12 = _b.previousValue;
                        storedPreviousValue = previousValue_12;
                        storedValue = value;
                        return [3 /*break*/, 8];
                    case 7:
                        _c = getLocalStorageStore(storeName), value = _c.value, previousValue_13 = _c.previousValue;
                        storedPreviousValue = previousValue_13;
                        storedValue = value;
                        _d.label = 8;
                    case 8:
                        if (storedValue != null)
                            return [2 /*return*/, { value: storedValue, previousValue: storedPreviousValue }];
                        return [2 /*return*/, { value: null, previousValue: null }];
                    case 9:
                        error_5 = _d.sent();
                        // console.error(`Error at getValue function, store: ${storeName}.`, { error });
                        return [2 /*return*/, { value: null, previousValue: null }];
                    case 10: return [2 /*return*/];
                }
            });
        });
    }
    var set = function (value) {
        if (typeof window === 'undefined' || value == null)
            return;
        if (noDuplication && currentValue !== null && value === currentValue)
            return;
        previousValue = currentValue;
        currentValue = value;
        if (persist)
            persistStore(storeName, value, previousValue, browserStorage);
        broadcastValue(value, previousValue);
    };
    function init() {
        return __awaiter(this, void 0, void 0, function () {
            var storedValue, storedPreviousValue, _a, value, previousValue_14, _b, value, previousValue_15, initialSetValue, error_6;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (typeof window === 'undefined' || !persist)
                            return [2 /*return*/];
                        if (!(browserStorage === 'indexedDB' && !indexedbInitialized)) return [3 /*break*/, 3];
                        if (!!(window === null || window === void 0 ? void 0 : window.indexedDB)) return [3 /*break*/, 1];
                        browserStorage = 'localStorage';
                        return [3 /*break*/, 3];
                    case 1: return [4 /*yield*/, indexedDbWrapper.init()];
                    case 2:
                        _c.sent();
                        indexedbInitialized = true;
                        _c.label = 3;
                    case 3: return [4 /*yield*/, getValue()];
                    case 4:
                        _a = _c.sent(), value = _a.value, previousValue_14 = _a.previousValue;
                        storedValue = value;
                        storedPreviousValue = previousValue_14;
                        if (browserStorage === 'indexedDB' && storedValue == null && storedPreviousValue == null) {
                            _b = getLocalStorageStore(storeName), value = _b.value, previousValue_15 = _b.previousValue;
                            if (value != null && (!validationStatement || (validationStatement && validationStatement(value)))) {
                                persistStore(storeName, value, previousValue_15, browserStorage);
                                localStorage.removeItem(storeName);
                            }
                            storedValue = value;
                            storedPreviousValue = previousValue_15;
                        }
                        initialSetValue = !validationStatement && storedValue != null ? storedValue
                            : validationStatement && storedValue != null && validationStatement(storedValue) ? storedValue
                                : initialValue;
                        currentValue = initialSetValue;
                        if (storedPreviousValue !== null)
                            previousValue = storedPreviousValue;
                        broadcastValue(initialSetValue, previousValue);
                        if (!initFunction) return [3 /*break*/, 8];
                        _c.label = 5;
                    case 5:
                        _c.trys.push([5, 7, , 8]);
                        return [4 /*yield*/, initFunction(storedValue, previousValue, set, reset)];
                    case 6:
                        _c.sent();
                        return [3 /*break*/, 8];
                    case 7:
                        error_6 = _c.sent();
                        console.error(error_6);
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        });
    }
    init();
    var subscribe = function (callback) {
        subscribers.add(callback);
        callback(currentValue, previousValue);
        return function () {
            subscribers.delete(callback);
        };
    };
    var update = function (callback) {
        var newValue = callback(structuredClone(currentValue), previousValue);
        if (newValue != null)
            set(newValue);
    };
    function reset() {
        if (typeof window === 'undefined')
            return;
        previousValue = currentValue;
        currentValue = initialValue;
        if (persist)
            persistStore(storeName, initialValue, previousValue, browserStorage);
        broadcastValue(initialValue, previousValue);
    }
    function broadcastValue(value, previousValue) {
        subscribers.forEach(function (callback) {
            callback(value, previousValue);
        });
    }
    function get() {
        return currentValue;
    }
    return {
        getValue: getValue,
        subscribe: subscribe,
        update: update,
        reset: reset,
        init: init,
        set: set,
        get: get,
    };
}
exports.variableStore = variableStore;
function persistStore(key, value, previousValue, browserStorage) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!isDeviceNative) return [3 /*break*/, 2];
                    return [4 /*yield*/, setCapacitorStore({ key: key, value: value, previousValue: previousValue })];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 2:
                    if (!(browserStorage === 'indexedDB')) return [3 /*break*/, 4];
                    return [4 /*yield*/, setIndexedDBStore({ key: key, value: value, previousValue: previousValue })];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    setLocalStorageStore({ key: key, value: value, previousValue: previousValue });
                    _a.label = 5;
                case 5: return [2 /*return*/];
            }
        });
    });
}
function getIndexedDBStore(key) {
    return __awaiter(this, void 0, void 0, function () {
        var document, value, previousValue;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, indexedDbWrapper.get(key)];
                case 1:
                    document = _a.sent();
                    if (!document)
                        return [2 /*return*/, { value: null, previousValue: null }];
                    value = document.value, previousValue = document.previousValue;
                    return [2 /*return*/, { value: value, previousValue: previousValue }];
            }
        });
    });
}
function setIndexedDBStore(_a) {
    var key = _a.key, value = _a.value, previousValue = _a.previousValue;
    return __awaiter(this, void 0, void 0, function () {
        var insertDocument;
        return __generator(this, function (_b) {
            insertDocument = { id: key, value: value, previousValue: previousValue };
            return [2 /*return*/, indexedDbWrapper.set(insertDocument)];
        });
    });
}
function getLocalStorageStore(key) {
    try {
        if (typeof window === 'undefined')
            return { value: null, previousValue: null };
        var stringValue = localStorage.getItem(key);
        if (!stringValue)
            return { value: null, previousValue: null };
        var _a = JSON.parse(stringValue), value = _a.value, previousValue = _a.previousValue;
        return { value: value, previousValue: previousValue };
    }
    catch (error) {
        // console.error(`Error at getLocalStorageStore function, key: ${key}.`, { error });
        return { value: null, previousValue: null };
    }
}
function setLocalStorageStore(_a) {
    var key = _a.key, value = _a.value, previousValue = _a.previousValue;
    try {
        if (typeof window === 'undefined')
            return;
        var persistedValue = { value: value, previousValue: previousValue };
        localStorage.setItem(key, JSON.stringify(persistedValue));
    }
    catch (error) {
        // console.error(`Error at setLocalStorageStore function, key: ${key}.`, { error });
    }
}
function getCapacitorStore(key) {
    return __awaiter(this, void 0, void 0, function () {
        var result, stringValue, _a, value, previousValue, error_7;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    if (typeof window === 'undefined' || !isDeviceNative)
                        return [2 /*return*/, { value: null, previousValue: null }];
                    return [4 /*yield*/, preferences_1.Preferences.get({ key: key })];
                case 1:
                    result = _b.sent();
                    stringValue = result.value;
                    if (!stringValue)
                        return [2 /*return*/, { value: null, previousValue: null }];
                    _a = JSON.parse(stringValue), value = _a.value, previousValue = _a.previousValue;
                    return [2 /*return*/, { value: value, previousValue: previousValue }];
                case 2:
                    error_7 = _b.sent();
                    // console.error(`Error at getCapacitorStore function, key: ${key}.`, { error });
                    return [2 /*return*/, { value: null, previousValue: null }];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function setCapacitorStore(_a) {
    var key = _a.key, value = _a.value, previousValue = _a.previousValue;
    return __awaiter(this, void 0, void 0, function () {
        var persistedValue, error_8;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    if (typeof window === 'undefined' || !isDeviceNative)
                        return [2 /*return*/];
                    persistedValue = { value: value, previousValue: previousValue };
                    return [4 /*yield*/, preferences_1.Preferences.set({ key: key, value: JSON.stringify(persistedValue) })];
                case 1:
                    _b.sent();
                    return [3 /*break*/, 3];
                case 2:
                    error_8 = _b.sent();
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function areObjectsEqual(object1, object2) {
    if (typeof object1 !== typeof object2)
        return false;
    if (object1 === object2)
        return true;
    if (Array.isArray(object1)) {
        if (!Array.isArray(object2) || object1.length !== object2.length)
            return false;
        return object1.every(function (value, index) { return areObjectsEqual(value, object2[index]); });
    }
    if (typeof object1 === 'object' && object1 !== null) {
        var keys1 = Object.keys(object1);
        var keys2 = Object.keys(object2);
        if (keys1.length !== keys2.length)
            return false;
        for (var _i = 0, keys1_1 = keys1; _i < keys1_1.length; _i++) {
            var key = keys1_1[_i];
            if (!keys2.includes(key) || !areObjectsEqual(object1[key], object2[key])) {
                return false;
            }
        }
        return true;
    }
    return false;
}
function areArraysEqual(array1, array2) {
    if (!array1 || !array2 || array1.length !== array2.length) {
        return false;
    }
    for (var i = 0; i < array1.length; i++) {
        var value1 = array1[i];
        var value2 = array2[i];
        if (value1 !== value2) {
            if (typeof value1 === 'object' && value1 !== null) {
                if (!areObjectsEqual(value1, value2)) {
                    return false;
                }
            }
            else if (Array.isArray(value1)) {
                if (!Array.isArray(value2) || !areArraysEqual(value1, value2)) {
                    return false;
                }
            }
            else {
                return false;
            }
        }
    }
    return true;
}
