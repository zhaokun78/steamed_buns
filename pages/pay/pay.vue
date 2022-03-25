<template>
	<view class="container position-relative">
		<view style="margin-bottom: 130rpx;">
			<!-- 店铺、收货信息 start -->
			<view class="section-1">
				<!-- 自提 start -->
				<template v-if="orderType == 'takein'">
					<!-- 自提店铺名称 start -->
					<list-cell class="location">
						<view class="flex-fill d-flex justify-content-between align-items-center">
							<view class="store-name flex-fill">
								{{ store.name }}
							</view>
							<!-- <image src="/static/images/navigator-1.png" class="arrow"></image> -->
						</view>
					</list-cell>
					<!-- 自提店铺名称 end -->

					<!-- 自提联系电话 start -->
					<list-cell class="contact" last :hover="false">
						<view class="flex-fill d-flex justify-content-between align-items-center">
							<view class="title flex-fill">联系电话</view>
							<view class="time">
								<input class="text-right" placeholder="请输入手机号码" v-model="form.mobile" />
							</view>
							<button type="primary" open-type="getPhoneNumber" @getphonenumber="getphonenumber" style="font-size: 10px;">获取手机号</button>
						</view>
					</list-cell>
					<!-- 自提联系电话 end -->
				</template>
				<!-- 自提 end -->

				<!-- 外卖 start -->
				<template v-else>
					<!-- 外卖收货地址 start -->
					<list-cell @click="chooseAddress">
						<view class="w-100 d-flex flex-column">
							<view class="d-flex align-items-center justify-content-between mb-10">
								<view class="font-size-extra-lg text-color-base">{{ address.address }}</view>
								<image src="/static/images/navigator-1.png" class="arrow"></image>
							</view>
							<view class="d-flex text-color-assist font-size-sm align-items-center">
								<view class="mr-10">{{ address.name }}</view>
								<view class="mr-10">{{ !address.sex ? '先生' : '女士' }}</view>
								<view>{{ address.mobile }}</view>
							</view>
						</view>
					</list-cell>
					<!-- 外卖收货地址 end -->

					<!-- 外卖预计送达时间 start -->
					<list-cell>
						<view class="w-100 d-flex flex-column">
							<view class="d-flex align-items-center font-size-base text-color-base">
								<view class="flex-fill">预计送达时间</view>
								<view class="mr-10">15:18</view>
								<image src="/static/images/navigator-1.png" class="arrow"></image>
							</view>
						</view>
					</list-cell>
					<!-- 外卖预计送达时间 end -->
				</template>
				<!-- 外卖 end -->
			</view>
			<!-- 店铺、收货信息 end -->

			<!-- 购物车列表 start -->
			<view class="section-2">
				<view class="cart d-flex flex-column">
					<list-cell last v-for="(item, index) in cart" :key="index">
						<view class="w-100 d-flex flex-column">
							<view class="d-flex align-items-center mb-10">
								<view class="name-and-props overflow-hidden">
									<view class="text-color-base font-size-lg">
										{{ item.name }}
									</view>
								</view>
								<view class="d-flex flex-fill justify-content-between align-items-center text-color-base font-size-lg">
									<view>x{{ item.number }}</view>
									<view>￥{{ item.price }}</view>
								</view>
							</view>
							<view class="text-truncate font-size-base text-color-assist">
								{{ item.goods_desc }}
							</view>
						</view>
					</list-cell>
					<template v-if="orderType == 'takeout'">
						<list-cell last v-if="store.packing_fee > 0">
							<view class="w-100 d-flex font-size-base align-items-center justify-content-between">
								<view>包装费</view>
								<view>￥{{ parseFloat(store.packing_fee) }}</view>
							</view>
						</list-cell>
						<list-cell last v-if="store.delivery_cost > 0">
							<view class="w-100 d-flex font-size-base align-items-center justify-content-between">
								<view>配送费</view>
								<view>￥{{ parseFloat(store.delivery_cost) }}</view>
							</view>
						</list-cell>
					</template>
				</view>
				<list-cell>
					<view class="flex-fill d-flex justify-content-end align-items-center">
						<view>总计：{{ total }}件</view>
					</view>
				</list-cell>
				<list-cell last>
					<view class="flex-fill d-flex justify-content-end align-items-center">
						<view class="font-size-extra-lg font-weight-bold">合计：￥{{ amount }}元</view>
					</view>
				</list-cell>
			</view>
			<!-- 购物车列表 end -->

			<!-- 支付方式 start -->
			<view class="payment">
				<list-cell last :hover="false">
					<text>支付方式</text>
				</list-cell>
				<list-cell last>
					<view class="d-flex align-items-center justify-content-between w-100">
						<view class="iconfont iconwxpay line-height-100 payment-icon" style="color: #7EB73A;"></view>
						<view class="flex-fill">微信支付</view>
						<view class="iconfont iconradio-button-on line-height-100 checkbox checked"></view>
					</view>
				</list-cell>
			</view>
			<!-- 支付方式 end -->
		</view>

		<!-- 付款栏 start -->
		<view class="w-100 pay-box position-fixed fixed-bottom d-flex align-items-center justify-content-between bg-white">
			<view class="font-size-sm" style="margin-left: 20rpx;">合计：</view>
			<view class="font-size-lg flex-fill">￥{{ amount }}</view>
			<view class="bg-primary h-100 d-flex align-items-center just-content-center text-color-white font-size-base" style="padding: 0 60rpx;"
				@tap="submit">付款</view>
		</view>
		<!-- 付款栏 end -->

		<!-- 再次确认 start -->
		<modal :show="ensureAddressModalVisible" custom :mask-closable="false" :radius="0" width="90%">
			<view class="modal-content">
				<view class="d-flex justify-content-end">
					<image src="/static/images/pay/close.png" style="width: 40rpx; height: 40rpx;" @tap="ensureAddressModalVisible=false"></image>
				</view>
				<view class="d-flex just-content-center align-items-center" style="margin-bottom: 40px;">
					<view class="font-size-extra-lg text-color-base">请再次确认下单地址</view>
				</view>
				<view class="d-flex font-size-base text-color-base font-weight-bold align-items-center justify-content-between mb-20">
					<view>{{ address.name }} {{ address.sex ? '女士' : '先生' }}</view>
					<view>{{ address.mobile }}</view>
				</view>
				<view class="d-flex font-size-sm text-color-assist align-items-center justify-content-between mb-40">
					<view>{{ address.address }}</view>
					<button type="primary" size="mini" plain class="change-address-btn" @tap="selectAddress">修改地址</button>
				</view>
				<button type="primary" class="pay_btn" @tap="pay">确认并付款</button>
			</view>
		</modal>
		<!-- 再次确认 end -->
	</view>
