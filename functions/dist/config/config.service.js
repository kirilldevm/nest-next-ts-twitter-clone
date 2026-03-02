"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
const configService = (0, config_1.registerAs)('config', () => ({
    port: process.env.PORT ?? 3000,
}));
exports.default = configService;
//# sourceMappingURL=config.service.js.map