<template>
	<view>
		<uni-segmented-control :current="curTabIndex" :values="tabItems" @clickItem="onClickTab" styleType="text" activeColor="#00e26d">
		</uni-segmented-control>
		<uni-card v-if="curTabIndex==0" v-for="(order,index) in orders_yfk" :key="order._id" mode="title" :title="order.type == 0 ? '自提' : '外卖'"
			:extra="'合计：￥'+ order.total_fee/100" @click="gotoOrderDetail(order)" shadow="10px 10px 3px 10px rgba(0, 0, 0, 0.08)" :isShadow="true"
			note="true">
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
					<view @tap="acceptOrder(order)">
						<image src='/static/images/mine/jfqd.png' style="width: 30rpx; height: 30rpx;" class="mr-10"></image>
						<text class="footer-box__item">接单</text>
					</view>
				</view>
			</template>
		</uni-card>
		<uni-card v-if="curTabIndex==1" v-for="(order,index) in orders_bcz" :key="order._id" mode="title" :title="order.type == 0 ? '自提' : '外卖'"
			:extra="'合计：￥'+ order.total_fee/100" @click="gotoOrderDetail(order)" shadow="10px 10px 3px 10px rgba(0, 0, 0, 0.08)" :isShadow="true"
			note="true">
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
					<view @tap="meituanOrder(order)">
						<image src='/static/images/mine/jfqd.png' style="width: 30rpx; height: 30rpx;" class="mr-10"></image>
						<text class="footer-box__item">美团派单</text>
					</view>
				</view>
			</template>
		</uni-card>
		<uni-card v-if="curTabIndex==2" v-for="(order,index) in orders_dqc" :key="order._id" mode="title" :title="order.type == 0 ? '自提' : '外卖'"
			:extra="'合计：￥'+ order.total_fee/100" @click="gotoOrderDetail(order)" shadow="10px 10px 3px 10px rgba(0, 0, 0, 0.08)" :isShadow="true"
			note="true">
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
					<view @tap="printReceipt(order)">
						<image src='/static/images/mine/jfqd.png' style="width: 30rpx; height: 30rpx;" class="mr-10"></image>
						<text class="footer-box__item">打印小票</text>
					</view>
					<view @tap="closeOrder(order)">
						<image src='/static/images/mine/shdz.png' style="width: 30rpx; height: 30rpx;" class="mr-10"></image>
						<text class="footer-box__item">关闭订单</text>
					</view>
				</view>
			</template>
		</uni-card>
		<uni-card v-if="curTabIndex==3" v-for="(order,index) in orders_psz" :key="order._id" mode="title" :title="order.type == 0 ? '自提' : '外卖'"
			:extra="'合计：￥'+ order.total_fee/100" @click="gotoOrderDetail(order)" shadow="10px 10px 3px 10px rgba(0, 0, 0, 0.08)" :isShadow="true">
			<view>
				<view>
					<text class="redtxt">{{order.type == 0 ? '取餐号：'+order.pick_up_number:formatOrderState(order)}}</text>
				</view>
				<view>
					<text class="txt">下单时间：{{ formatDateTime(order.create_time) }}</text>
				</view>
			</view>
		</uni-card>
		<uni-card v-if="curTabIndex==4" v-for="(order,index) in orders_ywc" :key="order._id" mode="title" :title="order.type == 0 ? '自提' : '外卖'"
			:extra="'合计：￥'+ order.total_fee/100" @click="gotoOrderDetail(order)" shadow="10px 10px 3px 10px rgba(0, 0, 0, 0.08)" :isShadow="true">
			<view>
				<view>
					<text class="redtxt">{{order.type == 0 ? '取餐号：'+order.pick_up_number:formatOrderState(order)}}</text>
				</view>
				<view>
					<text class="txt">下单时间：{{ formatDateTime(order.create_time) }}</text>
				</view>
			</view>
		</uni-card>
	</view>
</template>

