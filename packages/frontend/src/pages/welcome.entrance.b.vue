<template>
<div v-if="meta" :class="$style.root">
	<img :src="instance.iconUrl || instance.faviconUrl || '/favicon.ico'" alt="" :class="$style.mainIcon"/>
	<h1 :class="$style.mainTitle">{{ instanceName }}</h1>
	<div :class="$style.mainAbout">
		<!-- eslint-disable-next-line vue/no-v-html -->
		<div v-html="meta.description || i18n.ts.headlineMisskey"></div>
	</div>
	<div :class="$style.spacer"></div>
	<MkButton :class="$style.mainAction" full rounded data-cy-signin @click="signin()">{{ i18n.ts.login }}</MkButton>
	<MkButton :class="[$style.mainAction, $style.hidden]" full rounded data-cy-signup @click="signup()">{{ i18n.ts.signup }}</MkButton>
</div>
</template>

<script lang="ts" setup>
import { } from 'vue';
import { Instance } from 'misskey-js/built/entities';
import XSigninDialog from '@/components/MkSigninDialog.vue';
import XSignupDialog from '@/components/MkSignupDialog.vue';
import MkButton from '@/components/MkButton.vue';
import * as os from '@/os';
import { i18n } from '@/i18n';
import { instance } from '@/instance';
import { instanceName } from '@/config';

let meta = $ref<Instance>();

os.api('meta', { detail: true }).then(_meta => {
	meta = _meta;
});

function signin() {
	os.popup(XSigninDialog, {
		autoSet: true,
	}, {}, 'closed');
}

function signup() {
	os.popup(XSignupDialog, {
		autoSet: true,
	}, {}, 'closed');
}
</script>

<style lang="scss" module>
.root {
	height: calc(100vh - 64px);
	padding: 32px;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
}

.mainIcon {
	width: 85px;
	margin-top: -47px;
	vertical-align: bottom;
	filter: drop-shadow(0 2px 5px rgba(0, 0, 0, 0.5));
}

.mainTitle {
	display: block;
	margin: 0;
	padding: 16px 32px 24px 32px;
	font-size: 1.4em;
}

.mainLogo {
	vertical-align: bottom;
	max-height: 120px;
	max-width: min(100%, 300px);
}

.mainAbout {
	padding: 0 32px;
}

.spacer {
	height: 32px;
}

.mainAction {
	line-height: 28px;
}

.hidden {
	display: none;
}
</style>
