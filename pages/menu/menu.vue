<template>
	<view class="container">
		<uni-nav-bar :fixed="true" status-bar left-icon="left" left-text="返回" title="点餐" @clickLeft="back" />
		<!-- 主体 begin -->
		<view class="main" v-if="goods.length>0">
			<!-- 顶部 begin -->
			<view class="nav">
				<view class="header">
					<view class="left" v-if="orderType == 'takein'">
						<view class="store-name" @tap="selectStore">
							<text>{{ store.name }}</text>
							<view class="iconfont iconarrow-right"></view>
						</view>
						<view class="store-location">
							<image src='/static/images/order/location.png' style="width: 30rpx; height: 30rpx;" class="mr-10"></image>
							<text>距离您 {{ formatDistance(store.distance) }}</text>
						</view>
					</view>
					<view class="left overflow-hidden" v-else>
						<view class="d-flex align-items-center overflow-hidden" @tap="selectAddress">
							<image src='/static/images/order/location.png' style="width: 30rpx; height: 30rpx;" class="mr-10"></image>
							<view class="font-size-extra-lg text-color-base font-weight-bold text-truncate">
								{{ address.address }}
							</view>
							<view class="iconfont iconarrow-right"></view>
						</view>
						<view class="font-size-sm text-color-assist overflow-hidden text-truncate">
							由<text class="text-color-base" style="margin: 0 10rpx">{{ store.name }}</text>配送
						</view>
					</view>
					<view class="right">
						<view class="dinein" :class="{active: orderType == 'takein'}" @tap="switchOrderType('takein')">
							<text>自取</text>
						</view>
						<view class="takeout" :class="{active: orderType == 'takeout'}" @tap="switchOrderType('takeout')">
							<text>外卖</text>
						</view>
					</view>
				</view>
				<view class="coupon">
					<text class="title">店铺{{store.state}}中</text>
					<!-- <view class="iconfont iconarrow-right"></view> -->
				</view>
			</view>
			<!-- 顶部 end -->

			<view class="content" v-if="store.state=='营业'">
				<!-- 商品分类 begin -->
				<scroll-view class="menus" :scroll-into-view="menuScrollIntoView" scroll-with-animation scroll-y>
					<view class="wrapper">
						<view class="menu" :id="`menu-${item._id}`" :class="{'current': item._id === currentCateId}" v-if="goods_categories.length>0"
							v-for="(item, index) in goods_categories" :key="item._id" @tap="handleMenuTap(item._id)">
							<text>{{item.name}}</text>
							<view class="dot" v-show="menuCartNum(item._id)">{{menuCartNum(item._id)}}</view>
						</view>
					</view>
				</scroll-view>
				<!-- 商品分类 end -->

				<!-- 商品列表 begin -->
				<scroll-view class="goods" scroll-with-animation scroll-y :scroll-top="cateScrollTop" @scroll="handleGoodsScroll">
					<view class="wrapper">
						<view class="list">
							<!-- category begin -->
							<view class="category" v-for="(item, index) in goods" :key="index" :id="`cate-${item._id._value}`">
								<view class="title">
									<text>{{ item.name }}</text>
								</view>
								<view class="items">
									<!-- 商品 begin -->
									<view class="good" v-for="(good, key) in item._id['wfy-goods']" :key="good._id">
										<image :src="good.goods_thumb.path" class="image" @tap="showGoodDetailModal(good)"></image>
										<view class="right">
											<text class="name">{{ good.name }}</text>
											<!-- <text class="tips">{{good.goods_desc}}</text> -->
											<view class="price_and_action">
												<text class="price">￥{{ good.price/100 }}</text>
												<view class="btn-group" v-if="good.use_property">
													<button type="primary" class="btn property_btn" hover-class="none" size="mini"
														@tap="showGoodDetailModal(good)">
														选规格
													</button>
													<view class="dot" v-show="goodCartNum(good.id)">{{ goodCartNum(good.id) }}</view>
												</view>
												<view class="btn-group" v-else>
													<button type="default" v-show="goodCartNum(good._id)" plain class="btn reduce_btn" size="mini"
														hover-class="none" @tap="handleReduceFromCart(good)">
														<view class="iconfont iconsami-select"></view>
													</button>
													<view class="number" v-show="goodCartNum(good._id)">{{ goodCartNum(good._id) }}
													</view>
													<button type="primary" class="btn add_btn" size="min" hover-class="none"
														@tap="handleAddToCart(good, 1)">
														<view class="iconfont iconadd-select"></view>
													</button>
												</view>
											</view>
										</view>
									</view>
									<!-- 商品 end -->
								</view>
							</view>
							<!-- category end -->
						</view>
					</view>
				</scroll-view>
				<!-- 商品列表 end -->
			</view>
			<!-- content end -->

			<!-- 购物车栏 begin -->
			<view class="cart-box" v-if="cart.length > 0">
				<view class="mark">
					<image src="/static/images/menu/cart.png" class="cart-img" @tap="openCartPopup"></image>
					<view class="tag">{{ getCartGoodsNumber }}</view>
				</view>
				<view class="price">￥{{ getCartGoodsPrice/100 }}</view>
				<button type="primary" class="pay-btn" @tap="toPay" :disabled="disabledPay">
					{{ disabledPay ? `差${spread}元起送` : '去结算' }}
				</button>
			</view>
			<!-- 购物车栏 end -->
		</view>
		<view v-else class="d-flex w-100 h-100 flex-column just-content-center align-items-center">
			<image src="/static/images/no-shop.png" class="drinks-img" mode="aspectFit"></image>
			<view class="tips d-flex flex-column align-items-center font-size-base text-color-assist">
				<view>您的城市暂时没有店铺，敬请期待！</view>
			</view>
		</view>
		<!-- 主体 end -->

		<!-- 商品详情模态框 begin -->
		<modal :show="goodDetailModalVisible" class="good-detail-modal" color="#5A5B5C" width="90%" custom padding="0rpx" radius="12rpx">
			<view class="cover">
				<image v-if="good.goods_thumb" :src="good.goods_thumb.path" class="image"></image>
				<view class="btn-group">
					<image src="/static/images/menu/share-good.png"></image>
					<image src="/static/images/menu/close.png" @tap="closeGoodDetailModal"></image>
				</view>
			</view>
			<scroll-view class="detail" scroll-y>
				<view class="wrapper">
					<view class="basic">
						<view class="name">{{ good.name }}</view>
						<view class="tips">{{ good.content }}</view>
					</view>
					<view class="properties" v-if="good.use_property">
						<view class="property" v-for="(item, index) in good.property" :key="index">
							<view class="title">
								<text class="name">{{ item.name }}</text>
								<view class="desc" v-if="item.desc">({{ item.desc }})</view>
							</view>
							<view class="values">
								<view class="value" v-for="(value, key) in item.values" :key="key" :class="{'default': value.is_default}"
									@tap="changePropertyDefault(index, key)">
									{{ value.value }}
								</view>
							</view>
						</view>
					</view>
				</view>
			</scroll-view>
			<view class="action">
				<view class="left">
					<view class="price">￥{{ good.price/100 }}</view>
					<view class="props" v-if="getGoodSelectedProps(good)">
						{{ getGoodSelectedProps(good) }}
					</view>
				</view>
				<view class="btn-group">
					<button type="default" plain class="btn" size="mini" hover-class="none" @tap="handlePropertyReduce">
						<view class="iconfont iconsami-select"></view>
					</button>
					<view class="number">{{ good.number }}</view>
					<button type="primary" class="btn" size="min" hover-class="none" @tap="handlePropertyAdd">
						<view class="iconfont iconadd-select"></view>
					</button>
				</view>
			</view>
			<view class="add-to-cart-btn" @tap="handleAddToCartInModal">
				<view>加入购物车</view>
			</view>
		</modal>
		<!-- 商品详情模态框 end -->

		<!-- 购物车详情popup -->
		<popup-layer direction="top" :show-pop="cartPopupVisible" class="cart-popup">
			<template slot="content">
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
						<view class="item" v-if="orderType == 'takeout'">
							<view class="left">
								<view class="name">包装费</view>
							</view>
							<view class="center">
								<text>￥1</text>
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
			</template>
		</popup-layer>
		<!-- 购物车详情popup -->
	</view>
