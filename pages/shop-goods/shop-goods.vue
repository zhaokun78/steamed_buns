<template>
	<view>
		<block v-if="myShop">
			<uni-search-bar cancelButton="none" @confirm="search_confirm" @input="search_input"></uni-search-bar>
			<uni-list>
				<uni-list-item v-for="(item,index) in goods_list" :key="item._id" :thumb="item.goods_thumb.url" thumb-size="lg" rightText="是否上架"
					:title="item.name" :note="item.note" :show-switch="true" :switchChecked="item.is_on_sale" clickable @click="onClick($event,item)"
					@switchChange="switchChange($event,item)">
				</uni-list-item>
			</uni-list>
			<uni-popup ref="popup" type="dialog">
				<uni-popup-dialog mode="base" :title="shop_goods_name" :duration="2000" :before-close="true" @close="close" @confirm="confirm">
					<uni-number-box v-model="shop_goods_price" :min="1" :max="500"></uni-number-box>
				</uni-popup-dialog>
			</uni-popup>
		</block>
		<block v-else>
			<text>仅店主可见</text>
		</block>
	</view>
</template>

<script>
	import Vue from 'vue'
	export default {
		data() {
			return {
				myShop: undefined,
				goods_list: [], //平台中所有商品
				shop_goods_id: '', //当前编辑的店铺商品ID
				shop_goods_name: '', //当前编辑的店铺商品名称
				shop_goods_price: 0, //当前编辑的店铺商品价格
				isSwitch: false,
			}
		},
		onLoad() {
			const db = uniCloud.database()

			//查询本人的店铺
			db.collection('wfy-shop').where('owner_id==$cloudEnv_uid').limit(1).get().then((r) => {
				console.log('wfy-shop', r)
				if (r.result.code == 0) {
					this.myShop = r.result.data[0]

					this.search()
				}
			})
		},
		methods: {
			async search(value) {
				let searchWhere
				if (value) {
					searchWhere = "/" + value + "/.test(name) && is_on_sale == true"
				} else {
					searchWhere = "is_on_sale == true"
				}

				let that = this
				const db = uniCloud.database()

				//查询本人店铺的所有下架或设置过店铺价格的商品
				let r1 = await db.collection('wfy-shop-goods')
					.where("shop_id=='" + that.myShop._id + "'")
					.get()
				console.log('wfy-shop-goods', r1)
				if (r1.result.code != 0) {
					return
				}
				let shop_goods = r1.result.data

				//查询平台的所有上架商品
				let r = await db.collection('wfy-goods')
					.where(searchWhere)
					.orderBy("name", "asc")
					.get()
				console.log('wfy-goods', r)
				if (r.result.code != 0) {
					return
				}

				//此时循环平台所有商品，判断每一个商品是否在 店铺_商品 集合中，
				//再进一步处理商品是否上级及是否设置过店铺价格
				for (let i = 0; i < r.result.data.length; i++) {
					r.result.data[i].note = '平台价格：' + (r.result.data[i].price / 100) + '元'
					//只有杂货允许修改价格
					if (r.result.data[i].is_groceries) {
						const index = shop_goods.findIndex(g => {
							return g.goods_id === r.result.data[i]._id
						})
						if (index > -1) {
							r.result.data[i].is_on_sale = shop_goods[index].is_on_sale
							if (shop_goods[index].price && shop_goods[index].price > 0) {
								r.result.data[i].shop_goods_price = shop_goods[index].price
								r.result.data[i].note += '\n店铺价格：' + (shop_goods[i].price / 100) + '元\n点击修改店铺价格'
							} else {
								r.result.data[i].note += '\n点击设置店铺价格'
							}
						} else {
							r.result.data[i].note += '\n点击设置店铺价格'
						}
					}
				}

				that.goods_list = r.result.data
			},
			search_confirm(e) {
				this.search(e.value)
			},
			search_input(e) {
				this.search(e)
			},
			onClick(e, item) {
				if (this.isSwitch) {
					this.isSwitch = false
					return
				}

				if (!item.is_groceries) {
					return
				}

				if (item.is_on_sale == false) {
					uni.showModal({
						showCancel: false,
						title: '提示',
						content: '下架商品不允许调整价格！'
					})
					return
				}

				console.log('onClick', e, item)
				this.shop_goods_id = item._id
				this.shop_goods_name = item.name
				if (item.shop_goods_price) {
					this.shop_goods_price = item.shop_goods_price / 100
				} else {
					this.shop_goods_price = item.price / 100
				}
				this.$refs.popup.open()
			},
			close() {
				console.log('on close')
				this.shop_goods_id = ''
				this.shop_goods_name = ''
				this.shop_goods_price = 0
				this.$refs.popup.close()
			},
			async confirm() {
				const index = this.goods_list.findIndex(g => {
					return g._id == this.shop_goods_id
				})
				if (index > -1) {
					const db = uniCloud.database()
					let res = await db.collection('wfy-shop-goods')
						.where("shop_id=='" + this.myShop._id + "' && goods_id=='" + this.shop_goods_id + "'")
						.limit(1).get()
					if (res.result.code == 0) {
						if (res.result.data.length == 0) {
							db.collection('wfy-shop-goods').add({
								shop_id: this.myShop._id,
								goods_id: this.shop_goods_id,
								price: this.shop_goods_price * 100,
								is_on_sale: true,
							}).then((r) => {
								console.log('wfy-shop-goods add', r)
							})
						} else {
							db.collection('wfy-shop-goods')
								.where("shop_id=='" + this.myShop._id + "' && goods_id=='" + this.shop_goods_id + "'")
								.update({
									price: this.shop_goods_price * 100
								})
								.then((r) => {
									console.log('wfy-shop-goods update', r)
								})
						}
					}

					let obj = this.goods_list[index]
					obj.shop_goods_price = this.shop_goods_price * 100
					obj.note = '平台价格：' + (obj.price / 100) + '元\n店铺价格：' + (obj.shop_goods_price / 100) + '元\n点击修改店铺价格'
					Vue.set(this.goods_list, index, obj)
				}
				this.close()
			},
			switchChange(e, item) {
				console.log('switchChange', e, item)
				this.isSwitch = true

				const index = this.goods_list.findIndex(g => {
					return g._id === item._id
				})
				if (index > -1) {
					item.is_on_sale = e.value
					Vue.set(this.goods_list, index, item)
				}

				const db = uniCloud.database()
				//上架
				if (e.value) {
					//之前必然进行过下架操作，直接 update 即可
					db.collection('wfy-shop-goods')
						.where("shop_id=='" + this.myShop._id + "' && goods_id=='" + item._id + "'")
						.update({
							is_on_sale: true
						})
						.then((r) => {
							console.log('wfy-shop-goods update', r)
						})
				}
				//下架
				else {
					//可能是第一次执行下架操作，那么 wfy-shop-goods 表里就没有记录，因此需要先查询一下
					db.collection('wfy-shop-goods')
						.where("shop_id=='" + this.myShop._id + "' && goods_id=='" + item._id + "'")
						.limit(1).get().then((res) => {
							if (res.result.code == 0) {
								//如果表里没有记录则新增
								if (res.result.data.length == 0) {
									db.collection('wfy-shop-goods').add({
										shop_id: this.myShop._id,
										goods_id: item._id,
										is_on_sale: false
									}).then((r) => {
										console.log('wfy-shop-goods add', r)
									})
								}
								//如果表里已经有记录就 update
								else {
									db.collection('wfy-shop-goods')
										.where("shop_id=='" + this.myShop._id + "' && goods_id=='" + item._id + "'")
										.update({
											is_on_sale: false
										})
										.then((r) => {
											console.log('wfy-shop-goods update', r)
										})
								}
							}
						})
				}
			},
		}
	}
</script>

<style>

</style>
