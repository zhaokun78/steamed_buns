'use strict';
const createConfig = require('uni-config-center')
const uniPay = require('uni-pay')
const crypto = require('crypto')
const FormData = require('form-data')
const db = uniCloud.database()
const USER = "zhao_kun78@hotmail.com" //必填，飞鹅云 www.feieyun.cn后台注册的账号名
const UKEY = "YsyMyzmUst2XAqTj" //必填，飞鹅云后台注册账号后生成的UKEY
const HOST = "https://api.feieyun.cn/Api/Open/";

function getOffsetDate(date, offset) {
	return new Date(date + (new Date().getTimezoneOffset() + (offset || 0) * 60) * 60000)
}

function formatDate(time) {
	let date = getOffsetDate(time, 8)
	let y = date.getFullYear();
	let MM = date.getMonth() + 1;
	MM = MM < 10 ? ('0' + MM) : MM;
	let d = date.getDate();
	d = d < 10 ? ('0' + d) : d;
	let h = date.getHours();
	h = h < 10 ? ('0' + h) : h;
	let m = date.getMinutes();
	m = m < 10 ? ('0' + m) : m;
	let s = date.getSeconds();
	s = s < 10 ? ('0' + s) : s;
	return y + '-' + MM + '-' + d + ' ' + h + ':' + m + ':' + s;
}

async function print(shop, order, order_goods) {
	console.log('print')
	//标签说明：
	//单标签:
	//"<BR>"为换行,"<CUT>"为切刀指令(主动切纸,仅限切刀打印机使用才有效果)
	//"<LOGO>"为打印LOGO指令(前提是预先在机器内置LOGO图片),"<PLUGIN>"为钱箱或者外置音响指令
	//成对标签：
	//"<CB></CB>"为居中放大一倍,"<B></B>"为放大一倍,"<C></C>"为居中,<L></L>字体变高一倍
	//<W></W>字体变宽一倍,"<QR></QR>"为二维码,"<BOLD></BOLD>"为字体加粗,"<RIGHT></RIGHT>"为右对齐
	//拼凑订单内容时可参考如下格式
	//根据打印纸张的宽度，自行调整内容的格式，可参考下面的样例格式

	let title
	if (order.type == 0) {
		title = '自提订单：' + order.pick_up_number
	} else {
		title = '外卖订单'
	}

	let orderInfo = "<CB>" + title + "</CB><BR>";
	orderInfo += "--------------------------------<BR>";
	orderInfo += "数量   商品名称<BR>";
	for (let i = 0; i < order_goods.length; i++) {
		orderInfo += order_goods[i].num
		let n = 7 - order_goods[i].num.toString().length
		for (let j = 0; j < n; j++) {
			orderInfo += " "
		}
		orderInfo += order_goods[i].goods_name + "<BR>"
	}
	orderInfo += "--------------------------------<BR>";
	orderInfo += "合计：" + (order.total_fee / 100) + "元<BR>";
	if (order.type == 0) {
		orderInfo += "自提店铺：" + shop.name + "<BR>";
	} else {
		orderInfo += "收货地址：<BR>";
	}
	if (order.user_mobile) {
		orderInfo += "联系电话：" + order.user_mobile + "<BR>";
	}
	orderInfo += "订餐时间：" + formatDate(order.create_time) + "<BR><BR>";
	orderInfo += "--------------------------------<BR>";
	orderInfo += "<C>味丰源商城</C>"
	orderInfo += "--------------------------------<BR>";

	let STIME = Math.floor(new Date().getTime() / 1000); //请求时间,当前时间的秒数
	const form = new FormData()
	form.append('user', USER)
	form.append('stime', STIME)
	form.append('sig', signature(STIME))
	form.append('apiname', 'Open_printMsg')
	form.append('sn', shop.printer_sn)
	form.append('content', orderInfo)
	form.append('times', '1')

	const res = await uniCloud.httpclient.request(HOST, {
		method: 'POST',
		headers: form.getHeaders(),
		content: form.getBuffer(),
		dataType: 'json'
	})
	return res
}

