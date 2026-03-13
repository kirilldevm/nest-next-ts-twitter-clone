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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetReactionDto = void 0;
const class_validator_1 = require("class-validator");
const reaction_entity_1 = require("../entity/reaction.entity");
class SetReactionDto {
    targetId;
    targetType;
    type;
}
exports.SetReactionDto = SetReactionDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SetReactionDto.prototype, "targetId", void 0);
__decorate([
    (0, class_validator_1.IsIn)(Object.values(reaction_entity_1.ReactionTargetType)),
    __metadata("design:type", String)
], SetReactionDto.prototype, "targetType", void 0);
__decorate([
    (0, class_validator_1.IsIn)(Object.values(reaction_entity_1.ReactionType)),
    __metadata("design:type", String)
], SetReactionDto.prototype, "type", void 0);
//# sourceMappingURL=set-reaction.dto.js.map