</template>

<script>
	import {
		mapGetters,
		mapState,
		mapMutations
	} from 'vuex'
	import listCell from '@/components/list-cell/list-cell'
	import modal from '@/components/modal/modal'

	export default {
		components: {
			listCell,
			modal
		},
		data() {
			return {
				form: {
					mobile: ''
				},
				ensureAddressModalVisible: false
			}
		},
		computed: {
			...mapGetters({
				userInfo: 'user/info',
			}),
			...mapState(['orderType', 'address', 'store', 'cart']),
			total() {
				return this.cart.reduce((acc, cur) => acc + cur.number, 0)
			},
			amount() {
				return this.cart.reduce((acc, cur) => acc + cur.number * cur.price, 0)
			}
		},
		onLoad(option) {
			this.form.mobile = this.userInfo.mobile
		},
		methods: {
			...mapMutations(['CLEAR_CART']),
			selectAddress() {
				uni.navigateTo({
					url: '/pages/address/address?is_choose=true&scene=pay'
				})
			},
			getphonenumber(e) {
				console.log('getphonenumber', e)
				if (e.detail.errMsg != 'getPhoneNumber:ok') {
					return
				}

				uniCloud.callFunction({
					name: "uni-id-cf",
					data: {
						"action": "getCurrentUserInfo",
						"params": e.detail
					},
					success: (r) => {
						console.log('getCurrentUserInfo success:', r)
						if (r.result.userInfo.mobile) {
							this.form.mobile = r.result.userInfo.mobile
						} else {
							uni.showModal({
								title: '提示',
								content: '请先绑定手机号！',
								success: function(res) {
									if (res.confirm) {
										uni.navigateTo({
											url: '/pages/ucenter/userinfo/userinfo'
										})
									}
								}
							})
						}
					},
					fail: (e) => {
						console.log('getCurrentUserInfo fail:', e)
					},
					complete: (c) => {
						console.log('getCurrentUserInfo complete:', c)
					}
				})
			},
			chooseAddress() {
				uni.navigateTo({
					url: '/pages/address/address?is_choose=true&scene=pay'
				})
			},
			goToPackages() {
				uni.navigateTo({
					url: '/pages/packages/index'
				})
			},
			async submit() {
				if (this.orderType == 'takeout') {
					this.ensureAddressModalVisible = true
				} else {
					await this.pay()
				}
			},
			async pay() {
				uni.showLoading({
					title: '请稍等'
				})

				let that = this
				const db = uniCloud.database()
				try {
					let pickupNumber = null
					if (this.orderType == 'takein') {
						//调用云函数生成取餐号
						let pickupNumberRes = await uniCloud.callFunction({
							name: 'wfy-generate-pickup-number',
							data: {
								shop_id: this.store._id
							}
						})
						console.log('pickupNumber', pickupNumberRes)
						pickupNumber = pickupNumberRes.result.data[0].pickup_number
					}

					//创建订单记录
					let orderResult = await db.collection('uni-id-base-order').add({
						paid_time: new Date().getTime(),
						user_mobile: this.form.mobile,
						pick_up_number: pickupNumber,
						status: 2,
						type: this.orderType == 'takein' ? 0 : 1,
						store: this.store._id,
						total_fee: this.cart.reduce((acc, cur) => acc + (cur.number * cur.price) * 100, 0),
						is_refund: false,
					})
					console.log('add uni-id-base-order', orderResult)

					if (orderResult.result.code == 0) {
						//创建 订单---商品 子记录
						for (let i = 0; i < this.cart.length; i++) {
							let r = await db.collection('wfy-order-goods').add({
								order_id: orderResult.result.id,
								goods_id: this.cart[i]._id,
								goods_name: this.cart[i].name,
								price: this.cart[i].price * 100,
								num: this.cart[i].number,
							})
							console.log('add wfy-order-goods', r)

							if (r.result.code != 0) {
								uni.hideLoading()
								uni.showModal({
									showCancel: false,
									title: '创建订单失败',
									content: r.result.message
								})
								return
							}
						}
					} else {
						uni.hideLoading()
						uni.showModal({
							showCancel: false,
							title: '创建订单失败',
							content: orderResult.result.message
						})
						return
					}

					uni.hideLoading()
					uni.showModal({
						showCancel: false,
						title: '提示',
						content: '订单创建成功！',
						success: function(res) {
							if (res.confirm) {
								that.CLEAR_CART()
								uni.switchTab({
									url: '/pages/take-foods/take-foods'
								})
							}
						}
					})
				} catch (e) {
					console.log(e)

					uni.hideLoading()
					uni.showModal({
						showCancel: false,
						title: '发生错误',
						content: JSON.stringify(e)
					})
				}

				//微信支付

				//支付回调
				//设置 paid_time 字段
			}
		}
	}