function signature(STIME) {
	return crypto.createHash('sha1').update(USER + UKEY + STIME).digest('hex'); //获取签名
}

exports.main = async (event, context) => {
	console.log('event', event)
	const uniPayConfig = createConfig({
		pluginId: 'uni-pay'
	})
	const {
		wxConfigMp,
		wxConfigMp_1626274711,
	} = uniPayConfig.requireFile('config.js')
	let uniPayInstance
	let provider
	let params = event.path.substring(1).split('/')
	console.log(params)
	switch (params[0]) {
		case 'wxpay_mp-weixin':
			provider = 'weixin'
			if (params.length == 2) {
				if (params[1] == '1626274711') {
					uniPayInstance = uniPay.initWeixin(wxConfigMp_1626274711)
				}
			} else {
				uniPayInstance = uniPay.initWeixin(wxConfigMp)
			}
			break;
		case 'wxpay_app-plus':
			provider = 'weixin'
			uniPayInstance = uniPay.initWeixin(wxConfigApp)
			break;
		case 'wxpay_h5':
			provider = 'weixin'
			uniPayInstance = uniPay.initWeixin(wxConfigH5)
			break;
		case 'alipay_mp-alipay':
			provider = 'alipay'
			uniPayInstance = uniPay.initAlipay(aliConfigMp)
			break;
		case 'alipay_app-plus':
			provider = 'alipay'
			uniPayInstance = uniPay.initAlipay(aliConfigApp)
			break;
		case 'alipay_h5':
			provider = 'alipay'
			uniPayInstance = uniPay.initAlipay(aliConfigH5)
			// uniPayInstance = uniPay.initAlipay(aliConfigSandbox)
			break;
		default:
			console.log('---------参数错误-------')
			return {
				code: -1,
					msg: '参数错误'
			}
	}
	if (uniPayInstance.checkNotifyType(event) === 'refund') {
		// 支付宝支付时，如果执行退款操作且非全量退款，会再次调用支付时设置的notify_url，这里需要根据自己的业务做下处理
		// 补充自己的退款逻辑
		return
	}
	let verifyResult = await uniPayInstance.verifyPaymentNotify(event)
	console.log('verifyResult', verifyResult)
	if (!verifyResult) {
		console.log('---------!verifyResult-------')
		return {}
	}
	let {
		outTradeNo,
		totalFee,
		transactionId,
		resultCode
	} = verifyResult

	const orderList = await db.collection('uni-id-base-order').where({
		_id: outTradeNo
	}).get()

	if (orderList.data.length < 0) {
		console.log('---------orderList.data.length < 0-------')
		return {}
	}

	const orderDetail = orderList.data[0]
	console.log('uni-id-base-order', orderDetail)

	if (totalFee === orderDetail.total_fee && (resultCode === 'SUCCESS' || resultCode === 'FINISHED')) {
		console.log('---------updatedb-------')
		let updatedNumber = await db.collection('uni-id-base-order').where({
			_id: outTradeNo
		}).update({
			status: 2,
			paid_time: new Date().getTime(),
			transaction_id: transactionId
		})
		console.log('updatedNumber', updatedNumber)

		//打印小票
		if (updatedNumber.updated == 1) {
			//查找店铺
			let shop = await db.collection('wfy-shop').where({
				_id: orderDetail.store
			}).get()
			console.log('wfy-shop', shop)

			//如果店铺绑定了打印机
			if (shop.data.length > 0 && shop.data[0].printer_sn) {
				//查找订单---商品
				let orderGoods = await db.collection('wfy-order-goods').where({
					order_id: orderDetail._id
				}).get()
				console.log('wfy-order-goods', orderGoods)

				//打印
				let printRes = await print(shop.data[0], orderDetail, orderGoods.data)
				console.log('printRes', printRes)
			}
		}

		// 注意如果处理成功需要严格按照下面的格式进行返回，否则厂商会持续通知
		if (provider === 'weixin') {
			// 微信处理成功之后 
			return {
				mpserverlessComposedResponse: true,
				statusCode: 200,
				headers: {
					'content-type': 'text/xml;charset=utf-8'
				},
				body: `<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>`
			}
		}
	}
}
