<template>
<div class="rsqzvsbo">
	<div>This is an alternative entrance screen.</div>
	<MkButton class="mainAction" full rounded data-cy-signin @click="signin()">{{ i18n.ts.login }}</MkButton>
</div>
</template>

<script lang="ts" setup>
import { } from 'vue';
import XSigninDialog from '@/components/MkSigninDialog.vue';
import MkButton from '@/components/MkButton.vue';
import * as os from '@/os';
import { i18n } from '@/i18n';

function signin() {
	os.popup(XSigninDialog, {
		autoSet: true,
	}, {}, 'closed');
}
</script>

<style lang="scss" scoped>
.rsqzvsbo {
	height: 100vh;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;

	> .mainAction {
		line-height: 28px;
	}
}
</style>
