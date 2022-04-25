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

		//根据订单查询店铺
		let shop = await db.collection('wfy-shop').where({
			_id: orderList.data[0].store
		}).limit(1).get()
		// console.log('wfy-shop', shop)

		//根据店铺查询店主
		let owner = await db.collection('uni-id-users').where({
			_id: shop.data[0].owner_id
		}).limit(1).get()
		// console.log('uni-id-users', owner)

		//循环订单中每一个商品，进行分账计算 start
		let orderGoods = await db.collection('wfy-order-goods')
			.aggregate()
			.match({
				order_id: orderList.data[0]._id
			})
			.lookup({
				from: 'wfy-goods',
				localField: 'goods_id',
				foreignField: '_id',
				as: 'goods',
			})
			.end()
		console.log('orderGoods length', orderGoods.data.length)

		//分账金额（分）
		let profitSharingAmount = 0
		for (let i = 0; i < orderGoods.data.length; i++) {
			console.log(i, orderGoods.data[i])

			let profit_sharing_rate = orderGoods.data[i].goods[0].profit_sharing_rate
			//无效配置
			if (profit_sharing_rate == undefined || profit_sharing_rate < 0 || profit_sharing_rate > 100) {
				continue
			}

			//说明不需要分账给店铺			
			if (profit_sharing_rate == 0) {
				continue
			}

			//计算微信支付手续费（元）
			//四舍五入保留两位小数点，如果四舍五入下来是0.01就收取0.01，四舍五入是0就不收取
			let wxsxf = parseFloat((orderGoods.data[i].num * orderGoods.data[i].price / 100 * 0.006).toFixed(2))
			console.log(i, '微信支付手续费（元）', wxsxf)

			//当前商品总价 - 手续费 = 结算价
			let zjsj = orderGoods.data[i].num * orderGoods.data[i].price - wxsxf * 100
			console.log(i, '结算价（分）', zjsj)

			//总结算价 X 商品分账比例 = 店铺分账
			let dpfz = zjsj * orderGoods.data[i].goods[0].profit_sharing_rate / 100
			console.log(i, '店铺分账（分）', dpfz)

			profitSharingAmount += dpfz
		}
		profitSharingAmount = parseInt(profitSharingAmount.toFixed(0))
		console.log('总店铺分账（分）', profitSharingAmount)
		//循环订单中每一个商品，进行分账计算 end

		//初始化unipay
		let uniPayInstance = uniPay.initWeixin({
			appId: wxConfigMp.appId,
			mchId: wxConfigMp.mchId,
			key: wxConfigMp.key,
			pfx: fs.readFileSync(path.resolve(__dirname, './apiclient_cert.p12')), // 建议以p12文件绝对路径进行读取，使用微信退款时需要
		})

		//请求单次分账
		let res = await uniPayInstance.profitsharing({
			transactionId: orderList.data[0].transaction_id,
			outOrderNo: orderList.data[0]._id,
			receivers: JSON.stringify([{
				type: 'PERSONAL_OPENID',
				account: owner.data[0].wx_openid['mp-weixin'],
				amount: profitSharingAmount,
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
