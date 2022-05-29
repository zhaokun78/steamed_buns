'use strict';
const fs = require('fs')
const path = require('path')
const createConfig = require('uni-config-center')
const uniPay = require('uni-pay')
const db = uniCloud.database()
const dbCmd = db.command

exports.main = async (event, context) => {
	try {
		console.log('close order start')
		console.log('event', event)

		const uniPayConfig = createConfig({
			pluginId: 'uni-pay'
		})
		const {
			wxConfigMp,
			wxConfigMp_1626274711,
		} = uniPayConfig.requireFile('config.js')
		let {
			outTradeNo
		} = event

		//查询订单
		const orderList = await db.collection('uni-id-base-order').where({
			_id: outTradeNo,
			status: dbCmd.eq(2).or(dbCmd.eq(4)).or(dbCmd.eq(6)).or(dbCmd.eq(-2))
		}).get()
		console.log('uni-id-base-order', orderList)
		if (orderList.data.length !== 1) {
			return {
				code: -1,
				msg: '订单不正确'
			}
		}

		//分账比例
		let profit_sharing_rate = 0

		//查询分账配置
		let parameter = await db.collection('wfy-system-parameter').where({
			name: '分账比例'
		}).limit(1).get()
		console.log('分账比例', parameter)
		if (parameter.data.length == 1) {
			profit_sharing_rate = parseInt(parameter.data[0].value)
		}

		//订单总金额（分）
		let total_fee = orderList.data[0].total_fee

		//分账金额（分）
		let profitSharingAmount = 0

		//计算微信支付手续费（元）
		//四舍五入保留两位小数点，如果四舍五入下来是0.01就收取0.01，四舍五入是0就不收取
		let wxsxf = parseFloat((total_fee / 100 * 0.006).toFixed(2))
		console.log('微信支付手续费（元）', wxsxf)

		//商品总价 - 手续费 = 总结算价（分）
		let jsj = total_fee - wxsxf * 100
		console.log('总结算价（分）', jsj)

		//总结算价 X 商品分账比例 = 分账金额
		profitSharingAmount = parseInt((jsj * (profit_sharing_rate / 100)).toFixed(0))
		console.log('分账金额（分）', profitSharingAmount)

		//根据订单查询店铺
		let shop = await db.collection('wfy-shop').where({
			_id: orderList.data[0].store
		}).limit(1).get()
		console.log('wfy-shop', shop)

		//初始化unipay
		let res
		let uniPayInstance
		if (shop.data.length == 1 && shop.data[0].wx_pay_merchant_number) {
			if (shop.data[0].wx_pay_merchant_number == '1626274711') {
				uniPayInstance = uniPay.initWeixin({
					appId: wxConfigMp_1626274711.appId,
					mchId: wxConfigMp_1626274711.mchId,
					key: wxConfigMp_1626274711.key,
					pfx: fs.readFileSync(path.resolve(__dirname, './apiclient_cert_1626274711.p12')),
				})
			}

			//请求单次分账
			if (profitSharingAmount === 0) {
				res = await uniPayInstance.profitsharingfinish({
					transactionId: orderList.data[0].transaction_id,
					outOrderNo: orderList.data[0]._id,
					description: '不需要分账'
				})
			} else {
				res = await uniPayInstance.profitsharing({
					transactionId: orderList.data[0].transaction_id,
					outOrderNo: orderList.data[0]._id,
					receivers: JSON.stringify([{
						type: 'MERCHANT_ID',
						account: '1623879294',
						amount: profitSharingAmount,
						description: '店铺分账给公司'
					}])
				})
			}
		} else {
			uniPayInstance = uniPay.initWeixin({
				appId: wxConfigMp.appId,
				mchId: wxConfigMp.mchId,
				key: wxConfigMp.key,
				pfx: fs.readFileSync(path.resolve(__dirname, './apiclient_cert.p12')),
			})
			res = await uniPayInstance.profitsharingfinish({
				transactionId: orderList.data[0].transaction_id,
				outOrderNo: orderList.data[0]._id,
				description: '不需要分账'
			})
		}

		if (res.returnCode == 'SUCCESS' && res.resultCode == 'SUCCESS') {
			//关闭订单
			let updateRes = await db.collection('uni-id-base-order').where({
				_id: outTradeNo
			}).update({
				status: 5,
				close_time: new Date().getTime(),
				profit_sharing_result: res
			})
			console.log('uni-id-base-order update', updateRes)
			console.log('close order end')

			return {
				code: 0
			}
		} else {
			return {
				code: -1,
				msg: res
			}
		}
	} catch (e) {
		console.log('err', e)
		return {
			code: -1,
			msg: e
		}
	}
};
