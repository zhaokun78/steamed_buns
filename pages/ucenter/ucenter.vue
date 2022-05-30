<template>
	<view class="center">
		<uni-sign-in ref="signIn"></uni-sign-in>
		<view class="userInfo" @click.capture="toUserInfo">
			<cloud-image width="150rpx" height="150rpx" v-if="userInfo.avatar_file&&userInfo.avatar_file.url" :src="userInfo.avatar_file.url">
			</cloud-image>
			<image v-else class="logo-img" src="@/static/uni-center/defaultAvatarUrl.png"></image>
			<view class="logo-title">
				<text class="uer-name" v-if="hasLogin">{{userInfo.nickname||userInfo.username||userInfo.mobile}}</text>
				<text class="uer-name" v-else>{{$t('mine.notLogged')}}</text>
			</view>
		</view>
		<uni-list class="center-list" v-for="(sublist , index) in ucenterList" :key="index">
			<uni-list-item v-if="myShop" title="我的店铺" link="navigateTo" clickable="true" @click="gotoMyShop" show-extra-icon="true"
				:extraIcon="{type:'shop',color:'#999'}">
			</uni-list-item>
			<uni-list-item v-if="myShop" title="店铺订单" link="navigateTo" clickable="true" @click="gotoShopOrder" show-extra-icon="true"
				:extraIcon="{type:'compose',color:'#999'}">
			</uni-list-item>
			<uni-list-item v-if="myShop" title="店铺商品" link="navigateTo" clickable="true" @click="gotoShopGoods" show-extra-icon="true"
				:extraIcon="{type:'compose',color:'#999'}">
			</uni-list-item>
			<!--
			<uni-list-item v-if="myShop" title="店铺流水" link="navigateTo" clickable="true" @click="" show-extra-icon="true"
				:extraIcon="{type:'compose',color:'#999'}">
			</uni-list-item>
			-->
			<uni-list-item v-for="(item,i) in sublist" :title="item.title" link="navigateTo" :rightText="item.rightText" :key="i" :clickable="true"
				:to="item.to" @click="ucenterListClick(item)" :show-extra-icon="true" :extraIcon="{type:item.icon,color:'#999'}">
				<template v-slot:footer>
					<view v-if="item.showBadge" class="item-footer">
						<text class="item-footer-text">{{item.rightText}}</text>
						<view class="item-footer-badge"></view>
					</view>
				</template>
			</uni-list-item>
		</uni-list>
	</view>
</template>

<script>
	import {
		mapGetters,
		mapMutations
	} from 'vuex';
	const db = uniCloud.database();
	export default {
		data() {
			return {
				myShop: undefined,
				ucenterList: [
					[{
						"title": this.$t('mine.settings'),
						"to": '/pages/ucenter/userinfo/userinfo',
						"icon": "gear"
					}, {
						"title": this.$t('mine.about'),
						"to": '/pages/ucenter/about/about',
						"icon": "info"
					}]
				],
			}
		},
		onShow() {
			db.collection('wfy-shop').where('owner_id==$cloudEnv_uid').limit(1).get().then((r) => {
				console.log('wfy-shop', r)
				if (r.result.code == 0) {
					this.myShop = r.result.data[0]
				}
			})
		},
		computed: {
			...mapGetters({
				userInfo: 'user/info',
				hasLogin: 'user/hasLogin'
			}),
		},
		methods: {
			...mapMutations({
				setUserInfo: 'user/login'
			}),
			signIn() { //普通签到
				this.$refs.signIn.open()
			},
			ucenterListClick(item) {
				if (!item.to && item.event) {
					this[item.event]();
				}
			},
			toUserInfo() {
				uni.navigateTo({
					url: '/pages/ucenter/userinfo/userinfo'
				})
			},
			gotoMyShop() {
				uni.navigateTo({
					url: '/pages/wfy-shop/edit?id=' + this.myShop._id
				})
			},
			gotoShopOrder() {
				uni.navigateTo({
					url: '/pages/shop-order/shop-order'
				})
			},
			gotoShopGoods() {
				uni.navigateTo({
					url: '/pages/shop-goods/shop-goods'
				})
			},
			/**
			 * 获取积分信息
			 */
			getScore() {
				if (!this.userInfo) return uni.showToast({
					title: this.$t('mine.checkScore'),
					icon: 'none'
				});
				uni.showLoading({
					mask: true
				})
				db.collection("uni-id-scores")
					.where('"user_id" == $env.uid')
					.field('score,balance')
					.orderBy("create_date", "desc")
					.limit(1)
					.get()
					.then((res) => {
						console.log(res);
						const data = res.result.data[0];
						let msg = '';
						msg = data ? (this.$t('mine.currentScore') + data.balance) : this.$t('mine.noScore');
						uni.showToast({
							title: msg,
							icon: 'none'
						});
					}).finally(() => {
						uni.hideLoading()
					})
			},
		}
	}
</script>

<style lang="scss" scoped>
	/* #ifndef APP-NVUE */
	view {
		display: flex;
		box-sizing: border-box;
		flex-direction: column;
	}

	page {
		background-color: #f8f8f8;
	}

	/* #endif*/

	.center {
		flex: 1;
		flex-direction: column;
		background-color: #f8f8f8;
	}

	.userInfo {
		width: 750rpx;
		padding: 20rpx;
		padding-top: 50px;
		background-image: url(../../static/uni-center/headers.png);
		flex-direction: column;
		align-items: center;
	}

	.logo-img {
		width: 150rpx;
		height: 150rpx;
		border-radius: 150rpx;
	}

	.logo-title {
		flex: 1;
		align-items: center;
		justify-content: space-between;
		flex-direction: row;
	}

	.uer-name {
		height: 100rpx;
		line-height: 100rpx;
		font-size: 38rpx;
		color: #FFFFFF;
	}

	.center-list {
		margin-bottom: 30rpx;
		background-color: #f9f9f9;
	}

	.center-list-cell {
		width: 750rpx;
		background-color: #007AFF;
		height: 40rpx;
	}

	.grid {
		background-color: #FFFFFF;
		margin-bottom: 6px;
	}

	.uni-grid .text {
		font-size: 30rpx;
		height: 25px;
		line-height: 25px;
		color: #817f82;
	}

	.uni-grid .item ::v-deep .uni-grid-item__box {
		justify-content: center;
		align-items: center;
	}


	/*修改边线粗细示例*/
	/* #ifndef APP-NVUE */
	.center-list ::v-deep .uni-list--border:after {
		-webkit-transform: scaleY(0.2);
		transform: scaleY(0.2);
		margin-left: 80rpx;
	}

	.center-list ::v-deep .uni-list--border-top,
	.center-list ::v-deep .uni-list--border-bottom {
		display: none;
	}

	/* #endif */
	.item-footer {
		flex-direction: row;
		align-items: center;
	}

	.item-footer-text {
		color: #999;
		font-size: 24rpx;
		padding-right: 10rpx;
	}

	.item-footer-badge {
		width: 20rpx;
		height: 20rpx;
		/* #ifndef APP-NVUE */
		border-radius: 50%;
		/* #endif */
		/* #ifdef APP-NVUE */
		border-radius: 10rpx;
		/* #endif */
		background-color: #DD524D;
	}
</style>
