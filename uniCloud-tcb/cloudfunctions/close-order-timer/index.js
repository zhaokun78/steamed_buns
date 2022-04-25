'use strict';
exports.main = async (event, context) => {
	console.log('开始执行定时器', event)

	const db = uniCloud.database()
	const dbCmd = db.command

	//取前一天
	let yesterday = new Date()
	yesterday.setDate(yesterday.getDate() - 1)
	console.log('yesterday', yesterday)

	//查找前一天状态为已付款、待取餐、退款审核中或退款拒绝的自提订单
	let orders = await db.collection('uni-id-base-order').where({
		type: 0,
		status: dbCmd.eq(2).or(dbCmd.eq(4)).or(dbCmd.eq(6)).or(dbCmd.eq(-2))
	}).get()
	console.log('uni-id-base-order length', orders.data.length)

	for (let i = 0; i < orders.data.length; i++) {
		console.log('start ' + i, orders.data[i])

		//只处理前一天的订单
		let orderDate = new Date(orders.data[i].create_time)
		console.log('orderDate', orderDate)
		if (yesterday.getFullYear() == orderDate.getFullYear() &&
			yesterday.getMonth() == orderDate.getMonth() &&
			yesterday.getDate() == orderDate.getDate()) {
			let res = await uniCloud.callFunction({
				name: 'close-order',
				data: {
					outTradeNo: orders.data[i]._id
				}
			})
			console.log('end ' + i, res)
		}
	}

	console.log('结束执行定时器')
}
