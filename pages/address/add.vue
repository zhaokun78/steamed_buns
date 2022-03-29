<template>
	<view class="container">
		<view class="form-box">
			<view class="form">
				<list-cell :hover="false">
					<view class="form-input">
						<view class="label">收货人</view>
						<input class="input" placeholder="请输入收货人姓名" v-model="form.accept_name" placeholder-class="text-color-assist" />
					</view>
				</list-cell>
				<list-cell :hover="false">
					<view class="form-input">
						<view class="label">性别</view>
						<view class="radio-group">
							<view class="radio" :class="{'checked': !form.sex}" style="margin-right: 10rpx;" @tap="form.sex=0">先生</view>
							<view class="radio" :class="{'checked': form.sex}" @tap="form.sex=1">女士</view>
						</view>
					</view>
				</list-cell>
				<list-cell :hover="false">
					<view class="form-input">
						<view class="label">联系方式</view>
						<input class="input" placeholder="请输入收货人联系方式" v-model="form.mobile" placeholder-class="text-color-assist" />
					</view>
				</list-cell>
				<list-cell :hover="false">
					<view class="form-input">
						<view class="label">省市区</view>
						<uni-data-picker self-field="code" parent-field="parent_code" v-model="form.area_code" collection="opendb-city-china"
							field="code as value, name as text, eq(type, 2) as isleaf" orderby="value asc"></uni-data-picker>
					</view>
				</list-cell>
				<list-cell :hover="false">
					<view class="form-input">
						<view class="label">详细地址</view>
						<input class="input" placeholder="请输入收货人详细地址" v-model="form.address" placeholder-class="text-color-assist" />
					</view>
				</list-cell>
			</view>
			<view class="btn-section">
				<button type="primary" size="default" @tap="save">保存</button>
			</view>
		</view>
	</view>
</template>

<script>
	import listCell from '@/components/list-cell/list-cell'

	export default {
		components: {
			listCell
		},
		data() {
			return {
				form: {
					id: undefined,
					accept_name: '',
					sex: 0,
					mobile: '',
					area_code: '',
					address: ''
				}
			}
		},
		async onLoad({
			id
		}) {
			if (id) {
				uni.showLoading({
					title: '加载中...'
				})

				const db = uniCloud.database();
				let ret = await db.collection('uni-id-address').where("_id == '" + id + "'").get({
					getOne: true
				})
				console.log('uni-id-address', ret)
				this.form.id = ret.result.data._id
				this.form.accept_name = ret.result.data.name
				this.form.sex = ret.result.data.sex
				this.form.mobile = ret.result.data.mobile
				this.form.area_code = ret.result.data.area_code
				this.form.address = ret.result.data.address

				uni.hideLoading()
			}
		},
		methods: {
			save() {
				uni.showLoading({
					title: '请稍等...'
				})

				const db = uniCloud.database();

				//根据区级编码找到城市编码
				db.collection('opendb-city-china').where("code == '" + this.form.area_code + "'").limit(1).get().then((city) => {
					console.log('city', city)
					if (this.form.id) {
						db.collection('uni-id-address').where({
								_id: this.form.id
							}).update({
								'name': this.form.accept_name,
								'sex': this.form.sex,
								'mobile': this.form.mobile,
								'area_code': this.form.area_code,
								'city_code': city.result.data[0].parent_code,
								'address': this.form.address,
							}).then((res) => {
								uni.showModal({
									showCancel: false,
									title: '提示',
									content: '编辑地址成功！',
									success: function(r) {
										if (r.confirm) {
											uni.redirectTo({
												url: '/pages/address/address?is_choose=true'
											})
										}
									}
								})
							})
							.catch((err) => {
								uni.showModal({
									content: err.message || '编辑地址失败',
									showCancel: false
								})
							}).finally(() => {
								uni.hideLoading()
							})
					} else {
						db.collection('uni-id-address').add({
								'name': this.form.accept_name,
								'sex': this.form.sex,
								'mobile': this.form.mobile,
								'area_code': this.form.area_code,
								'city_code': city.result.data[0].parent_code,
								'address': this.form.address,
							}).then((res) => {
								uni.showModal({
									showCancel: false,
									title: '提示',
									content: '新增地址成功！',
									success: function(r) {
										if (r.confirm) {
											uni.redirectTo({
												url: '/pages/address/address?is_choose=true'
											})
										}
									}
								})
							})
							.catch((err) => {
								uni.showModal({
									content: err.message || '新增地址失败',
									showCancel: false
								})
							}).finally(() => {
								uni.hideLoading()
							})
					}
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.form-box {
		width: 100%;
		height: 100%;
		padding: 30rpx;
		display: flex;
		flex-direction: column;
		color: $text-color-base;

		.form-input {
			display: flex;
			align-items: center;
			width: 100%;
		}

		.label {
			width: 200rpx;
			font-size: $font-size-lg;
			color: $text-color-base;
			font-weight: 500;
		}

		.input {
			flex: 1;
			display: flex;
			align-items: center;
		}

		.radio-group {
			display: flex;
			justify-content: flex-start;

			.radio {
				padding: 10rpx 30rpx;
				border-radius: 6rpx;
				border: 2rpx solid $text-color-assist;
				color: $text-color-assist;
				font-size: $font-size-base;

				&.checked {
					background-color: $color-primary;
					color: $text-color-white;
					border: 2rpx solid $color-primary;
				}
			}
		}

		.btn-section {
			flex: 1;
			display: flex;
			align-items: center;
			justify-content: center;

			button {
				font-size: $font-size-base;
				height: 90rpx;
				border-radius: 50rem !important;
				width: 85%;
				display: flex;
				align-items: center;
				justify-content: center;
			}
		}
	}
</style>
