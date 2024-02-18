<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div v-if="meta">
	<XSetup v-if="meta.requireSetup"/>
	<XEntranceB v-else-if="alternativeEntrance"/>
	<XEntranceA v-else/>
</div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import * as Misskey from 'misskey-js';
import XSetup from './welcome.setup.vue';
import XEntranceA from './welcome.entrance.a.vue';
import XEntranceB from './welcome.entrance.b.vue';
import { instance } from '@/instance.js';
import { instanceName } from '@/config.js';
import { misskeyApi } from '@/scripts/misskey-api.js';
import { definePageMetadata } from '@/scripts/page-metadata.js';

const meta = ref<Misskey.entities.MetaResponse | null>(null);

misskeyApi('meta', { detail: true }).then(res => {
	meta.value = res;
});

const headerActions = computed(() => []);

const headerTabs = computed(() => []);

const alternativeEntrance = ref(instance.policies?.simpleMode);

definePageMetadata(() => ({
	title: instanceName,
	icon: null,
}));
</script>
