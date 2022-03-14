<template>
	<view class="container">
		<view v-if="paidOrders.length==0" class="d-flex w-100 h-100 flex-column just-content-center align-items-center">
			<image src="/static/logo.jpg" class="drinks-img"></image>
			<view class="tips d-flex flex-column align-items-center font-size-base text-color-assist">
				<view>您还没有点单</view>
				<view>快去犒劳一下自己吧~</view>
			</view>
			<button type="primary" class="drink-btn" size="default" @tap="gotoMenu">去点餐</button>
			<view class="font-size-sm text-color-primary" @tap="gotoMyOrder">查看历史订单</view>
		</view>
		<template v-else>
			<uni-card v-for="(order,index) in paidOrders" :key="order._id" mode="title" :title="order.store[0].name"
				:subTitle="order.type == 0 ? '自提' : '外卖'" :extra="'合计：￥'+ order.total_fee/100" @click="selectStore(item)"
				shadow="10px 10px 3px 10px rgba(0, 0, 0, 0.08)" :isShadow="true" note="true">
				<view>
					<view>
						<text class="redtxt">{{order.type == 0 ? '取餐号：'+order.pick_up_number:'配送中'}}</text>
					</view>
					<view>
						<text class="txt">下单时间：{{ formatDateTime(order.create_time) }}</text>
					</view>
				</view>
				<template v-slot:footer>
					<view class="footer-box">
						<view>
							<image src='/static/images/mine/stxy.png' style="width: 30rpx; height: 30rpx;" class="mr-10"></image>
							<text class="footer-box__item">收藏店铺</text>
						</view>
						<view @tap="navigationToStore(item)">
							<image src='/static/images/mine/shdz.png' style="width: 30rpx; height: 30rpx;" class="mr-10"></image>
							<text class="footer-box__item">店铺导航</text>
						</view>
					</view>
				</template>
			</uni-card>
		</template>
	</view>
</template>

<script>
	import listCell from '@/components/list-cell/list-cell'
	import util from '@/common/util'
	export default {
		components: {
			listCell
		},
		data() {
			return {
				paidOrders: [], //本人所有“已付款”订单
			}
		},
		methods: {
			async onShow() {
				const db = uniCloud.database()

				//本人的所有已付款自提订单
				const order = db.collection('uni-id-base-order').where('user_id==$cloudEnv_uid && status==2 && type==0').getTemp()
				const res = await db.collection(order, 'wfy-shop').get()
				console.log('uni-id-base-order', res)
				if (res.result.code == 0) {
					this.paidOrders = res.result.data
				}
			},
			formatDateTime(date) {
				return util.formatDate(date)
			},
			gotoMenu() {
				uni.switchTab({
					url: '/pages/menu/menu'
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	/* #ifdef H5 */
	page {
		min-height: 100%;
		background-color: $bg-color;
	}

	/* #endif */
	.order-box {
		padding: 20rpx;
		/* #ifdef H5 */
		margin-bottom: 100rpx;
		/* #endif */
	}

	.drinks-img {
		width: 260rpx;
		height: 260rpx;
	}

	.tips {
		margin: 60rpx 0 80rpx;
		line-height: 48rpx;
	}

	.drink-btn {
		width: 320rpx;
		border-radius: 50rem !important;
		margin-bottom: 40rpx;
		font-size: $font-size-base;
		line-height: 3.0;
	}

	@mixin arch {
		content: "";
		position: absolute;
		background-color: $bg-color;
		width: 30rpx;
		height: 30rpx;
		bottom: -15rpx;
		z-index: 10;
		border-radius: 100%;
	}

	.section {
		position: relative;

		&::before {
			@include arch;
			left: -15rpx;
		}

		&::after {
			@include arch;
			right: -15rpx;
		}
	}

	.pay-cell {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-size: $font-size-base;
		color: $text-color-base;
		margin-bottom: 40rpx;

		&:nth-last-child(1) {
			margin-bottom: 0;
		}
	}

	.sort-num {
		font-size: 64rpx;
		font-weight: bold;
		color: $text-color-base;
		line-height: 2;
	}

	.steps__img-column {
		display: flex;
		margin: 30rpx 0;

		.steps__img-column-item {
			flex: 1;
			display: flex;
			align-items: center;
			justify-content: center;

			image {
				width: 80rpx;
				height: 80rpx;
			}
		}
	}

	.steps__text-column {
		display: flex;
		margin-bottom: 40rpx;

		.steps__text-column-item {
			flex: 1;
			display: inline-flex;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: $font-size-base;
			color: $text-color-assist;

			&.active {
				color: $text-color-base;
				font-weight: bold;

				.steps__column-item-line {
					background-color: $text-color-base;
				}
			}

			.steps__column-item-line {
				flex: 1;
				height: 2rpx;
				background-color: #919293;
				transform: scaleY(0.5);
			}

			.steps__text-column-item-text {
				margin: 0 8px;
			}
		}
	}

	.redtxt {
		color: red;
		font-weight: bold;
		font-size: 20px;
	}

	.txt {
		font-size: 12px;
	}

	.footer-box {
		/* #ifndef APP-NVUE */
		display: flex;
		/* #endif */
		justify-content: space-between;
		flex-direction: row;
	}

	.footer-box__item {
		align-items: center;
		padding: 2px 0;
		font-size: 12px;
		color: #666;
	}
</style>
