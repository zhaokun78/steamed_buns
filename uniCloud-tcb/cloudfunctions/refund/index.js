'use strict';
const fs = require('fs')
const path = require('path')
const createConfig = require('uni-config-center')
const uniPay = require('uni-pay')

const db = uniCloud.database()
exports.main = async (event, context) => {
	try {
		const uniPayConfig = createConfig({
			pluginId: 'uni-pay'
		})
		const {
			wxConfigMp,
		} = uniPayConfig.requireFile('config.js')
		let {
			outTradeNo
		} = event

		//查询订单
		const orderList = await db.collection('uni-id-base-order').where({
			_id: outTradeNo
		}).get()
		console.log('uni-id-base-order', orderList)
		if (orderList.data.length !== 1 || orderList.data[0].status !== 6) {
			return {
				code: -2,
				msg: '订单状态不正确'
			}
		}

		//初始化unipay
		let uniPayInstance = uniPay.initWeixin({
			appId: wxConfigMp.appId,
			mchId: wxConfigMp.mchId,
			key: wxConfigMp.key,
			pfx: fs.readFileSync(path.resolve(__dirname, './apiclient_cert.p12')), // 建议以p12文件绝对路径进行读取，使用微信退款时需要
		})

		//退款
		let refundRes = await uniPayInstance.refund({
			transactionId: orderList.data[0].transaction_id,
			outRefundNo: orderList.data[0]._id,
			totalFee: orderList.data[0].total_fee,
			refundFee: orderList.data[0].total_fee,
			notifyUrl: 'https://tcb-bb7ntsh47c91a5-2d6u310c2810e.service.tcloudbase.com/refund-notify'
		})
		console.log('refund', refundRes)

		//更新订单
		let updateRes = await db.collection('uni-id-base-order').where({
			_id: outTradeNo
		}).update({
			status: 7,
			is_refund: true,
			refundId: refundRes.refundId
		})
		console.log('uni-id-base-order update', updateRes)

		return {
			code: 0
		}
	} catch (e) {
		console.log('err', e)
		return {
			code: -1,
			msg: e
		}
	}
};
