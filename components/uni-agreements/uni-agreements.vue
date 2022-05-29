<template>
	<view class="root">
		<checkbox-group @change="setAgree" class="checkbox-group">
			<checkbox :checked="isAgree" style="transform: scale(0.7);" />
			<text>{{$t('common.agree')}}</text>
		</checkbox-group>
		<view class="item" v-for="(agreement,index) in agreements" :key="index">
			<text class="agreement" @click="navigateTo(agreement)">{{agreement.title}}</text>
			<text class="hint" v-if="hasAnd(agreements,index)">&</text>
		</view>
	</view>
</template>

<script>
	export default {
		name: "uni-agreements",
		computed: {
			agreements() {
				return getApp().globalData.config.about.agreements || []
			}
		},
		methods: {
			navigateTo({
				url,
				title
			}) {
				if (url.substr(-4) == '.pdf') {
					uni.showLoading({
						title: '请稍等'
					})
					uni.downloadFile({
						url: url,
						success: function(res) {
							uni.openDocument({
								filePath: res.tempFilePath,
								showMenu: true,
								success: function(res) {
									console.log('打开文档成功');
								},
								fail: function(err) {
									console.log('打开文档失败', err)
								}
							});
						},
						fail: function(err) {
							uni.showModal({
								showCancel: false,
								title: '失败',
								content: '下载PDF出错'
							})
						},
						complete: function() {
							uni.hideLoading()
						}
					})
				} else {
					uni.navigateTo({
						url: '/pages/common/webview/webview?url=' + url + '&title=' + title,
						success: res => {},
						fail: () => {},
						complete: () => {}
					});
				}
			},
			hasAnd(agreements, index) {
				return agreements.length - 1 > index
			},
			setAgree(e) {
				this.isAgree = !this.isAgree
				this.$emit('setAgree', this.isAgree)
			}
		},
		created() {
			uni.$on('setAgreementsAgree', state => {
				console.log('setAgreementsAgree', state);
				this.isAgree = state
				this.$emit('setAgree', state)
			})
		},
		data() {
			return {
				isAgree: false
			};
		}
	}
</script>

<style lang="scss" scoped>
	/* #ifndef APP-NVUE */
	view {
		display: flex;
		box-sizing: border-box;
		flex-direction: column;
	}

	/* #endif */
	.root {
		flex-direction: row;
		align-items: center;
		font-size: 28rpx;
		color: #8a8f8b;
	}

	.checkbox-group {
		align-items: center;
		display: flex;
		flex-direction: row;
	}

	.item {
		flex-direction: row;
	}

	.agreement {
		color: #04498c;
	}
</style>