</script>

<style lang="scss" scoped>
	.container {
		padding: 30rpx;
	}

	.arrow {
		width: 50rpx;
		height: 50rpx;
		position: relative;
		margin-right: -10rpx;
	}

	.location {
		.store-name {
			font-size: $font-size-lg;
		}

		.iconfont {
			font-size: 50rpx;
			line-height: 100%;
			color: $color-primary;
		}
	}

	.section-1 {
		margin-bottom: 30rpx;

		.contact {
			.contact-tip {
				margin-left: 10rpx;
				border: 2rpx solid $color-primary;
				padding: 6rpx 10rpx;
				color: $color-primary;
			}
		}
	}

	.section-2 {
		.name-and-props {
			width: 65%;
		}
	}

	.payment {
		margin-bottom: 30rpx;

		.disabled {
			color: $text-color-grey;
		}

		.payment-icon {
			font-size: 44rpx;
			margin-right: 10rpx;
		}

		.checkbox {
			font-size: 36rpx;
			margin-left: 10rpx;
		}

		.checked {
			color: $color-primary;
		}
	}

	.pay-box {
		box-shadow: 0 0 20rpx rgba(0, 0, 0, .1);
		height: 100rpx;
	}

	.modal-content {
		.change-address-btn {
			line-height: 2;
			padding: 0 1em;
		}

		.pay_btn {
			width: 100%;
			border-radius: 50rem !important;
			line-height: 3;
		}
	}
</style>
