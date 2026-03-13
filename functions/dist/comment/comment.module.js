"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentModule = void 0;
const common_1 = require("@nestjs/common");
const post_module_1 = require("../post/post.module");
const comment_author_guard_1 = require("./guard/comment-author.guard");
const comment_controller_1 = require("./comment.controller");
const comment_repository_1 = require("./repository/comment.repository");
const comment_service_1 = require("./comment.service");
let CommentModule = class CommentModule {
};
exports.CommentModule = CommentModule;
exports.CommentModule = CommentModule = __decorate([
    (0, common_1.Module)({
        imports: [post_module_1.PostModule],
        controllers: [comment_controller_1.CommentController],
        providers: [comment_service_1.CommentService, comment_repository_1.CommentRepository, comment_author_guard_1.CommentAuthorGuard],
        exports: [comment_service_1.CommentService, comment_repository_1.CommentRepository],
    })
], CommentModule);
//# sourceMappingURL=comment.module.js.map