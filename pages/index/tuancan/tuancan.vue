<template>
	<view class="center">
		<image v-if="tuanCanPic" mode="widthFix" :src="tuanCanPic"></image>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				tuanCanPic: undefined, //团餐图片
			}
		},
		onLoad(option) {
			const db = uniCloud.database();
			//加载团餐图片
			db.collection('wfy-system-parameter').where("name=='团餐'").limit(1).get().then((r) => {
				console.log('wfy-system-parameter', r)
				if (r.result.code == 0) {
					this.tuanCanPic = r.result.data[0].image.url
				}
			})
		},
		methods: {

		}
	}
</script>

<style>
	.center {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;

	}

	.center > image {
		width: 100% !important;
		position: relative;
	}
</style>
