<template>
	<view>
		<uni-list>
			<uni-list-item class="item">
				<template v-slot:body>
					<view class="item">
						<text>{{$t('userinfo.ProfilePhoto')}}</text>
						<cloud-image @click="uploadAvatarImg" v-if="avatar_file" :src="avatar_file.url" width="50px" height="50px"></cloud-image>
						<uni-icons @click="uploadAvatarImg" v-else class="chooseAvatar" type="plusempty" size="30" color="#dddddd"></uni-icons>
					</view>
				</template>
			</uni-list-item>
			<uni-list-item class="item" @click="setNickname('')" :title="$t('userinfo.nickname')"
				:rightText="userInfo.nickname||$t('userinfo.notSet')" link>
			</uni-list-item>
			<uni-list-item class="item" @click="bindMobile" :title="$t('userinfo.phoneNumber')"
				:rightText="userInfo.mobile||$t('userinfo.notSpecified')" link>
			</uni-list-item>
			<!--
			<uni-list-item v-if="myShop" class="item" @click="profitSharingAddReceiver" title="店主身份绑定"
				:rightText="myShop.is_profit_sharing_receiver? '已绑定':'未绑定'" link>
			</uni-list-item>
			-->
			<!--
			<uni-list-item class="item" @click="meituan" title="美团调用" link>
			</uni-list-item>
			-->
		</uni-list>
		<uni-popup ref="dialog" type="dialog">
			<uni-popup-dialog mode="input" :value="userInfo.nickname" @confirm="setNickname" :title="$t('userinfo.setNickname')"
				:placeholder="$t('userinfo.setNicknamePlaceholder')">
			</uni-popup-dialog>
		</uni-popup>
		<uni-bindMobileByMpWeixin ref="uni-bindMobileByMpWeixin"></uni-bindMobileByMpWeixin>
	</view>
