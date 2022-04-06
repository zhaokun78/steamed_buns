<template>
	<view class="uni-container">
		<uni-forms ref="form" :value="formData" validate-trigger="submit" err-show-type="toast">
			<uni-forms-item name="type" label="店铺类型" required>
				<uni-data-checkbox v-model="formData.type" :disabled="true" :localdata="formOptions.type_localdata"></uni-data-checkbox>
			</uni-forms-item>
			<uni-forms-item name="name" label="店铺名称" required>
				<uni-easyinput placeholder="店铺名称" v-model="formData.name" :disabled="true"></uni-easyinput>
			</uni-forms-item>
			<uni-forms-item name="city_code" label="所在城市" required>
				<uni-data-picker ref="city_picker" self-field="code" parent-field="parent_code" v-model="formData.city_code"
					collection="opendb-city-china" field="code as value, name as text, eq(type, 2) as isleaf" where="type!=2" orderby="value asc"
					@popupopened="onpopupopened">
				</uni-data-picker>
			</uni-forms-item>
			<uni-forms-item name="address" label="详细地址" required>
				<uni-easyinput placeholder="详细地址" v-model="formData.address" :disabled="true"></uni-easyinput>
			</uni-forms-item>
			<uni-forms-item name="longitude" label="经度" required>
				<uni-easyinput placeholder="经度" v-model="formData.longitude" :disabled="true"></uni-easyinput>
			</uni-forms-item>
			<uni-forms-item name="latitude" label="纬度" required>
				<uni-easyinput placeholder="纬度" v-model="formData.latitude" :disabled="true"></uni-easyinput>
			</uni-forms-item>
			<uni-forms-item name="phone" label="电话" required>
				<uni-easyinput placeholder="电话" v-model="formData.phone"></uni-easyinput>
			</uni-forms-item>
			<uni-forms-item name="business_hour_start" label="每天几点开始营业" required>
				<slider :min="0" :max="23" :show-value="true" @change="binddata('business_hour_start', $event.detail.value)"
					:value="formData.business_hour_start"></slider>
			</uni-forms-item>
			<uni-forms-item name="business_hour_end" label="每天几点结束营业" required>
				<slider :min="0" :max="23" :show-value="true" @change="binddata('business_hour_end', $event.detail.value)"
					:value="formData.business_hour_end"></slider>
			</uni-forms-item>
			<uni-forms-item name="business_state" label="营业状态" required>
				<uni-data-checkbox v-model="formData.business_state" :localdata="formOptions.business_state_localdata"></uni-data-checkbox>
			</uni-forms-item>
			<uni-forms-item name="delivery_amount" label="外卖起送金额（分）">
				<uni-easyinput placeholder="外卖起送金额（分），0 代表取公共配置" type="number" v-model="formData.delivery_amount"></uni-easyinput>
			</uni-forms-item>
			<view class="uni-button-group">
				<button type="primary" class="uni-button" @click="submit">提交</button>
			</view>
		</uni-forms>
	</view>
</template>

<script>
	import {
		validator
	} from '../../js_sdk/validator/wfy-shop.js';

	const db = uniCloud.database();
	const dbCollectionName = 'wfy-shop';

	function getValidator(fields) {
		let result = {}
		for (let key in validator) {
			if (fields.indexOf(key) > -1) {
				result[key] = validator[key]
			}
		}
		return result
	}

	export default {
		data() {
			let formData = {
				"type": null,
				"name": "",
				"city_code": "",
				"address": "",
				"longitude": "",
				"latitude": "",
				"phone": "",
				"business_hour_start": 6,
				"business_hour_end": 18,
				"business_state": 0,
				"delivery_amount": 0
			}
			return {
				formData,
				formOptions: {
					"type_localdata": [{
							"text": "直营店",
							"value": 0
						},
						{
							"text": "加盟店",
							"value": 1
						}
					],
					"business_state_localdata": [{
							"text": "自动",
							"value": 0
						},
						{
							"text": "营业",
							"value": 1
						},
						{
							"text": "打烊",
							"value": 2
						}
					]
				},
				rules: {
					...getValidator(Object.keys(formData))
				}
			}
		},
		onLoad(e) {
			if (e.id) {
				const id = e.id
				this.formDataId = id
				this.getDetail(id)
			}
		},
		onReady() {
			this.$refs.form.setRules(this.rules)
		},
		methods: {
			/**
			 * 验证表单并提交
			 */
			submit() {
				uni.showLoading({
					mask: true
				})
				this.$refs.form.validate().then((res) => {
					return this.submitForm(res)
				}).catch(() => {}).finally(() => {
					uni.hideLoading()
				})
			},

			/**
			 * 提交表单
			 */
			submitForm(value) {
				// 使用 clientDB 提交数据
				return db.collection(dbCollectionName).doc(this.formDataId).update(value).then((res) => {
					uni.showToast({
						icon: 'none',
						title: '修改成功'
					})
					this.getOpenerEventChannel().emit('refreshData')
					setTimeout(() => uni.navigateBack(), 500)
				}).catch((err) => {
					uni.showModal({
						content: err.message || '请求服务失败',
						showCancel: false
					})
				})
			},

			/**
			 * 获取表单数据
			 * @param {Object} id
			 */
			getDetail(id) {
				uni.showLoading({
					mask: true
				})
				db.collection(dbCollectionName).doc(id).field(
						"type,name,city_code,address,longitude,latitude,phone,business_hour_start,business_hour_end,business_state,delivery_amount")
					.get().then((res) => {
						const data = res.result.data[0]
						if (data) {
							this.formData = data
						}
					}).catch((err) => {
						uni.showModal({
							content: err.message || '请求服务失败',
							showCancel: false
						})
					}).finally(() => {
						uni.hideLoading()
					})
			},
			onpopupopened() {
				this.$refs.city_picker.hide()
			}
		}
	}
</script>

<style>
	.uni-container {
		padding: 15px;
	}

	.uni-input-border,
	.uni-textarea-border {
		width: 100%;
		font-size: 14px;
		color: #666;
		border: 1px #e5e5e5 solid;
		border-radius: 5px;
		box-sizing: border-box;
	}

	.uni-input-border {
		padding: 0 10px;
		height: 35px;

	}

	.uni-textarea-border {
		padding: 10px;
		height: 80px;
	}

	.uni-button-group {
		margin-top: 50px;
		/* #ifndef APP-NVUE */
		display: flex;
		/* #endif */
		justify-content: center;
	}

	.uni-button {
		width: 184px;
		padding: 12px 20px;
		font-size: 14px;
		border-radius: 4px;
		line-height: 1;
		margin: 0;
	}
</style>
