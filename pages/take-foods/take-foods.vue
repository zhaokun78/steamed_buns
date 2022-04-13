<template>
	<view class="container">
		<uni-segmented-control :current="curTabIndex" :values="tabItems" @clickItem="onClickTab" styleType="text" activeColor="#00e26d">
		</uni-segmented-control>
		<block v-if="curTabIndex==0">
			<view v-if="currentOrders.length==0" class="d-flex w-100 h-100 flex-column just-content-center align-items-center">
				<image src="/static/logo.jpg" class="drinks-img"></image>
				<view class="tips d-flex flex-column align-items-center font-size-base text-color-assist">
					<view>您还没有点单</view>
					<view>快去犒劳一下自己吧~</view>
				</view>
				<button type="primary" class="drink-btn" size="default" @tap="gotoMenu">去点餐</button>
			</view>
			<template v-else>
				<uni-card v-for="(order,index) in currentOrders" :key="order._id" mode="title" :title="order.store[0].name"
					:subTitle="order.type == 0 ? '自提' : '外卖'" :extra="'合计：￥'+ order.total_fee/100" @click="gotoOrderDetail(order)"
					shadow="10px 10px 3px 10px rgba(0, 0, 0, 0.08)" :isShadow="true" note="true">
					<view>
						<view>
							<text class="redtxt">{{order.type == 0 ? '取餐号：'+order.pick_up_number:formatOrderState(order)}}</text>
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
							<view @tap="navigationToStore(order.store[0])">
								<image src='/static/images/mine/shdz.png' style="width: 30rpx; height: 30rpx;" class="mr-10"></image>
								<text class="footer-box__item">店铺导航</text>
							</view>
						</view>
					</template>
				</uni-card>
			</template>
		</block>
		<block v-if="curTabIndex==1">
			<uni-card v-for="(order,index) in closedOrders" :key="order._id" mode="title" :title="order.store[0].name"
				:subTitle="order.type == 0 ? '自提' : '外卖'" :extra="'合计：￥'+ order.total_fee/100" @click="gotoOrderDetail(order)"
				shadow="10px 10px 3px 10px rgba(0, 0, 0, 0.08)" :isShadow="true" note="true">
				<view>
					<view>
						<text class="redtxt">已完成</text>
					</view>
					<view>
						<text class="txt">关闭订单时间：{{ formatDateTime(order.close_time) }}</text>
					</view>
				</view>
				<template v-slot:footer>
					<view class="footer-box">
						<view>
							<image src='/static/images/mine/stxy.png' style="width: 30rpx; height: 30rpx;" class="mr-10"></image>
							<text class="footer-box__item">收藏店铺</text>
						</view>
						<view @tap="navigationToStore(order.store[0])">
							<image src='/static/images/mine/shdz.png' style="width: 30rpx; height: 30rpx;" class="mr-10"></image>
							<text class="footer-box__item">店铺导航</text>
						</view>
					</view>
				</template>
			</uni-card>
		</block>
		<block v-if="curTabIndex==2">
			<uni-card v-for="(order,index) in refundOrders" :key="order._id" mode="title" :title="order.store[0].name"
				:subTitle="order.type == 0 ? '自提' : '外卖'" :extra="'合计：￥'+ order.total_fee/100" @click="gotoOrderDetail(order)"
				shadow="10px 10px 3px 10px rgba(0, 0, 0, 0.08)" :isShadow="true" note="true">
				<view>
					<view>
						<text class="redtxt">{{formatOrderState(order)}}</text>
					</view>
					<view>
						<text class="txt">退款申请时间：{{ formatDateTime(order.refund_apply_time) }}</text>
					</view>
				</view>
				<template v-slot:footer>
					<view class="footer-box">
						<view>
							<image src='/static/images/mine/stxy.png' style="width: 30rpx; height: 30rpx;" class="mr-10"></image>
							<text class="footer-box__item">收藏店铺</text>
						</view>
						<view @tap="navigationToStore(order.store[0])">
							<image src='/static/images/mine/shdz.png' style="width: 30rpx; height: 30rpx;" class="mr-10"></image>
							<text class="footer-box__item">店铺导航</text>
						</view>
					</view>
				</template>
			</uni-card>
		</block>
	</view>
</template>

<script>
	import util from '@/common/util'
	export default {
		data() {
			return {
				curTabIndex: 0, //当前选择标签
				tabItems: ['当前订单', '历史订单', '退款订单'],
				currentOrders: [], //本人所有当前订单
				closedOrders: [], //本人所有已完成订单
				refundOrders: [], //本人的所有退款订单
			}
		},
		methods: {
			onShow() {
				this.loadOrder(this.curTabIndex)
			},
			async loadOrder(index) {
				uni.showLoading({
					title: '请稍等'
				})
				const db = uniCloud.database()
				let order
				let res
				if (index == 0) {
					//本人的所有已付款、备餐中、待取餐/配送中订单
					order = await db.collection('uni-id-base-order')
						.where('user_id==$cloudEnv_uid && (status==2 || status==3 || status==4)')
						.orderBy('create_time', 'desc')
						.getTemp()
					res = await db.collection(order, 'wfy-shop').get()
					console.log('uni-id-base-order', res)
					if (res.result.code == 0) {
						this.currentOrders = res.result.data
					}
				} else if (index == 1) {
					//本人的所有已关闭订单
					order = await db.collection('uni-id-base-order')
						.where('user_id==$cloudEnv_uid && status==5')
						.orderBy('create_time', 'desc')
						.getTemp()
					res = await db.collection(order, 'wfy-shop').get()
					console.log('uni-id-base-order', res)
					if (res.result.code == 0) {
						this.closedOrders = res.result.data
					}
				} else if (index == 2) {
					//本人的所有退款订单
					order = await db.collection('uni-id-base-order')
						.where('user_id==$cloudEnv_uid && (status==6 || status==7 || status==8 || status<0) ')
						.orderBy('create_time', 'desc')
						.getTemp()
					res = await db.collection(order, 'wfy-shop').get()
					console.log('uni-id-base-order', res)
					if (res.result.code == 0) {
						this.refundOrders = res.result.data
					}
				}
				uni.hideLoading()
			},
			formatDateTime(date) {
				return util.formatDate(date)
			},
			formatOrderState(order) {
				return util.formatOrderState(order)
			},
			gotoMenu() {
				uni.navigateTo({
					url: '/pages/menu/menu'
				})
			},
			navigationToStore(store) {
				console.log('navigationToStore', store)
				uni.openLocation({
					name: store.name,
					latitude: parseFloat(store.latitude),
					longitude: parseFloat(store.longitude),
					success: function() {},
					fail: function(e) {
						console.log(e)
					}
				})
			},
			onClickTab(e) {
				this.curTabIndex = e.currentIndex
				this.loadOrder(this.curTabIndex)
			},
			gotoOrderDetail(order) {
				uni.navigateTo({
					url: '/pages/order-detail/order-detail?orderId=' + order._id
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
