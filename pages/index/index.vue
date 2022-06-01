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
					<image src="/static/images/index/ddqc.png" class="icon"></image>
					<view class="title">到店取餐</view>
				</view>
				<view class="item" @tap="gotoFreshList">
					<image src="/static/images/index/sxcp.png" class="icon"></image>
					<view class="title">锁鲜产品</view>
				</view>
			</view>

			<!--
			<view class="info" @tap="gotoFreshList">
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
			-->

			<view class="navigators">
				<view class="left">
					<view class="grid flex-column just-content-center" @tap="gotoUserCenter">
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
					<view class="tea-activity" @tap="viewPic_1">
						<image src="/static/images/index/mcsb.png" class="mark-img"></image>
						<view>{{tupian_1.value}}</view>
						<view class="right-img">
							<image src="/static/images/index/mcsb_bg.png" mode="widthFix"></image>
						</view>
					</view>
					<view class="member-gifts" @tap="viewPic_2">
						<image src="/static/images/index/hyjb.png" class="mark-img"></image>
						<view>{{tupian_2.value}}</view>
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

	export default {
		data() {
			return {
				banners: [],
				tupian_1: undefined,
				tupian_2: undefined,
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

			//右侧两个图片
			db.collection('wfy-system-parameter').where("name=='图片一' || name=='图片二'").get().then((r) => {
				console.log('wfy-system-parameter', r)
				if (r.result.code == 0) {
					for (let i = 0; i < r.result.data.length; i++) {
						if (r.result.data[i].name == '图片一') {
							this.tupian_1 = r.result.data[i]
						} else if (r.result.data[i].name == '图片二') {
							this.tupian_2 = r.result.data[i]
						}
					}
				}
			})
		},
		methods: {
			takein() {
				if (this.orderType != 'takein') {
					this.$store.commit('CLEAR_CART', undefined)
				}
				this.$store.commit('SET_ORDER_TYPE', 'takein')
				uni.navigateTo({
					url: '/pages/menu/menu'
				})
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
			gotoUserCenter() {
				uni.navigateTo({
					url: '/pages/ucenter/userinfo/userinfo'
				})
			},
			viewPic_1() {
				uni.navigateTo({
					url: './tuancan/tuancan?name=图片一'
				})
			},
			viewPic_2() {
				uni.navigateTo({
					url: './tuancan/tuancan?name=图片二'
				})
			},
			gotoFreshList() {
				uni.navigateTo({
					url: '/pages/menu/menu?isFresh=1'
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
