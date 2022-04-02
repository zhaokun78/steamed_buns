<template>
	<view>
		<block v-if="myShop">
			<uni-search-bar cancelButton="none" @confirm="search_confirm" @input="search_input"></uni-search-bar>
			<uni-list>
				<uni-list-item v-for="(item,index) in goods_list" :key="item._id" :thumb="item.goods_thumb.url" thumb-size="lg" rightText="是否上架"
					:title="item.name" :show-switch="true" :switchChecked="item.is_on_sale" @switchChange="switchChange($event,item)">
				</uni-list-item>
			</uni-list>
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
				shop_goods: [], //本人店铺下架的商品
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
			search(value) {
				let searchWhere
				if (value) {
					searchWhere = "/" + value + "/.test(name) && is_on_sale == true"
				} else {
					searchWhere = "is_on_sale == true"
				}

				let that = this
				const db = uniCloud.database()

				//查询平台的所有上架商品
				db.collection('wfy-goods')
					.where(searchWhere)
					.orderBy("name", "asc")
					.get()
					.then((r) => {
						console.log('wfy-goods', r)
						if (r.result.code == 0) {
							that.goods_list = r.result.data

							//查询本人店铺的所有下架商品
							db.collection('wfy-shop-goods').where("shop_id=='" + that.myShop._id + "'").get().then((r1) => {
								console.log('wfy-shop-goods', r1)
								if (r1.result.code == 0) {
									that.shop_goods = r1.result.data

									//处理平台商品下架
									for (let i = 0; i < that.shop_goods.length; i++) {
										const index = that.goods_list.findIndex(g => {
											return g._id === that.shop_goods[i].goods_id
										})
										console.log(index)
										if (index > -1) {
											let obj = that.goods_list[index]
											obj.is_on_sale = false
											Vue.set(that.goods_list, index, obj)
										}
									}
								}
							})
						}
					})
			},
			search_confirm(e) {
				this.search(e.value)
			},
			search_input(e) {
				this.search(e)
			},
			switchChange(e, item) {
				console.log('switchChange', e, item)

				const index = this.goods_list.findIndex(g => {
					return g._id === item._id
				})
				if (index > -1) {
					item.is_on_sale = e.value
					Vue.set(this.goods_list, index, item)
				}

				const db = uniCloud.database()
				if (e.value) {
					db.collection('wfy-shop-goods')
						.where("shop_id=='" + this.myShop._id + "' && goods_id=='" + item._id + "'")
						.limit(1).remove().then((r) => {
							console.log('wfy-shop-goods remove', r)
						})
				} else {
					db.collection('wfy-shop-goods').add({
						shop_id: this.myShop._id,
						goods_id: item._id
					}).then((r) => {
						console.log('wfy-shop-goods add', r)
					})
				}
			},
		}
	}
</script>

<style>

</style>
