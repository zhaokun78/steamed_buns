'use strict';
const createConfig = require('uni-config-center')
const uniPay = require('uni-pay')
const uniID = require('uni-id')

const db = uniCloud.database()
exports.main = async (event, context) => {
	const uniPayConfig = createConfig({
		pluginId: 'uni-pay'
	})
	const {
		wxConfigMp,
		wxConfigApp,
		wxConfigH5,
		aliConfigMp,
		aliConfigApp,
		aliConfigH5,
		// aliConfigSandbox
	} = uniPayConfig.requireFile('config.js')
	let {
		provider,
		outTradeNo,
		uniIdToken
	} = event

	const payload = await uniID.checkToken(uniIdToken)
	if (payload.code > 0) {
		return {
			code: 1001,
			msg: '用户身份验证失败，请重新登录'
		}
	}
	const uid = payload.uid

	const orderList = await db.collection('uni-id-base-order').where({
		_id: outTradeNo,
		user_id: uid
	}).get()

	if (orderList.data.length !== 1 || orderList.data[0].status !== 1) {
		return {
			code: -2,
			msg: '订单状态不正确'
		}
	}

	await db.collection('uni-id-base-order').where({
		_id: outTradeNo,
		user_id: uid
	}).update({
		pay_type: provider
	})

	const userList = await db.collection('uni-id-users').where({
		_id: uid
	}).get()
	const userInfo = userList.data[0]

	let uniPayInstance,
		notifyUrl =
		`https://tcb-bb7ntsh47c91a5-2d6u310c2810e.service.tcloudbase.com/payment-notify/${provider}_${context.PLATFORM}`,
		openid,
		tradeType
	// notifyUrl为接收通知的云函数的url，务必替换为自己的通知地址，云函数Url化请参考：https://uniapp.dcloud.io/uniCloud/http
	switch (provider + '_' + context.PLATFORM) {
		case 'wxpay_mp-weixin':
			uniPayInstance = uniPay.initWeixin(wxConfigMp)
			openid = userInfo.wx_openid['mp-weixin']
			tradeType = 'JSAPI'
			break;
		case 'alipay_mp-alipay':
			uniPayInstance = uniPay.initAlipay(aliConfigMp)
			openid = userInfo.ali_openid
			break;
		case 'wxpay_app-plus':
			uniPayInstance = uniPay.initWeixin(wxConfigApp)
			tradeType = 'APP'
			break;
		case 'alipay_app-plus':
			uniPayInstance = uniPay.initAlipay(aliConfigApp)
			break;
		case 'wxpay_h5':
			uniPayInstance = uniPay.initWeixin(wxConfigH5)
			tradeType = 'NATIVE'
			break;
		case 'alipay_h5':
			uniPayInstance = uniPay.initAlipay(aliConfigH5)
			// uniPayInstance = uniPay.initAlipay(aliConfigSandbox)
			tradeType = 'NATIVE'
			break;
		default:
			return {
				code: -1,
					msg: '参数错误'
			}
	}

	const {
		total_fee,
	} = orderList.data[0]

	let orderInfo

	// 请填写对应平台接收通知云函数对应的云函数url化地址，云函数url化请参考：https://uniapp.dcloud.io/uniCloud/http
	try {
		// 获取支付信息
		orderInfo = await uniPayInstance.getOrderInfo({
			openid, // App端支付时不需要openid，传入个undefined也没有影响
			outTradeNo,
			total_fee,
			subject: "味丰源商城",
			body: "味丰源商城食品购买",
			notifyUrl,
			tradeType,
			// attach: "%7B%22type%22%3A%22goods%22%7D"
		})
	} catch (e) {
		console.log(e.message)
		return {
			code: -3,
			msg: '获取支付信息失败，请稍后再试'
		}
	}
	return {
		outTradeNo,
		orderInfo
	}
};