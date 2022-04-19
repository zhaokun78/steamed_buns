<template>
	<view class="container">
		<block v-if="cart.length==0">
			<view class="d-flex w-100 h-100 flex-column just-content-center align-items-center">
				<image src="/static/images/emptyCart.jpg" class="drinks-img" mode="aspectFit"></image>
				<view class="tips d-flex flex-column align-items-center font-size-base text-color-assist">
					<view>购物车空空如也</view>
					<view>快去犒劳一下自己吧~</view>
				</view>
				<button type="primary" class="drink-btn" size="default" @tap="gotoMenu">去点餐</button>
			</view>
		</block>
		<block v-else>
			<uni-list>
				<uni-list-item :title="store.name" :note="orderType=='takein'? '自提':'外卖'" link to="/pages/menu/menu"></uni-list-item>
			</uni-list>
			<view class="cart-popup">
				<view class="top">
					<text @tap="handleCartClear">清空</text>
				</view>
				<scroll-view class="cart-list" scroll-y>
					<view class="wrapper">
						<view class="item" v-for="(item, index) in cart" :key="index">
							<view class="left">
								<view class="name">{{ item.name }}</view>
								<view class="props">{{ item.props_text }}</view>
							</view>
							<view class="center">
								<text>￥{{ item.price/100 }}</text>
							</view>
							<view class="right">
								<button type="default" plain size="mini" class="btn" hover-class="none" @tap="handleCartItemReduce(index)">
									<view class="iconfont iconsami-select"></view>
								</button>
								<view class="number">{{ item.number }}</view>
								<button type="primary" class="btn" size="min" hover-class="none" @tap="handleCartItemAdd(index)">
									<view class="iconfont iconadd-select"></view>
								</button>
							</view>
						</view>
						<view class="item" v-if="orderType == 'takeout' && store.packing_fee">
							<view class="left">
								<view class="name">包装费</view>
							</view>
							<view class="center">
								<text>￥{{ parseFloat(store.packing_fee) }}</text>
							</view>
							<view class="right invisible">
								<button type="default" plain size="mini" class="btn" hover-class="none">
									<view class="iconfont iconsami-select"></view>
								</button>
								<view class="number">1</view>
								<button type="primary" class="btn" size="min" hover-class="none">
									<view class="iconfont iconadd-select"></view>
								</button>
							</view>
						</view>
					</view>
				</scroll-view>
			</view>
			<view class="cart-box">
				<view class="mark">
					<image src="/static/images/menu/cart.png" class="cart-img"></image>
					<view class="tag">{{ getCartGoodsNumber }}</view>
				</view>
				<view class="price">￥{{ getCartGoodsPrice/100 }}</view>
				<button type="primary" class="pay-btn" @tap="toPay" :disabled="disabledPay">
					{{ disabledPay ? `差${spread}元起送` : '去结算' }}
				</button>
			</view>
		</block>
	</view>
</template>

