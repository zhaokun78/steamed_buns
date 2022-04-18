'use strict';
exports.main = async (event, context) => {
	console.log('开始执行定时器', event)

	const db = uniCloud.database()
	const dbCmd = db.command

	//取前一天
	let yesterday = new Date()
	yesterday.setDate(yesterday.getDate() - 1)

	//查找前一天状态为已付款、待取餐、退款审核中或退款拒绝的自提订单
	let orders = await db.collection('uni-id-base-order').where({
		type: 0,
		status: dbCmd.eq(2).or(dbCmd.eq(4)).or(dbCmd.eq(6)).or(dbCmd.eq(-2))
	}).get()
	console.log('uni-id-base-order', orders)

	for (let i = 0; i < orders.data.length; i++) {
		//只处理前一天的订单
		let orderDate = new Date(orders.data[i].create_time)
		if (yesterday.getFullYear() == orderDate.getFullYear() &&
			yesterday.getMonth() == orderDate.getMonth() &&
			yesterday.getDate() == orderDate.getDate()) {
			//分账

			//关闭订单		
			let updateNumber = await db.collection('uni-id-base-order').where({
				_id: orders.data[i]._id
			}).update({
				status: 5,
				close_time: new Date().getTime()
			})
			console.log(orders.data[i]._id, updateNumber)
		}
	}

	console.log('结束执行定时器')
}
