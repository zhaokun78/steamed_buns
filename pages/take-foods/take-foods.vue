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
			<view class="order-box" v-for="(order,index) in paidOrders" :key="item._id">
				<view class="bg-white">
					<view class="section">
						<!-- store info begin -->
						<list-cell :hover="false">
							<view class="w-100 d-flex align-items-center">
								<view class="d-flex flex-column w-60">
									<view class="w-100 text-color-base">{{ order.store[0].name }}</view>
								</view>
								<view class="d-flex justify-content-end align-items-center w-40">
									<image src="/static/images/order/navigation.png" style="width: 60rpx; height: 60rpx;"></image>
								</view>
							</view>
						</list-cell>
						<!-- store info end -->
						<list-cell :hover="false" padding="50rpx 30rpx">
							<view class="w-100 d-flex flex-column">
								<view class="d-flex align-items-center just-content-center" v-if="order.type == 0">
									<view class="sort-num">取餐号：{{ order.pick_up_number }}</view>
								</view>
								<!-- steps begin -->
								<view class="d-flex just-content-center">
									<view class="steps d-flex flex-column" :class="{'w-80': order.type == 0, 'w-100': order.type== 1}">
										<view class="steps__text-column">
											<view class="steps__text-column-item">
												<view class="steps__text-column-item-text">
													{{ order.type == 1 ? '配送中' : '请取餐' }}
												</view>
											</view>
										</view>
									</view>
								</view>
								<!-- steps end -->
								<!-- goods begin -->
								<!-- goods end -->
							</view>
						</list-cell>
					</view>
					<view class="section">
						<!-- payment and amount begin -->
						<list-cell :hover="false" padding="50rpx 30rpx">
							<view class="w-100 d-flex flex-column">
								<view class="pay-cell">
									<view>金额总计</view>
									<view class="font-weight-bold">￥{{ order.total_fee/100 }}</view>
								</view>
							</view>
						</list-cell>
						<!-- payment and amount end -->
					</view>
					<view class="section">
						<!-- order info begin -->
						<list-cell :hover="false" padding="50rpx 30rpx">
							<view class="w-100 d-flex flex-column">
								<view class="pay-cell">
									<view>下单时间</view>
									<view class="font-weight-bold">{{ formatDateTime(order.create_time) }}</view>
								</view>
								<view class="pay-cell">
									<view>订单号</view>
									<view class="font-weight-bold">{{ order._id }}</view>
								</view>
							</view>
						</list-cell>
						<!-- order info end -->
					</view>
					<!-- order other info begin -->
					<list-cell :hover="false" padding="50rpx 30rpx 20rpx" last>
						<view class="w-100 d-flex flex-column">
							<view class="pay-cell">
								<view>取餐号</view>
								<view class="font-weight-bold">{{ order.pick_up_number }}</view>
							</view>
							<view class="pay-cell">
								<view>取餐方式</view>
								<view class="font-weight-bold">{{order.type == 0? '自提':'外卖'}}</view>
							</view>
						</view>
					</list-cell>
					<!-- order other info end -->
				</view>
			</view>
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
				util.formatDateTime(date)
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
</style>