<script>
	import {
		mapState,
		mapMutations,
	} from 'vuex'
	import popupLayer from '@/components/popup-layer/popup-layer'

	export default {
		data() {
			return {
				wmqsje: 0, //外卖起送金额（分）
			}
		},
		computed: {
			...mapState(['orderType', 'address', 'store', 'cart']),
			getCartGoodsNumber() { //计算购物车总数
				return this.cart.reduce((acc, cur) => acc + cur.number, 0)
			},
			getCartGoodsPrice() { //计算购物车总价
				return this.cart.reduce((acc, cur) => acc + cur.number * cur.price, 0)
			},
			disabledPay() { //是否达到起送价
				return this.orderType == 'takeout' && (this.getCartGoodsPrice < this.wmqsje) ? true : false
			},
			spread() { //差多少元起送
				if (this.orderType != 'takeout') return
				return (this.wmqsje - this.getCartGoodsPrice) / 100
			}
		},
		onShow() {
			if (this.store && this.store.delivery_amount && this.store.delivery_amount > 0) {
				this.wmqsje = this.store.delivery_amount
			} else {
				//加载系统参数			
				const db = uniCloud.database()
				db.collection('wfy-system-parameter').where("name=='外卖起送金额'").limit(1).get().then((parameter) => {
					console.log('wfy-system-parameter', parameter)
					this.wmqsje = parseInt(parameter.result.data[0].value)
				})
			}

			/*
			console.log('cart onLoad')
			uni.$on('showCartRedDot', function(data) {
				console.log('on showCartRedDot')
				uni.showTabBarRedDot({
					index: 1,
					success(r) {
						console.log('showTabBarRedDot success')
					},
					fail(e) {
						console.log('showTabBarRedDot fail', e)
					}
				})
			})
			*/
		},
		methods: {
			...mapMutations(['MODIFY_GOODS_IN_CART', 'DELETE_GOODS_IN_CART', 'CLEAR_CART']),
			gotoMenu() {
				uni.navigateTo({
					url: '/pages/menu/menu'
				})
			},
			handleCartClear() {
				uni.showModal({
					title: '提示',
					content: '确定清空购物车么',
					success: ({
						confirm
					}) => {
						if (confirm) {
							this.CLEAR_CART()
						}
					}
				})
			},
			handleCartItemAdd(index) {
				let obj = this.cart[index]
				obj.number++
				this.MODIFY_GOODS_IN_CART({
					index: index,
					goods: obj
				})
			},
			handleCartItemReduce(index) {
				let obj = this.cart[index]
				obj.number -= 1

				if (obj.number <= 0) {
					this.DELETE_GOODS_IN_CART(index)
				} else {
					this.MODIFY_GOODS_IN_CART({
						index: index,
						goods: obj
					})
				}

				if (this.cart.length <= 0) {
					this.cartPopupVisible = false
				}
			},
			async toPay() {
				if (this.orderType == 'takein') {
					//注意此段代码 menu 及 cart 页面中是一摸一样的
					let that = this
					const db = uniCloud.database();

					//拆分锁鲜、非锁鲜产品到两个订单
					//1、判断购物车中是否同时有锁鲜及非锁鲜产品
					let gcRes = await db.collection('wfy-goods-categories').where("name=='锁鲜'").limit(1).get()
					console.log('wfy-goods-categories', gcRes)

					let freshGoods = []
					let notFreshGoods = []
					for (let i = 0; i < this.cart.length; i++) {
						if (this.cart[i].category_id == gcRes.result.data[0]._id) {
							freshGoods.push(this.cart[i])
						} else {
							notFreshGoods.push(this.cart[i])
						}
					}

					if (freshGoods.length > 0 && notFreshGoods.length > 0) {
						uni.showModal({
							showCancel: false,
							title: '提示',
							content: '购物车中含有锁鲜及非锁鲜产品，将拆分为两个订单，请分别进行两次支付',
							success: function(res) {
								if (res.confirm) {
									//2、将非锁鲜产品先移出购物车，放到本地存储中
									for (let i = 0; i < notFreshGoods.length; i++) {
										const index = that.cart.findIndex(item => item._id === notFreshGoods[i]._id)
										if (index > -1) {
											that.DELETE_GOODS_IN_CART(index)
										}
									}
									uni.setStorageSync('notFreshGoodsInCart', notFreshGoods)

									//3、跳转到 pay 页面对锁鲜产品进行支付
									uni.navigateTo({
										url: '/pages/pay/pay'
									})

									//4、支付成功后从本地存储读取非锁鲜产品到购物车中并清空本地存储，然后再次支付
									//这一步在 take-foods 中完成								
								}
							}
						})
					} else {
						uni.navigateTo({
							url: '/pages/pay/pay'
						})
					}
				} else {
					uni.navigateTo({
						url: '/pages/pay/pay'
					})
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	@import '~@/pages/cart/cart.scss';
</style>