<script>
	import util from '@/common/util'
	export default {
		data() {
			return {
				myShop: undefined,
				orders_yfk: [], //已付款订单
				orders_bcz: [], //备餐中订单
				orders_dqc: [], //待取餐订单
				orders_psz: [], //配送中订单
				orders_ywc: [], //已完成订单
				curTabIndex: 0,
				tabItems: ['已付款', '备餐中', '待取餐', '配送中', '已完成'],
			}
		},
		onLoad() {
			this.loadOrder()
		},
		methods: {
			loadOrder() {
				let that = this
				const db = uniCloud.database()

				//查询本人的店铺
				db.collection('wfy-shop').where('owner_id==$cloudEnv_uid').limit(1).get().then((r) => {
					console.log('wfy-shop', r)
					if (r.result.code == 0) {
						that.myShop = r.result.data[0]

						//本人店铺的所有已付款订单
						db.collection('uni-id-base-order').where("store== '" + that.myShop._id + "' && status==2").get().then((res) => {
							if (res.result.code == 0) {
								that.orders_yfk = res.result.data
							}
						})

						//本人店铺的所有备餐中订单
						db.collection('uni-id-base-order').where("store== '" + that.myShop._id + "' && status==3").get().then((res) => {
							if (res.result.code == 0) {
								that.orders_bcz = res.result.data
							}
						})

						//本人店铺的所有待取餐订单
						db.collection('uni-id-base-order').where("store== '" + that.myShop._id + "' && status==4 && type==0").get().then((
							res) => {
							if (res.result.code == 0) {
								that.orders_dqc = res.result.data
							}
						})

						//本人店铺的所有配送中订单
						db.collection('uni-id-base-order').where("store== '" + that.myShop._id + "' && status==4 && type==1").get().then((
							res) => {
							if (res.result.code == 0) {
								that.orders_psz = res.result.data
							}
						})

						//本人店铺的所有已完成订单
						db.collection('uni-id-base-order').where("store== '" + that.myShop._id + "' && status==5").get().then((res) => {
							if (res.result.code == 0) {
								that.orders_ywc = res.result.data
							}
						})
					}
				})
			},
			onClickTab(e) {
				this.curTabIndex = e.currentIndex
			},
			formatDateTime(date) {
				return util.formatDate(date)
			},
			formatOrderState(order) {
				return util.formatOrderState(order)
			},
			gotoOrderDetail(order) {
				uni.navigateTo({
					url: '/pages/order-detail/order-detail?orderId=' + order._id
				})
			},
			acceptOrder(order) {
				uni.showLoading({
					title: '请稍等'
				})

				let that = this
				const db = uniCloud.database();
				//详见需求文档：
				//自提接单时将订单状态设置为“待取餐”状态，外卖接单时将订单设置为“备餐中”状态
				db.collection('uni-id-base-order').where("_id=='" + order._id + "'").update({
					status: order.type == 0 ? 4 : 3,
					accept_time: new Date().getTime()
				}).then((res) => {
					uni.hideLoading()
					if (res.result.code == 0 && res.result.updated == 1) {
						uni.showModal({
							showCancel: false,
							title: '提示',
							content: '接单成功！',
							success: function(e) {
								if (e.confirm) {
									that.loadOrder()
								}
							}
						})
					}
				})
			},
			meituanOrder(order) {
				uni.showLoading({
					title: '请稍等'
				})

				//此处调用美团接口

				let that = this
				const db = uniCloud.database();
				db.collection('uni-id-base-order').where("_id=='" + order._id + "'").update({
					status: 4
				}).then((res) => {
					uni.hideLoading()
					if (res.result.code == 0 && res.result.updated == 1) {
						uni.showModal({
							showCancel: false,
							title: '提示',
							content: '派单成功！',
							success: function(e) {
								if (e.confirm) {
									that.loadOrder()
								}
							}
						})
					}
				})
			},
			closeOrder(order) {
				uni.showLoading({
					title: '请稍等'
				})

				let that = this
				const db = uniCloud.database();
				db.collection('uni-id-base-order').where("_id=='" + order._id + "'").update({
					status: 5,
					close_time: new Date().getTime()
				}).then((res) => {
					uni.hideLoading()
					if (res.result.code == 0 && res.result.updated == 1) {
						uni.showModal({
							showCancel: false,
							title: '提示',
							content: '关闭订单成功！',
							success: function(e) {
								if (e.confirm) {
									that.loadOrder()
								}
							}
						})
					}
				})
			},
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
