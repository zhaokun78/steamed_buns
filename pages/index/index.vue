<template>
	<view class="container">
		<swiper autoplay=true>
			<swiper-item v-for="(item,index) in banners" :key="item._id">
				<view class="banner">
					<image :src="item.bannerfile.url" mode="aspectFill" class="bg"></image>
				</view>
			</swiper-item>
		</swiper>
		<view class="content">
			<view class="entrance">
				<view class="item" @tap="takein">
					<image src="/static/images/index/zq.png" class="icon"></image>
					<view class="title">到店取餐</view>
				</view>
				<view class="item" @tap="takeout">
					<image src="/static/images/index/wm.png" class="icon"></image>
					<view class="title">给您送去</view>
				</view>
			</view>
			<view class="info">
				<image class="logo-img" mode="widthFix" src="@/static/images/index/fresh.gif"></image>
				<view class="integral_section">
					<view class="top">
						<text class="title">锁鲜产品</text>
					</view>
					<view class="bottom">
						<text>短保锁鲜装，看得到的新鲜</text>
					</view>
				</view>
			</view>
			<view class="navigators">
				<view class="left">
					<view class="grid flex-column just-content-center">
						<view class="d-flex align-items-center">
							<image src="/static/images/index/csc.png" class="mark-img"></image>
							<view class="font-size-sm text-color-base">会员中心</view>
						</view>
						<view class="text-color-assist" style="margin-left: 40rpx; font-size: 20rpx;"></view>
					</view>
					<view class="grid justify-content-end align-items-end">
						<image src="/static/images/index/yzclh.png" class="yzclh-img" mode="heightFix"></image>
					</view>
				</view>
				<view class="right">
					<view class="tea-activity" @tap="viewTuanCanPic">
						<image src="/static/images/index/mcsb.png" class="mark-img"></image>
						<view>团餐</view>
						<view class="right-img">
							<image src="/static/images/index/mcsb_bg.png" mode="widthFix"></image>
						</view>
					</view>
					<view class="member-gifts" @tap="packages">
						<image src="/static/images/index/hyjb.png" class="mark-img"></image>
						<view>加盟</view>
						<view class="right-img">
							<image src="/static/images/index/hyjb_bg.png" mode="widthFix"></image>
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		mapState,
		mapGetters
	} from 'vuex';

	import Gps from '@/uni_modules/json-gps/js_sdk/gps.js';
	const gps = new Gps()

	import util from '@/common/util'

	export default {
		data() {
			return {
				banners: [],
			}
		},
		computed: {
			...mapState(['orderType']),
			...mapGetters({
				userInfo: 'user/info',
				hasLogin: 'user/hasLogin'
			}),
		},
		onLoad() {
			const db = uniCloud.database();

			//加载轮播图
			db.collection('opendb-banner').get().then((r) => {
				console.log('opendb-banner', r)
				if (r.result.code == 0) {
					this.banners = r.result.data
				}
			})
		},
		onShow() {
			this.getLocation()
		},
		methods: {
			async getLocation() {
				uni.showLoading({
					title: "获取定位中"
				})

				//获取用户当前定位
				let location = await gps.getLocation({
					geocode: true
				})
				console.log('location', location)
				if (location) {
					//根据坐标逆向位置信息
					let res = await util.reverseGeocoder(location)
					console.log('reverseGeocoder', res)
					uni.setStorage({
						key: 'my_location',
						data: res,
						success: function() {
							console.log('set my_location success')
						},
					})
				}

				uni.hideLoading()
			},
			takein() {
				//判断是否已定位
				//let my_location = uni.getStorageSync('my_location')
				//if (my_location) {
				if (this.orderType != 'takein') {
					this.$store.commit('CLEAR_CART', undefined)
				}
				this.$store.commit('SET_ORDER_TYPE', 'takein')
				uni.navigateTo({
					url: '/pages/menu/menu'
				})
				//} else {
				//this.getLocation()
				//}
			},
			takeout() {
				if (this.orderType != 'takeout') {
					this.$store.commit('CLEAR_CART', undefined)
				}
				this.$store.commit('SET_ORDER_TYPE', 'takeout')
				uni.navigateTo({
					url: "/pages/address/address?is_choose=true"
				})
			},
			viewTuanCanPic() {
				uni.navigateTo({
					url: './tuancan/tuancan'
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	/* #ifdef H5 */
	page {
		height: auto;
		min-height: 100%;
	}

	/* #endif */

	.banner {
		position: relative;
		width: 100%;
		height: 400rpx;

		.bg {
			width: 100%;
			height: 400rpx;
		}

		.intro {
			position: absolute;
			top: calc(50rpx + var(--status-bar-height));
			left: 40rpx;
			color: #FFFFFF;
			display: flex;
			flex-direction: column;

			.greet {
				font-size: $font-size-lg;
				margin-bottom: 10rpx;
			}

			.note {
				font-size: $font-size-sm;
			}
		}
	}

	.content {
		padding: 0 30rpx;
	}

	.entrance {
		position: relative;
		margin-top: -40rpx;
		margin-bottom: 30rpx;
		border-radius: 10rpx;
		background-color: #ffffff;
		box-shadow: $box-shadow;
		padding: 30rpx 0;
		display: flex;
		align-items: center;
		justify-content: center;

		.item {
			flex: 1;
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			position: relative;

			&:nth-child(1):after {
				content: '';
				position: absolute;
				width: 1rpx;
				background-color: #ddd;
				right: 0;
				height: 100%;
				transform: scaleX(0.5) scaleY(0.8);
			}

			.icon {
				width: 84rpx;
				height: 84rpx;
				margin: 20rpx;
			}

			.title {
				font-size: 40rpx;
				color: $text-color-base;
				font-weight: 600;
			}
		}
	}

	.info {
		position: relative;
		margin-bottom: 30rpx;
		border-radius: 10rpx;
		background-color: #ffffff;
		box-shadow: $box-shadow;
		padding: 30rpx;
		display: flex;
		align-items: center;
		justify-content: center;

		.integral_section {
			flex: 1;
			display: flex;
			flex-direction: column;
			justify-content: center;

			.top {
				display: flex;
				align-items: center;

				.title {
					color: $text-color-base;
					font-size: 40rpx;
					font-weight: bold;
					margin-right: 10rpx;
				}

				.value {
					font-size: 44rpx;
					font-weight: bold;
				}
			}

			.bottom {
				font-size: $font-size-sm;
				color: $text-color-assist;
				display: flex;
				align-items: center;
			}
		}

		.qrcode_section {
			color: $color-primary;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			font-size: $font-size-sm;

			image {
				width: 40rpx;
				height: 40rpx;
				margin-bottom: 10rpx;
			}
		}
	}

	.navigators {
		width: 100%;
		margin-bottom: 20rpx;
		border-radius: 10rpx;
		background-color: #ffffff;
		box-shadow: $box-shadow;
		padding: 20rpx;
		display: flex;
		align-items: stretch;

		.left {
			width: 340rpx;
			margin-right: 20rpx;
			display: flex;
			padding: 0 20rpx;
			flex-direction: column;
			font-size: $font-size-sm;
			color: $text-color-base;
			background-color: #F2F2E6;

			.grid {
				height: 50%;
				display: flex;
			}
		}

		.right {
			width: 290rpx;
			display: flex;
			flex-direction: column;

			.tea-activity,
			.member-gifts {
				width: 100%;
				display: flex;
				padding: 20rpx;
				font-size: $font-size-sm;
				color: $text-color-base;
				align-items: center;
				position: relative;
			}

			.tea-activity {
				background-color: #FDF3F2;
				margin-bottom: 20rpx;
			}

			.member-gifts {
				background-color: #FCF6D4;
			}

			.right-img {
				flex: 1;
				position: relative;
				margin-left: 20rpx;
				margin-right: -20rpx;
				margin-bottom: -20rpx;
				display: flex;
				align-items: flex-end;

				image {
					width: 100%;
				}
			}
		}

		.mark-img {
			width: 30rpx;
			height: 30rpx;
			margin-right: 10rpx;
		}

		.yzclh-img {
			height: 122.96rpx;
			width: 214.86rpx;
		}
	}

	.member-news {
		width: 100%;
		margin-bottom: 30rpx;

		.header {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 20rpx 0;

			.title {
				font-size: $font-size-lg;
				font-weight: bold;
			}

			.iconfont {
				font-size: 52rpx;
				color: $text-color-assist;
			}
		}

		.list {
			width: 100%;
			display: flex;
			flex-direction: column;

			.item {
				width: 100%;
				height: 240rpx;
				position: relative;

				image {
					width: 100%;
					height: 100%;
					border-radius: 8rpx;
				}

				.title {
					position: relative;
					font-size: 32rpx;
					font-weight: 500;
					width: 100%;
					top: -70rpx;
					left: 16rpx;
					color: #ffffff;
				}
			}
		}
	}

	.logo-img {
		width: 200rpx;
		// height: 100rpx;
		// border-radius: 100rpx;
	}
</style>
