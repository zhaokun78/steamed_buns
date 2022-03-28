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
								<text>￥{{ item.price }}</text>
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
				<view class="price">￥{{ getCartGoodsPrice }}</view>
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

			}
		},
		computed: {
			...mapState(['orderType', 'address', 'store', 'cart']),
			getCartGoodsNumber() { //计算购物车总数
				return this.cart.reduce((acc, cur) => acc + cur.number, 0)
			},
			getCartGoodsPrice() { //计算购物车总价
				return this.cart.reduce((acc, cur) => acc + cur.number * cur.price, 0).toFixed(2)
			},
			disabledPay() { //是否达到起送价
				return this.orderType == 'takeout' && (this.getCartGoodsPrice < this.store.min_price) ? true : false
			},
			spread() { //差多少元起送
				if (this.orderType != 'takeout') return
				return parseFloat((this.store.min_price - this.getCartGoodsPrice).toFixed(2))
			}
		},
		onLoad() {
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
			toPay() {
				uni.showLoading({
					title: '加载中'
				})
				uni.setStorageSync('cart', JSON.parse(JSON.stringify(this.cart)))

				uni.navigateTo({
					url: '/pages/pay/pay'
				})
				uni.hideLoading()
			}
		}
	}
</script>

<style lang="scss" scoped>
	@import '~@/pages/cart/cart.scss';
</style>
