<template>
	<view>
		<view class="order-box" v-if="order">
			<view class="bg-white">
				<view class="section">
					<list-cell :hover="false" padding="50rpx 30rpx">
						<view class="w-100 d-flex flex-column">
							<view class="d-flex align-items-center just-content-center" v-if="order.type == 0">
								<view class="redtxt">取餐号：{{ order.pick_up_number }}</view>
							</view>
							<view class="d-flex align-items-center just-content-center" v-if="order.type == 1">
								<view class="redtxt">配送中：美团配送</view>
							</view>
							<!-- steps begin -->
							<view class="d-flex just-content-center">
								<view class="steps d-flex flex-column" :class="{'w-80': order.type == 0, 'w-100': order.type== 1}">
									<view class="steps__text-column">
										<view class="steps__text-column-item">
											<view class="steps__text-column-item-text">
												{{ formatOrderState(order.status) }}
											</view>
										</view>
									</view>
								</view>
							</view>
							<!-- steps end -->
							<!-- goods begin -->
							<view class="w-100 d-flex flex-column position-relative mt-30" style="margin-bottom: -40rpx;">
								<view class="w-100 d-flex align-items-center mb-40" v-for="(good, index) in goods" :key="good._id">
									<view class="d-flex flex-column w-60 overflow-hidden">
										<view class="font-size-lg text-color-base mb-10 text-truncate">{{ good.goods_name }}</view>
									</view>
									<view class="d-flex w-40 align-items-center justify-content-between pl-30">
										<view class="font-size-base text-color-base">x{{ good.num }}</view>
										<view class="font-size-base text-color-base font-weight-bold">￥{{ good.price/100 }}</view>
									</view>
								</view>
							</view>
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
							<view>取餐店铺</view>
							<view class="font-weight-bold">{{ order.store[0].name }}</view>
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
				order: undefined, //订单
				goods: [], //订单中的商品
			}
		},
		async onLoad(option) {
			if (option.orderId) {
				const db = uniCloud.database()

				const order = db.collection('uni-id-base-order').where("_id=='" + option.orderId + "'").limit(1).getTemp()
				const res = await db.collection(order, 'wfy-shop').get()
				console.log('order', res)
				if (res.result.code == 0) {
					this.order = res.result.data[0]

					const goods = await db.collection('wfy-order-goods').where("order_id=='" + option.orderId + "'").get()
					console.log('goods', goods)
					if (goods.result.code == 0) {
						this.goods = goods.result.data
					}
				}
			}
		},
		methods: {
			formatDateTime(date) {
				return util.formatDate(date)
			},
			formatOrderState(status) {
				switch (status) {
					case 1:
						return '待付款'
						break
					case 2:
						return '已付款'
						break
					case 3:
						return '已完成'
						break
					case 4:
						return '退款审核中'
						break
					case 5:
						return '退款中'
						break
					case 6:
						return '已退款'
						break
					case -1:
						return '已取消付款/退款'
						break
					case -2:
						return '退款拒绝'
						break
					case -3:
						return '退款失败'
						break
					default:
						return '未知'
						break
				}
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
		color: #ff557f;
		font-weight: bold;
		font-size: 24px;
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
