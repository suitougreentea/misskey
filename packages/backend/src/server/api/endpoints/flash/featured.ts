/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Inject, Injectable } from '@nestjs/common';
import type { FlashsRepository } from '@/models/_.js';
import { Endpoint } from '@/server/api/endpoint-base.js';
import { FlashEntityService } from '@/core/entities/FlashEntityService.js';
import { DI } from '@/di-symbols.js';
import { RoleService } from '@/core/RoleService.js';
import { ApiError } from '../../error.js';
import { FlashService } from '@/core/FlashService.js';

export const meta = {
	tags: ['flash'],

	requireCredential: false,

	res: {
		type: 'array',
		optional: false, nullable: false,
		items: {
			type: 'object',
			optional: false, nullable: false,
			ref: 'Flash',
		},
	},

	errors: {
		unavailable: {
			message: 'Search of featured flashes unavailable.',
			code: 'UNAVAILABLE',
			id: '1a590c75-91ed-4e18-8765-8fecde49be85',
		},
	},
} as const;

export const paramDef = {
	type: 'object',
	properties: {
		offset: { type: 'integer', minimum: 0, default: 0 },
		limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
	},
	required: [],
} as const;

@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> { // eslint-disable-line import/no-default-export
	constructor(
		private flashService: FlashService,
		private flashEntityService: FlashEntityService,
		private roleService: RoleService,
	) {
		super(meta, paramDef, async (ps, me) => {
			const serverPolicies = await this.roleService.getUserPolicies(null);
			if (serverPolicies.simpleMode) {
				throw new ApiError(meta.errors.unavailable);
			}

			const result = await this.flashService.featured({
				offset: ps.offset,
				limit: ps.limit,
			});
			return await this.flashEntityService.packMany(result, me);
		});
	}
}
