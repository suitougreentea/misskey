/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Inject, Injectable } from '@nestjs/common';
import { Endpoint } from '@/server/api/endpoint-base.js';
import { UserEntityService } from '@/core/entities/UserEntityService.js';
import { DI } from '@/di-symbols.js';
import { UserSearchService } from '@/core/UserSearchService.js';
import { RoleService } from '@/core/RoleService.js';
import { ApiError } from '../../error.js';

export const meta = {
	tags: ['users'],

	requireCredential: false,
	requiredRolePolicy: 'canSearchUsers',

	description: 'Search for users.',

	res: {
		type: 'array',
		optional: false, nullable: false,
		items: {
			type: 'object',
			optional: false, nullable: false,
			ref: 'User',
		},
	},

	errors: {
		unavailable: {
			message: 'Search of users unavailable.',
			code: 'UNAVAILABLE',
			id: 'c16c40c0-a05e-4cc4-8d1e-332ab272cb69',
		},
	},
} as const;

export const paramDef = {
	type: 'object',
	properties: {
		query: { type: 'string' },
		offset: { type: 'integer', default: 0 },
		limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
		origin: { type: 'string', enum: ['local', 'remote', 'combined'], default: 'combined' },
		detail: { type: 'boolean', default: true },
	},
	required: ['query'],
} as const;

@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> { // eslint-disable-line import/no-default-export
	constructor(
		private userEntityService: UserEntityService,
		private userSearchService: UserSearchService,
		private roleService: RoleService,
	) {
		super(meta, paramDef, async (ps, me) => {
			const serverPolicies = await this.roleService.getUserPolicies(null);
			if (serverPolicies.simpleMode) {
				throw new ApiError(meta.errors.unavailable);
			}

			const users = await this.userSearchService.search(ps.query.trim(), me?.id ?? null, {
				offset: ps.offset,
				limit: ps.limit,
				origin: ps.origin,
			});

			return await this.userEntityService.packMany(users, me, { schema: ps.detail ? 'UserDetailed' : 'UserLite' });
		});
	}
}