</template>

<script>
	import modal from '@/components/modal/modal'
	import popupLayer from '@/components/popup-layer/popup-layer'
	import {
		mapState,
		mapMutations,
		mapActions,
		mapGetters
	} from 'vuex'
	import util from '@/common/util'

	export default {
		components: {
			modal,
			popupLayer
		},
		data() {
			return {
				isFresh: false, //是否仅加载锁鲜产品
				goods_categories: [], //商品分类
				currentCateId: undefined, //当前选中商品分类
				goods: [], //当前选中分类的所有商品
				ads: [], //广告
				cateScrollTop: 0,
				menuScrollIntoView: '',
				//cart: [], //购物车
				goodDetailModalVisible: false, //是否显示商品详情模态框
				good: {}, //当前商品
				wmqsje: 0, //外卖起送金额(分)
				cartPopupVisible: false,
				sizeCalcState: false
			}
		},
		onLoad(option) {
			if (option.isFresh && option.isFresh == '1') {
				this.isFresh = true
			}
		},
		async onShow() {
			uni.showLoading({
				title: '加载中...'
			})

			let that = this
			const db = uniCloud.database()

			//选择店铺的逻辑 start
			if ((that.orderType == 'takein' && that.store == undefined) || (that.orderType == 'takeout')) {
				let city_code = undefined
				if (that.orderType == 'takein') {
					//自提方式：从 storage 中加载当前用户的定位信息
					const my_location = uni.getStorageSync('my_location')
					city_code = my_location.ad_info.city_code
				} else {
					//外卖方式：充用户选择的地址中获取区域编码
					city_code = '156' + that.address.city_code
				}

				//加载用户当前所在城市所有店铺
				let res = await db.collection("wfy-shop").where("concat('156',city_code)== '" + city_code + "' ").get()
				console.log('wfy-shop', res)
				let shops = []
				if (res.result.code == 0) {
					shops = res.result.data
				}
				if (shops.length == 0) {
					this.goods_categories = []
					this.currentCateI = undefined
					this.goods = []
					uni.hideLoading()
					return
				}

				//处理店铺营业状态
				util.processShopBusinessState(shops)

				//批量计算距离
				let targetArray = []
				for (let i = 0; i < shops.length; i++) {
					targetArray.push({
						'latitude': shops[i].latitude,
						'longitude': shops[i].longitude
					})
				}
				res = await util.calculateDistance(targetArray)
				console.log('calculateDistance', res)
				for (let i = 0; i < res.length; i++) {
					shops[i].distance = res[i].distance
				}

				//按距离从近到远排序
				const sortedShops = shops.sort(function(a, b) {
					return a.distance - b.distance
				})

				//选中第一个营业状态的店铺
				for (let i = 0; i < sortedShops.length; i++) {
					if (sortedShops[i].state == '营业') {
						that.SET_STORE(sortedShops[i])
						break
					}
				}

				//如果全部都打烊了，就只能设置第一个店铺了
				if (that.store == undefined) {
					that.SET_STORE(sortedShops[0])
				}
			}
			//选择店铺的逻辑 end

			//加载商品分类
			const categories = await db.collection('wfy-goods-categories')
				.where(this.isFresh ? "name=='锁鲜'" : "name!='锁鲜'")
				.orderBy('sort')
				.get()
			console.log('wfy-goods-categories', categories)
			that.goods_categories = categories.result.data
			that.currentCateId = that.goods_categories[0]._id

			//加载所有商品
			const tmpCate = await db.collection('wfy-goods-categories')
				.where(this.isFresh ? "name=='锁鲜'" : "name!='锁鲜'")
				.getTemp()
			const goods = await db.collection(tmpCate, 'wfy-goods').get()
			console.log('wfy-goods', goods)
			that.goods = goods.result.data

			//加载系统参数
			const parameter = await db.collection('wfy-system-parameter').where("name=='外卖起送金额'").limit(1).get()
			console.log('wfy-system-parameter', parameter)
			that.wmqsje = parseInt(parameter.result.data[0].value)

			uni.hideLoading()
		},
		computed: {
			...mapState(['orderType', 'address', 'store', 'cart']),
			//计算单个饮品添加到购物车的数量
			goodCartNum() {
				return (id) => this.cart.reduce((acc, cur) => {
					if (cur._id === id) {
						return acc += cur.number
					}
					return acc
				}, 0)
			},
			menuCartNum() {
				return (id) => this.cart.reduce((acc, cur) => {
					if (cur.cate_id === id) {
						return acc += cur.number
					}
					return acc
				}, 0)
			},
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
		methods: {
			...mapMutations(['SET_ORDER_TYPE', 'SET_STORE', 'ADD_TO_CART', 'MODIFY_GOODS_IN_CART', 'DELETE_GOODS_IN_CART', 'CLEAR_CART']),
			formatDistance(distance) {
				return util.formatDistance(distance)
			},
			selectStore() {
				if (this.cart.length > 0) {
					let that = this
					uni.showModal({
						title: '确认',
						content: '切换店铺将会清空购物车中的商品，是否确认？',
						success: function(r) {
							if (r.confirm) {
								that.CLEAR_CART()
								uni.navigateTo({
									url: '/pages/select-store/select-store'
								})
							}
						}
					})
				} else {
					uni.navigateTo({
						url: '/pages/select-store/select-store'
					})
				}
			},
			selectAddress() {
				if (this.cart.length > 0) {
					let that = this
					uni.showModal({
						title: '确认',
						content: '更换收货地址将会清空购物车中的商品，是否确认？',
						success: function(r) {
							if (r.confirm) {
								that.CLEAR_CART()
								uni.navigateTo({
									url: '/pages/address/address?is_choose=true'
								})
							}
						}
					})
				} else {
					uni.navigateTo({
						url: '/pages/address/address?is_choose=true'
					})
				}
			},
			switchOrderType(ot) {
				if (this.cart.length > 0) {
					let that = this
					uni.showModal({
						title: '确认',
						content: '更改取餐方式将会清空购物车中的商品，是否确认？',
						success: function(r) {
							if (r.confirm) {
								that.CLEAR_CART()
								if (ot == 'takein') {
									that.SET_ORDER_TYPE(ot)
								} else if (ot == 'takeout') {
									uni.navigateTo({
										url: '/pages/address/address?is_choose=true'
									})
								}
							}
						}
					})
				} else {
					if (ot == 'takein') {
						this.SET_ORDER_TYPE(ot)
					} else if (ot == 'takeout') {
						uni.navigateTo({
							url: '/pages/address/address?is_choose=true'
						})
					}
				}
			},
			handleMenuTap(id) { //点击菜单项事件
				console.log(id)
				if (!this.sizeCalcState) {
					this.calcSize()
				}

				this.currentCateId = id
				this.$nextTick(() => this.cateScrollTop = this.goods.find(item => item._id._value == id).top)
			},
			handleGoodsScroll({
				detail
			}) { //商品列表滚动事件
				if (!this.sizeCalcState) {
					this.calcSize()
				}
				const {
					scrollTop
				} = detail
				let tabs = this.goods.filter(item => item.top <= scrollTop).reverse()
				if (tabs.length > 0) {
					this.currentCateId = tabs[0]._id._value
				}
			},
			calcSize() {
				let h = 10

				/*
				let view = uni.createSelectorQuery().select('#ads')
				view.fields({
					size: true
				}, data => {
					h += Math.floor(data.height)
				}).exec()
				*/

				this.goods.forEach(item => {
					console.log(item)
					let view = uni.createSelectorQuery().select(`#cate-${item._id._value}`)
					view.fields({
						size: true
					}, data => {
						item.top = h
						h += data.height
						item.bottom = h
					}).exec()
				})
				this.sizeCalcState = true
			},
			handleAddToCart(good, num) {
				this.ADD_TO_CART(good)
			},
			handleReduceFromCart(good) {
				const index = this.cart.findIndex(item => item._id === good._id)
				if (index > -1) {
					// this.cart[index].number -= 1

					let obj = this.cart[index]
					obj.number -= 1
					//this.$set(this.cart, index, obj)

					if (obj.number <= 0) {
						//this.cart.splice(index, 1)
						this.DELETE_GOODS_IN_CART(index)
					} else {
						this.MODIFY_GOODS_IN_CART({
							index: index,
							goods: obj
						})
					}
				}
			},
			showGoodDetailModal(good) {
				if (this.isFresh) {
					uni.navigateTo({
						url: '/pages/fresh-product/fresh-product?id=' + good._id
					})
				} else {
					this.good = JSON.parse(JSON.stringify({
						...good,
						number: 1
					}))
					this.goodDetailModalVisible = true
				}
			},
			closeGoodDetailModal() { //关闭饮品详情模态框
				this.goodDetailModalVisible = false
				this.good = {}
			},
			changePropertyDefault(index, key) { //改变默认属性值
				this.good.property[index].values.forEach(value => this.$set(value, 'is_default', 0))
				this.good.property[index].values[key].is_default = 1
				this.good.number = 1
			},
			getGoodSelectedProps(good, type = 'text') { //计算当前饮品所选属性
				if (good.use_property) {
					let props = []
					good.property.forEach(({
						values
					}) => {
						values.forEach(value => {
							if (value.is_default) {
								props.push(type === 'text' ? value.value : value.id)
							}
						})
					})
					return type === 'text' ? props.join('，') : props
				}
				return ''
			},
			handlePropertyAdd() {
				this.good.number += 1
			},
			handlePropertyReduce() {
				if (this.good.number === 1) return
				this.good.number -= 1
			},
			handleAddToCartInModal() {
				// const product = Object.assign({}, this.good, {
				// 	props_text: this.getGoodSelectedProps(this.good),
				// 	props: this.getGoodSelectedProps(this.good, 'id')
				// })
				this.handleAddToCart(this.good, this.good.number)
				this.closeGoodDetailModal()
			},
			openCartPopup() { //打开/关闭购物车列表popup
				this.cartPopupVisible = !this.cartPopupVisible
			},
			handleCartClear() { //清空购物车
				uni.showModal({
					title: '提示',
					content: '确定清空购物车么',
					success: ({
						confirm
					}) => {
						if (confirm) {
							this.cartPopupVisible = false
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

				uni.navigateTo({
					url: '/pages/pay/pay'
				})
				uni.hideLoading()
			},
			back() {
				uni.switchTab({
					url: '/pages/index/index'
				})
			}
		}
	};
</script>

<style lang="scss" scoped>
	@import '~@/pages/menu/menu.scss';
</style>
