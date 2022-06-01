<template>
	<view class="center">
		<image v-if="tuanCanPic" mode="widthFix" :src="tuanCanPic" @tap="viewPic"></image>
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
			//2022-5-31：用于团餐及加盟图片加载显示
			let name = option.name
			const db = uniCloud.database();
			db.collection('wfy-system-parameter').where("name=='" + name + "'").limit(1).get().then((r) => {
				console.log('wfy-system-parameter', r)
				if (r.result.code == 0) {
					this.tuanCanPic = r.result.data[0].image.url
				}
			})
		},
		methods: {
			viewPic() {
				uni.previewImage({
					urls: [this.tuanCanPic]
				})
			}
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

	.center>image {
		width: 100% !important;
		position: relative;
	}
</style>
