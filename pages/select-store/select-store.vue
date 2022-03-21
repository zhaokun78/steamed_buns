<template>
	<view>
		<uni-segmented-control :current="current" :values="items" @clickItem="onClickItem" styleType="text" activeColor="#4cd964">
		</uni-segmented-control>
		<view class="content">
			<view v-show="current === 0">
				<uni-search-bar placeholder="搜索店铺" @confirm="searchStore" @input="searchStore" @clear="clearSearchStore" @cancel="cancelSearchStore">
				</uni-search-bar>
				<view v-for="(item,index) in stores" :key="item._id">
					<uni-card mode="title" :title="item.name" :subTitle="item.state" :extra="formatDistance(item.distance)" @click="selectStore(item)"
						shadow="10px 10px 3px 10px rgba(0, 0, 0, 0.08)" :isShadow="true" note="true">
						<view>
							<view>
								<text class="txt">地&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;址：{{item.address}}</text>
							</view>
							<view>
								<text
									class="txt">营业时间：{{item.business_hour_start.toString().padStart(2,'0')+':00'}}-{{item.business_hour_end.toString().padStart(2,'0')+':00'}}</text>
							</view>
						</view>
						<template v-slot:footer>
							<view class="footer-box">
								<view>
									<image src='/static/images/mine/stxy.png' style="width: 30rpx; height: 30rpx;" class="mr-10"></image>
									<text class="footer-box__item">收藏店铺</text>
								</view>
								<view @tap="navigationToStore(item)">
									<image src='/static/images/mine/shdz.png' style="width: 30rpx; height: 30rpx;" class="mr-10"></image>
									<text class="footer-box__item">店铺导航</text>
								</view>
							</view>
						</template>
					</uni-card>
				</view>
			</view>
			<view v-show="current === 1">
				收藏店铺
			</view>
		</view>
	</view>
</template>

<script>
	import {
		mapState,
		mapMutations,
		mapActions,
		mapGetters
	} from 'vuex'

	import util from '@/common/util'

	export default {
		data() {
			return {
				stores: [], //店铺集合
				current: 0, //当前选择标签
				items: ['选择店铺', '收藏店铺'],
				latitude: undefined, //地图中心纬度
				longitude: undefined, //地图中心经度
				covers: [], //地图标记：选中店铺信息
			}
		},
		onLoad() {
			this.init()
		},
		methods: {
			...mapMutations(['SET_STORE']),
			init() {
				const db = uniCloud.database()

				//从 storage 中加载当前用户的定位信息
				const my_location = uni.getStorageSync('my_location')

				//加载用户当前所在城市所有店铺
				db.collection("wfy-shop").where("concat('156',city_code)== '" + my_location.ad_info.city_code + "' ").get().then((r) => {
					console.log('wfy-shop', r)

					//处理店铺营业状态
					util.processShopBusinessState(r.result.data)

					//店铺经纬度数组，用于批量计算距离
					let targetArray = []
					for (let i = 0; i < r.result.data.length; i++) {
						targetArray.push({
							'latitude': r.result.data[i].latitude,
							'longitude': r.result.data[i].longitude
						})
					}

					//批量计算距离
					let that = this
					util.calculateDistance(targetArray).then((res) => {
						console.log('calculateDistance', res)
						for (let i = 0; i < res.length; i++) {
							r.result.data[i].distance = res[i].distance
						}

						that.stores = r.result.data.sort(function(a, b) {
							return a.distance - b.distance
						})
					})
				})
			},
			//切换顶部标签
			onClickItem(e) {
				this.current = e.currentIndex
			},
			formatDistance(distance) {
				return util.formatDistance(distance)
			},
			selectStore(store) {
				if (store.state == '打烊') {
					uni.showModal({
						title: '提示',
						content: '该店铺已打烊！',
						showCancel: false,
					})

					return
				}

				this.SET_STORE(store)
				uni.navigateBack({
					delta: 1
				})
			},
			searchStore(e) {
				if (!e) {
					return
				}

				console.log('searchStore', e)
				let txt = undefined
				if (e.value) {
					txt = e.value
				} else {
					txt = e
				}

				const db = uniCloud.database()
				db.collection('wfy-shop').where("/" + txt + "/.test(name) || /" + txt + "/.test(address)").get().then((r) => {
					console.log('searchStore', r)
					this.stores = r.result.data
				})
			},
			clearSearchStore(e) {
				console.log('clearSearchStore', e)
			},
			cancelSearchStore(e) {
				this.init()
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
			}
		}
	}
</script>

<style>
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
