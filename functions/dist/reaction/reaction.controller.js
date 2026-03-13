"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReactionController = void 0;
const common_1 = require("@nestjs/common");
const auth_guard_1 = require("../auth/guard/auth.guard");
const set_reaction_dto_1 = require("./dto/set-reaction.dto");
const reaction_entity_1 = require("./entity/reaction.entity");
const reaction_service_1 = require("./reaction.service");
let ReactionController = class ReactionController {
    reactionService;
    constructor(reactionService) {
        this.reactionService = reactionService;
    }
    setReaction(req, dto) {
        return this.reactionService.setReaction(req.user.uid, dto.targetType, dto.targetId, dto.type);
    }
    getReaction(req, targetType, targetId) {
        if (!targetType || !targetId) {
            return { type: null };
        }
        if (targetType !== reaction_entity_1.ReactionTargetType.POST &&
            targetType !== reaction_entity_1.ReactionTargetType.COMMENT) {
            return { type: null };
        }
        return this.reactionService
            .getReaction(req.user.uid, targetType, targetId)
            .then((type) => ({ type }));
    }
};
exports.ReactionController = ReactionController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, set_reaction_dto_1.SetReactionDto]),
    __metadata("design:returntype", void 0)
], ReactionController.prototype, "setReaction", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('targetType')),
    __param(2, (0, common_1.Query)('targetId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], ReactionController.prototype, "getReaction", null);
exports.ReactionController = ReactionController = __decorate([
    (0, common_1.Controller)('reaction'),
    __metadata("design:paramtypes", [reaction_service_1.ReactionService])
], ReactionController);
//# sourceMappingURL=reaction.controller.js.map