</template>
<script>
	import {
		mapMutations,
		mapGetters
	} from 'vuex';
	const db = uniCloud.database();
	const usersTable = db.collection('uni-id-users')
	export default {
		data() {
			return {
				myShop: undefined,
				univerifyStyle: {
					authButton: {
						"title": "本机号码一键绑定", // 授权按钮文案
					},
					otherLoginButton: {
						"title": "其他号码绑定",
					}
				}
			}
		},
		onLoad() {
			this.univerifyStyle.authButton.title = this.$t('userinfo.bindPhoneNumber')
			this.univerifyStyle.otherLoginButton.title = this.$t('userinfo.bindOtherLogin')
			uni.setNavigationBarTitle({
				title: this.$t('userinfo.navigationBarTitle')
			})
			//加载本人店铺
			db.collection('wfy-shop').where("owner_id=='" + this.userInfo._id + "'").get().then((r) => {
				console.log('wfy-shop', r)
				if (r.result.code == 0 && r.result.data.length == 1) {
					this.myShop = r.result.data[0]
				}
			})
		},
		computed: {
			...mapGetters({
				userInfo: 'user/info',
				login: 'user/hasLogin'
			}),
			avatar_file() {
				if (this.userInfo.avatar_file && this.userInfo.avatar_file.url) {
					return this.userInfo.avatar_file
				}
			}
		},
		methods: {
			...mapMutations({
				setUserInfo: 'user/login'
			}),
			bindMobile() {
				// #ifdef APP-PLUS
				uni.preLogin({
					provider: 'univerify',
					success: this.univerify(), //预登录成功
					fail: (res) => { // 预登录失败
						// 不显示一键登录选项（或置灰）
						console.log(res)
						this.bindMobileBySmsCode()
					}
				})
				// #endif

				// #ifdef MP-WEIXIN
				this.$refs['uni-bindMobileByMpWeixin'].open()
				// #endif

				// #ifdef H5
				//...去用验证码绑定
				this.bindMobileBySmsCode()
				// #endif
			},
			univerify() {
				uni.login({
					"provider": 'univerify',
					"univerifyStyle": this.univerifyStyle,
					success: async e => {
						console.log(e.authResult);
						uniCloud.callFunction({
							name: 'uni-id-cf',
							data: {
								action: 'bindMobileByUniverify',
								params: e.authResult,
							},
							success: ({
								result
							}) => {
								console.log(result);
								if (result.code === 0) {
									this.setUserInfo({
										"mobile": result.mobile
									})
									uni.closeAuthView()
								} else {
									uni.showModal({
										content: result.msg,
										showCancel: false,
										complete() {
											uni.closeAuthView()
										}
									});
								}
							}
						})
					},
					fail: (err) => {
						console.log(err);
						if (err.code == '30002' || err.code == '30001') {
							this.bindMobileBySmsCode()
						}
					}
				})
			},
			bindMobileBySmsCode() {
				uni.navigateTo({
					url: '/pages/ucenter/userinfo/bind-mobile/bind-mobile'
				})
			},
			setNickname(nickname) {
				console.log(nickname);
				if (nickname) {
					usersTable.where('_id==$env.uid').update({
						nickname
					}).then(e => {
						console.log(e);
						if (e.result.updated) {
							uni.showToast({
								title: this.$t('common.updateSucceeded'),
								icon: 'none'
							});
							this.setUserInfo({
								nickname
							});
						} else {
							uni.showToast({
								title: this.$t('userinfo.noChange'),
								icon: 'none'
							});
						}
					})
					this.$refs.dialog.close()
				} else {
					this.$refs.dialog.open()
				}
			},
			setAvatarFile(avatar_file) {
				uni.showLoading({
					title: this.$t('userinfo.setting'),
					mask: true
				});
				// 使用 clientDB 提交数据
				usersTable.where('_id==$env.uid').update({
					avatar_file
				}).then((res) => {
					console.log(res);
					if (avatar_file) {
						uni.showToast({
							icon: 'none',
							title: this.$t('userinfo.setSucceeded')
						})
					} else {
						uni.showToast({
							icon: 'none',
							title: this.$t('userinfo.deleteSucceeded')
						})
					}
					this.setUserInfo({
						avatar_file
					});
				}).catch((err) => {
					uni.showModal({
						content: err.message || this.$t('userinfo.requestFail'),
						showCancel: false
					})
				}).finally(() => {
					uni.hideLoading()
				})
			},
			profitSharingAddReceiver() {
				let that = this
				if (that.myShop.is_profit_sharing_receiver) {
					uni.showModal({
						showCancel: false,
						title: '提示',
						content: '已绑定，不允许重复绑定！'
					})
				} else {
					uni.showLoading({
						title: '请稍等'
					})
					uniCloud.callFunction({
						name: 'profit-sharing-add-receiver'
					}).then((res) => {
						console.log('profit-sharing-add-receiver', res)
						if (res.result.returnCode == 'SUCCESS') {
							db.collection('wfy-shop')
								.where("_id=='" + that.myShop._id + "' && owner_id == '" + that.userInfo._id + "'")
								.update({
									is_profit_sharing_receiver: true,
									profit_sharing_add_receiver_result: res
								}).then((r) => {
									uni.hideLoading()
									console.log('wfy-shop update', r)
									if (r.result.code == 0 && r.result.updated == 1) {
										uni.showModal({
											showCancel: false,
											title: '提示',
											content: '绑定成功！',
											success: function(r) {
												if (r.confirm) {
													that.myShop.is_profit_sharing_receiver = true
												}
											}
										})
									}
								})
						} else {
							uni.hideLoading()
						}
					})
				}
			},
			meituan() {
				uniCloud.callFunction({
					name: 'meituan'
				})
			},
			uploadAvatarImg(res) {
				const crop = {
					quality: 100,
					width: 600,
					height: 600,
					resize: true
				};
				uni.chooseImage({
					count: 1,
					crop,
					success: async (res) => {
						console.log(res);
						let tempFile = res.tempFiles[0],
							avatar_file = {
								// #ifdef H5
								extname: tempFile.name.split('.')[tempFile.name.split('.').length - 1],
								// #endif
								// #ifndef H5
								extname: tempFile.path.split('.')[tempFile.path.split('.').length - 1]
								// #endif
							},
							filePath = res.tempFilePaths[0]
						// #ifndef APP-PLUS
						//非app端用前端组件剪裁头像，app端用内置的原生裁剪
						filePath = await new Promise((callback) => {
							uni.navigateTo({
								url: '/pages/ucenter/userinfo/cropImage?path=' + filePath +
									`&options=${JSON.stringify(crop)}`,
								animationType: "fade-in",
								events: {
									success: url => {
										callback(url)
									}
								}
							});
						})
						// #endif
						console.log(this.userInfo);
						let cloudPath = this.userInfo._id + '' + Date.now()
						avatar_file.name = cloudPath
						uni.showLoading({
							title: this.$t('userinfo.uploading'),
							mask: true
						});
						let {
							fileID
						} = await uniCloud.uploadFile({
							filePath,
							cloudPath,
							fileType: "image"
						});
						// console.log(result)
						avatar_file.url = fileID
						console.log({
							avatar_file
						});
						uni.hideLoading()

						this.setAvatarFile(avatar_file)
					}
				})
			}
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

	/* #endif */
	.item {
		width: 750rpx;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
	}

	.chooseAvatar {
		border: dotted 1px #ddd;
		border-radius: 10px;
		text-align: center;
		width: 50px;
		height: 50px;
		line-height: 50px;
	}
</style>
