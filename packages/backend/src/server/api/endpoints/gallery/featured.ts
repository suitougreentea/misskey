/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Inject, Injectable } from '@nestjs/common';
import { Endpoint } from '@/server/api/endpoint-base.js';
import type { GalleryPostsRepository } from '@/models/_.js';
import { GalleryPostEntityService } from '@/core/entities/GalleryPostEntityService.js';
import { DI } from '@/di-symbols.js';
import { FeaturedService } from '@/core/FeaturedService.js';
import { RoleService } from '@/core/RoleService.js';
import { ApiError } from '../../error.js';

export const meta = {
	tags: ['gallery'],

	requireCredential: false,

	res: {
		type: 'array',
		optional: false, nullable: false,
		items: {
			type: 'object',
			optional: false, nullable: false,
			ref: 'GalleryPost',
		},
	},

	errors: {
		unavailable: {
			message: 'Search of featured gallery unavailable.',
			code: 'UNAVAILABLE',
			id: '8da529fa-3eda-45d0-9ad3-35db1b0ded58',
		},
	},
} as const;

export const paramDef = {
	type: 'object',
	properties: {
		limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
		untilId: { type: 'string', format: 'misskey:id' },
	},
	required: [],
} as const;

@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> { // eslint-disable-line import/no-default-export
	private galleryPostsRankingCache: string[] = [];
	private galleryPostsRankingCacheLastFetchedAt = 0;

	constructor(
		@Inject(DI.galleryPostsRepository)
		private galleryPostsRepository: GalleryPostsRepository,

		private galleryPostEntityService: GalleryPostEntityService,
		private featuredService: FeaturedService,
		private roleService: RoleService,
	) {
		super(meta, paramDef, async (ps, me) => {
			const serverPolicies = await this.roleService.getUserPolicies(null);
			if (serverPolicies.simpleMode) {
				throw new ApiError(meta.errors.unavailable);
			}

			let postIds: string[];
			if (this.galleryPostsRankingCacheLastFetchedAt !== 0 && (Date.now() - this.galleryPostsRankingCacheLastFetchedAt < 1000 * 60 * 30)) {
				postIds = this.galleryPostsRankingCache;
			} else {
				postIds = await this.featuredService.getGalleryPostsRanking(100);
				this.galleryPostsRankingCache = postIds;
				this.galleryPostsRankingCacheLastFetchedAt = Date.now();
			}

			postIds.sort((a, b) => a > b ? -1 : 1);
			if (ps.untilId) {
				postIds = postIds.filter(id => id < ps.untilId!);
			}
			postIds = postIds.slice(0, ps.limit);

			if (postIds.length === 0) {
				return [];
			}

			const query = this.galleryPostsRepository.createQueryBuilder('post')
				.where('post.id IN (:...postIds)', { postIds: postIds });

			const posts = await query.getMany();

			return await this.galleryPostEntityService.packMany(posts, me);
		});
	}
}
