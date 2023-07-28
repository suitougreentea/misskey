import { Inject, Injectable } from '@nestjs/common';
import type { PagesRepository } from '@/models/index.js';
import { Endpoint } from '@/server/api/endpoint-base.js';
import { PageEntityService } from '@/core/entities/PageEntityService.js';
import { DI } from '@/di-symbols.js';
import { RoleService } from '@/core/RoleService.js';
import { ApiError } from '../../error.js';

export const meta = {
	tags: ['pages'],

	requireCredential: false,

	res: {
		type: 'array',
		optional: false, nullable: false,
		items: {
			type: 'object',
			optional: false, nullable: false,
			ref: 'Page',
		},
	},

	errors: {
		unavailable: {
			message: 'Search of featured pages unavailable.',
			code: 'UNAVAILABLE',
			id: 'c8c17928-08a9-4bcb-aa5a-ae8701fa6672',
		},
	},
} as const;

export const paramDef = {
	type: 'object',
	properties: {},
	required: [],
} as const;

// eslint-disable-next-line import/no-default-export
@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> {
	constructor(
		@Inject(DI.pagesRepository)
		private pagesRepository: PagesRepository,

		private pageEntityService: PageEntityService,
		private roleService: RoleService,
	) {
		super(meta, paramDef, async (ps, me) => {
			const serverPolicies = await this.roleService.getUserPolicies(null);
			if (serverPolicies.simpleMode) {
				throw new ApiError(meta.errors.unavailable);
			}

			const query = this.pagesRepository.createQueryBuilder('page')
				.where('page.visibility = \'public\'')
				.andWhere('page.likedCount > 0')
				.orderBy('page.likedCount', 'DESC');

			const pages = await query.take(10).getMany();

			return await this.pageEntityService.packMany(pages, me);
		});
	}
}
