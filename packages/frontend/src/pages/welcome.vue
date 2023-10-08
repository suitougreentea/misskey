<!--
SPDX-FileCopyrightText: syuilo and other misskey contributors
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
import { computed } from 'vue';
import { instance } from '@/instance';
import XSetup from './welcome.setup.vue';
import XEntranceA from './welcome.entrance.a.vue';
import XEntranceB from './welcome.entrance.b.vue';
import { instanceName } from '@/config.js';
import * as os from '@/os.js';
import { definePageMetadata } from '@/scripts/page-metadata.js';

let meta = $ref(null);

os.api('meta', { detail: true }).then(res => {
	meta = res;
});

const headerActions = $computed(() => []);

const headerTabs = $computed(() => []);

const alternativeEntrance = $ref(instance.policies?.simpleMode);

definePageMetadata(computed(() => ({
	title: instanceName,
	icon: null,
})));
</script>
