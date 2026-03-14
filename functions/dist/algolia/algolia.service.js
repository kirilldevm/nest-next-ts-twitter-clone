"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlgoliaService = void 0;
const common_1 = require("@nestjs/common");
const algoliasearch_1 = require("algoliasearch");
let AlgoliaService = class AlgoliaService {
    get client() {
        const appId = process.env.ALGOLIA_APP_ID;
        const apiKey = process.env.ALGOLIA_ADMIN_API_KEY;
        if (!appId || !apiKey) {
            throw new Error('Algolia is not configured. Set ALGOLIA_APP_ID and ALGOLIA_ADMIN_API_KEY.');
        }
        return (0, algoliasearch_1.algoliasearch)(appId, apiKey);
    }
    get indexName() {
        return process.env.ALGOLIA_INDEX_NAME ?? 'posts';
    }
    async searchPosts(query, options) {
        const page = Math.max(0, options?.page ?? 0);
        const hitsPerPage = Math.min(50, Math.max(1, options?.limit ?? 10));
        const result = await this.client.searchSingleIndex({
            indexName: this.indexName,
            searchParams: {
                query,
                page,
                hitsPerPage,
                attributesToRetrieve: [
                    'objectID',
                    'authorId',
                    'title',
                    'text',
                    'photoURL',
                    'createdAt',
                    'likesCount',
                    'dislikesCount',
                    'commentsCount',
                ],
            },
        });
        const items = (result.hits ?? []).map((hit) => this.mapHitToPost(hit));
        const totalPages = result.nbPages ?? 0;
        const nextPage = page + 1 < totalPages ? page + 1 : null;
        return {
            items,
            nextPage,
            totalHits: result.nbHits,
        };
    }
    mapHitToPost(hit) {
        const createdAt = hit.createdAt;
        const safeStr = (v) => v != null && (typeof v === 'string' || typeof v === 'number')
            ? String(v)
            : '';
        let date = new Date();
        if (createdAt != null) {
            if (typeof createdAt === 'number') {
                date =
                    createdAt > 1e12 ? new Date(createdAt) : new Date(createdAt * 1000);
            }
            else if (typeof createdAt === 'string') {
                date = new Date(createdAt);
            }
            else if (typeof createdAt === 'object' && createdAt !== null) {
                const obj = createdAt;
                const seconds = obj.seconds ?? obj._seconds;
                if (typeof seconds === 'number') {
                    date = new Date(seconds * 1000);
                }
                else if ('toDate' in obj && typeof obj.toDate === 'function') {
                    date = obj.toDate();
                }
                else {
                    date = new Date(safeStr(createdAt));
                }
            }
        }
        return {
            id: safeStr(hit.objectID ?? hit.id),
            authorId: safeStr(hit.authorId),
            title: safeStr(hit.title),
            text: safeStr(hit.text),
            photoURL: hit.photoURL ?? null,
            createdAt: date,
            likesCount: Number(hit.likesCount ?? 0),
            dislikesCount: Number(hit.dislikesCount ?? 0),
            commentsCount: Number(hit.commentsCount ?? 0),
        };
    }
};
exports.AlgoliaService = AlgoliaService;
exports.AlgoliaService = AlgoliaService = __decorate([
    (0, common_1.Injectable)()
], AlgoliaService);
//# sourceMappingURL=algolia.service.js.map