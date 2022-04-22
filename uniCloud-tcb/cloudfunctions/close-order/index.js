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

		//初始化unipay
		let uniPayInstance = uniPay.initWeixin({
			appId: wxConfigMp.appId,
			mchId: wxConfigMp.mchId,
			key: wxConfigMp.key,
			pfx: fs.readFileSync(path.resolve(__dirname, './apiclient_cert.p12')), // 建议以p12文件绝对路径进行读取，使用微信退款时需要
		})

		//根据订单查询店铺
		let shop = await db.collection('wfy-shop').where({
			_id: orderList.data[0].store
		}).limit(1).get()

		//根据店铺查询店主
		let owner = await db.collection('uni-id-users').where({
			_id: shop.data[0].owner_id
		}).limit(1).get()

		//请求单次分账
		let res = await uniPayInstance.profitsharing({
			transactionId: orderList.data[0].transaction_id,
			outOrderNo: orderList.data[0]._id,
			receivers: JSON.stringify([{
				type: 'PERSONAL_OPENID',
				account: owner.data[0].wx_openid['mp-weixin'],
				amount: 1,
				description: '店主分账'
			}])
		})
		console.log('profitsharing res', res)
		if (res.returnCode == 'SUCCESS' && res.resultCode == 'SUCCESS') {
			//关闭订单
			let updateRes = await db.collection('uni-id-base-order').where({
				_id: outTradeNo
			}).update({
				status: 5,
				close_time: new Date().getTime()
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
