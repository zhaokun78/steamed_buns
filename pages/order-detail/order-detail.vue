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
								<view class="redtxt">{{formatOrderState(order)}}</view>
							</view>
							<!-- steps begin -->
							<view class="d-flex just-content-center" v-if="order.type==0">
								<view class="steps d-flex flex-column w-80">
									<view class="steps__text-column">
										<view class="steps__text-column-item">
											<view class="steps__text-column-item-text">
												{{ formatOrderState(order) }}
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
							<view class="pay-cell" v-if="order.paid_time">
								<view>付款时间</view>
								<view class="font-weight-bold">{{ formatDateTime(order.paid_time) }}</view>
							</view>
							<view class="pay-cell" v-if="order.refund_apply_time">
								<view>退款申请时间</view>
								<view class="font-weight-bold">{{ formatDateTime(order.refund_apply_time) }}</view>
							</view>
							<view class="pay-cell" v-if="order.refund_deny_time && order.status==-2">
								<view>退款拒绝时间</view>
								<view class="font-weight-bold">{{ formatDateTime(order.refund_deny_time) }}</view>
							</view>
							<view class="pay-cell" v-if="order.refund_deny_time && order.status==-3">
								<view>退款失败时间</view>
								<view class="font-weight-bold">{{ formatDateTime(order.refund_deny_time) }}</view>
							</view>
							<view class="pay-cell" v-if="order.refund_time">
								<view>退款完成时间</view>
								<view class="font-weight-bold">{{ formatDateTime(order.refund_time) }}</view>
							</view>
							<view class="pay-cell" v-if="order.accept_time">
								<view>接单时间</view>
								<view class="font-weight-bold">{{ formatDateTime(order.accept_time) }}</view>
							</view>
							<view class="pay-cell" v-if="order.close_time">
								<view>关闭时间</view>
								<view class="font-weight-bold">{{ formatDateTime(order.close_time) }}</view>
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
						<view class="pay-cell">
							<view>联系电话</view>
							<view class="font-weight-bold">{{order.user_mobile}}</view>
						</view>
						<view class="pay-cell" v-if="order.is_refund">
							<view>退款原因</view>
							<view class="font-weight-bold">{{order.refund_desc}}</view>
						</view>
						<view class="pay-cell"
							v-if="(order.status==2 || (order.type==0 && order.status==4 && goods[0].goods_id[0].category_id==freshGoodsCategoryId)) && userInfo._id==order.user_id">
							<button type="default" size="mini" @click="open">退款</button>
						</view>
						<uni-popup ref="popup" type="dialog">
							<uni-popup-dialog mode="base" title="退款原因" :duration="2000" :before-close="true" @close="close" @confirm="confirm">
								<uni-combox :candidates="refundReasons" placeholder="请选择或输入退款原因" v-model="reasonsTxt">
								</uni-combox>
							</uni-popup-dialog>
						</uni-popup>
						<block v-if="order.status==6 && userInfo._id==order.store[0].owner_id">
							<view class="pay-cell">
								<button type="default" size="mini" @click="acceptRefund">同意退款</button>
								<button type="default" size="mini" @click="denyRefund">拒绝退款</button>
							</view>
						</block>
					</view>
				</list-cell>
				<!-- order other info end -->
			</view>
		</view>
	</view>
</template>

