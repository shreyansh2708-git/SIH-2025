"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.LogLevel = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
var LogLevel;
(function (LogLevel) {
    LogLevel["ERROR"] = "ERROR";
    LogLevel["WARN"] = "WARN";
    LogLevel["INFO"] = "INFO";
    LogLevel["DEBUG"] = "DEBUG";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
class Logger {
    constructor() {
        this.logDir = path_1.default.join(process.cwd(), 'logs');
        this.ensureLogDirectory();
    }
    ensureLogDirectory() {
        if (!fs_1.default.existsSync(this.logDir)) {
            fs_1.default.mkdirSync(this.logDir, { recursive: true });
        }
    }
    formatMessage(level, message, meta) {
        const timestamp = new Date().toISOString();
        const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
        return `[${timestamp}] ${level}: ${message}${metaStr}\n`;
    }
    writeToFile(filename, message) {
        const filePath = path_1.default.join(this.logDir, filename);
        fs_1.default.appendFileSync(filePath, message);
    }
    log(level, message, meta) {
        const formattedMessage = this.formatMessage(level, message, meta);
        console.log(formattedMessage.trim());
        if (process.env.NODE_ENV === 'production') {
            const filename = `${new Date().toISOString().split('T')[0]}.log`;
            this.writeToFile(filename, formattedMessage);
        }
    }
    error(message, meta) {
        this.log(LogLevel.ERROR, message, meta);
    }
    warn(message, meta) {
        this.log(LogLevel.WARN, message, meta);
    }
    info(message, meta) {
        this.log(LogLevel.INFO, message, meta);
    }
    debug(message, meta) {
        if (process.env.NODE_ENV === 'development') {
            this.log(LogLevel.DEBUG, message, meta);
        }
    }
}
exports.logger = new Logger();
//# sourceMappingURL=logger.js.map