'use strict';
exports.main = async (event, context) => {
	console.log('开始执行定时器', event)

	const db = uniCloud.database()
	const dbCmd = db.command

	//查找前一天状态为已付款或待取餐的自提订单

	let orders = await db.collection('uni-id-base-order').where({
		type: 0,
		status: dbCmd.eq(2).or(dbCmd.eq(4))
	}).get()
	console.log('uni-id-base-order', orders)

	for (let i = 0; i < orders.data.length; i++) {
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

	console.log('结束执行定时器')
};