<script>
	import {
		mapGetters
	} from 'vuex';
	import listCell from '@/components/list-cell/list-cell'
	import util from '@/common/util'
	export default {
		components: {
			listCell
		},
		computed: {
			...mapGetters({
				userInfo: 'user/info',
			}),
		},
		data() {
			return {
				order: undefined, //订单
				freshGoodsCategoryId: undefined, //锁鲜产品分类Id
				goods: [], //订单中的商品
				refundReasons: ["不想要了", "无货"],
				reasonsTxt: ''
			}
		},
		async onLoad(option) {
			if (option.orderId) {
				const db = uniCloud.database()
				let gcRes = await db.collection('wfy-goods-categories').where("name=='锁鲜'").limit(1).get()
				this.freshGoodsCategoryId = gcRes.result.data[0]._id

				const order = db.collection('uni-id-base-order').where("_id=='" + option.orderId + "'").limit(1).getTemp()
				const res = await db.collection(order, 'wfy-shop').get()
				console.log('order', res)
				if (res.result.code == 0) {
					this.order = res.result.data[0]

					const og = await db.collection('wfy-order-goods').where("order_id=='" + option.orderId + "'").getTemp()
					const goods = await db.collection(og, 'wfy-goods').get()
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
			formatOrderState(order) {
				return util.formatOrderState(order)
			},
			open() {
				this.$refs.popup.open()
			},
			close() {
				console.log('on close')
				this.$refs.popup.close()
				this.reasonsTxt = ''
			},
			async confirm() {
				console.log('on confirm')
				this.$refs.popup.close()

				this.reasonsTxt = this.reasonsTxt.trim()
				if (this.reasonsTxt == '') {
					uni.showModal({
						showCancel: false,
						title: '提示',
						content: '请选择或输入退款原因'
					})
					return
				}

				const db = uniCloud.database()

				//查询订单最新状态
				let order = await db.collection('uni-id-base-order').where("_id == '" + this.order._id + "'").limit(1).get()
				console.log('uni-id-base-order', order)
				if (order.result.code != 0) {
					return
				}

				if (order.result.data[0].status != 2) {
					uni.showModal({
						showCancel: false,
						content: '订单状态已改变，退款失败！',
						success: function(r) {
							if (r.confirm) {
								uni.switchTab({
									url: '/pages/index/index'
								})
							}
						}
					})
				} else {
					//修改订单
					let updateRes = await db.collection('uni-id-base-order').doc(this.order._id).update({
						status: 6,
						is_refund: true,
						refund_apply_time: new Date().getTime(),
						refund_desc: this.reasonsTxt
					})
					console.log('update uni-id-base-order', updateRes)
					uni.showModal({
						showCancel: false,
						content: '退款申请已提交，请等待审批',
						success: function(r) {
							if (r.confirm) {
								uni.switchTab({
									url: '/pages/index/index'
								})
							}
						}
					})
				}
			},
			acceptRefund() {
				let that = this
				uni.showModal({
					title: '确认',
					content: '确认同意退款吗?',
					success: function(res) {
						if (res.confirm) {
							uni.showLoading({
								title: '请稍等'
							})
							uniCloud.callFunction({
								name: 'refund',
								data: {
									outTradeNo: that.order._id
								}
							}).then((r) => {
								uni.hideLoading()
								console.log('call refund', r)
								if (r.result.code == 0) {
									uni.showModal({
										showCancel: false,
										title: '成功',
										content: '操作成功!',
										success: function(r1) {
											if (r1.confirm) {
												uni.navigateBack({
													delta: 1
												})
											}
										}
									})
								} else {
									uni.showModal({
										showCancel: false,
										title: '失败',
										content: '退款失败，请联系系统管理员!',
										success: function(r1) {
											if (r1.confirm) {
												uni.navigateBack({
													delta: 1
												})
											}
										}
									})
								}
							})
						}
					}
				})
			},
			denyRefund() {
				let that = this
				uni.showModal({
					title: '确认',
					content: '确认拒绝退款吗?',
					success: function(res) {
						if (res.confirm) {
							uni.showLoading({
								title: '请稍等'
							})

							const db = uniCloud.database()
							db.collection('uni-id-base-order').doc(that.order._id).update({
								status: -2,
								refund_deny_time: new Date().getTime()
							}).then((r) => {
								uni.hideLoading()
								console.log('uni-id-base-order update', r)
								if (r.result.updated == 1) {
									uni.showModal({
										showCancel: false,
										title: '成功',
										content: '操作成功!',
										success: function(r1) {
											if (r1.confirm) {
												uni.navigateBack({
													delta: 1
												})
											}
										}
									})
								}
							})
						}
					}
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
