"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Reaction = exports.ReactionType = exports.ReactionTargetType = void 0;
var ReactionTargetType;
(function (ReactionTargetType) {
    ReactionTargetType["POST"] = "post";
    ReactionTargetType["COMMENT"] = "comment";
})(ReactionTargetType || (exports.ReactionTargetType = ReactionTargetType = {}));
var ReactionType;
(function (ReactionType) {
    ReactionType["LIKE"] = "like";
    ReactionType["DISLIKE"] = "dislike";
})(ReactionType || (exports.ReactionType = ReactionType = {}));
class Reaction {
    id;
    userId;
    targetType;
    targetId;
    type;
    createdAt;
}
exports.Reaction = Reaction;
//# sourceMappingURL=reaction.entity.js.map