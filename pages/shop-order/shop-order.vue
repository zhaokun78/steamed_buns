<template>
	<view>
		<uni-segmented-control :current="curTabIndex" :values="tabItems" @clickItem="onClickTab" styleType="text" activeColor="#00e26d">
		</uni-segmented-control>

	</view>
</template>

<script>
	export default {
		data() {
			return {
				curTabIndex: 0,
				tabItems: ['已付款', '取餐中', '配送中', '已完成'],
			}
		},
		methods: {
			onClickTab(e) {
				this.curTabIndex = e.currentIndex
			},

		}
	}
</script>

<style>

</style>
