'use strict';
const createConfig = require('uni-config-center')
const uniPay = require('uni-pay')
exports.main = async (event, context) => {
	console.log(event)
	const uniPayConfig = createConfig({
		pluginId: 'uni-pay'
	})
	const {
		wxConfigMp,
		wxConfigMp_1626274711
	} = uniPayConfig.requireFile('config.js')

	//初始化unipay
	let uniPayInstance
	if (event.path.substring(1) == '1626274711') {
		uniPayInstance = uniPay.initWeixin(wxConfigMp_1626274711)
	} else {
		uniPayInstance = uniPay.initWeixin(wxConfigMp)
	}

	let res = await uniPayInstance.verifyRefundNotify(event)
	console.log(res)

	const db = uniCloud.database();
	//查询订单
	let order = await db.collection('uni-id-base-order').doc(res.outTradeNo).get()
	if (order.data.length == 1) {
		let updateRes
		if (res.refundStatus == 'SUCCESS') {
			updateRes = await db.collection('uni-id-base-order').doc(res.outTradeNo).update({
				status: 8,
				refund_time: new Date().getTime()
			})
		} else if (res.refundStatus == 'CHANGE') {
			updateRes = await db.collection('uni-id-base-order').doc(res.outTradeNo).update({
				status: -3,
				refund_deny_time: new Date().getTime()
			})
		} else if (res.refundStatus == 'REFUNDCLOSE') {
			updateRes = await db.collection('uni-id-base-order').doc(res.outTradeNo).update({
				status: -1,
				refund_deny_time: new Date().getTime()
			})
		}
		console.log('updateRes', updateRes)
	}

	// 注意如果处理成功需要严格按照下面的格式进行返回，否则厂商会持续通知
	// 微信处理成功之后 
	return {
		"mpserverlessComposedResponse": true,
		statusCode: 200,
		headers: {
			'content-type': 'text/xml;charset=utf-8'
		},
		body: `<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>`
	}
};
