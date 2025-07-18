"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = exports.auth = exports.app = exports.analytics = void 0;
exports.isValidDomainForAnalytics = isValidDomainForAnalytics;
exports.getAnalyticsInstance = getAnalyticsInstance;
var analytics_1 = require("firebase/analytics");
var app_1 = require("firebase/app");
var auth_1 = require("firebase/auth");
var firestore_1 = require("firebase/firestore");
var firebaseConfig = __assign({ apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY, authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID, storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET, messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID, appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID }, (process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID && {
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}));
// Função para validar se o domínio é válido para Analytics (utilitário)
function isValidDomainForAnalytics() {
    if (typeof window === "undefined")
        return false;
    var hostname = window.location.hostname;
    var protocol = window.location.protocol;
    // Lista de domínios/padrões inválidos
    var invalidPatterns = [
        /^localhost$/,
        /^127\.0\.0\.1$/,
        /^192\.168\./,
        /^10\./,
        /^172\.(1[6-9]|2[0-9]|3[01])\./,
        /^\d+\.\d+\.\d+\.\d+$/, // IPs em geral
        /^file:\/\//,
        /\.local$/,
        /^[^.]+$/, // Hostnames sem domínio
    ];
    // Verificar se não é HTTPS em produção (exceto para domínios específicos)
    if (process.env.NODE_ENV === "production" && protocol !== "https:") {
        return false;
    }
    // Verificar padrões inválidos
    for (var _i = 0, invalidPatterns_1 = invalidPatterns; _i < invalidPatterns_1.length; _i++) {
        var pattern = invalidPatterns_1[_i];
        if (pattern.test(hostname)) {
            return false;
        }
    }
    // Verificar se tem pelo menos um ponto (domínio válido)
    if (!hostname.includes(".")) {
        return false;
    }
    return true;
}
// Initialize Firebase
var app = !(0, app_1.getApps)().length ? (0, app_1.initializeApp)(firebaseConfig) : (0, app_1.getApp)();
exports.app = app;
// Initialize Firebase services
var db = (0, firestore_1.getFirestore)(app);
exports.db = db;
var auth = (0, auth_1.getAuth)(app);
exports.auth = auth;
// Analytics será inicializado via componente GoogleAnalytics
var analytics = null;
exports.analytics = analytics;
// Função para obter analytics se necessário (para uso programático)
function getAnalyticsInstance() {
    return __awaiter(this, void 0, void 0, function () {
        var supported, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (typeof window === "undefined")
                        return [2 /*return*/, null];
                    if (process.env.NODE_ENV !== "production")
                        return [2 /*return*/, null];
                    if (!process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID)
                        return [2 /*return*/, null];
                    if (!isValidDomainForAnalytics())
                        return [2 /*return*/, null];
                    if (!!analytics) return [3 /*break*/, 4];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, analytics_1.isSupported)()];
                case 2:
                    supported = _a.sent();
                    if (supported) {
                        exports.analytics = analytics = (0, analytics_1.getAnalytics)(app);
                    }
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/, analytics];
            }
        });
    });
}
