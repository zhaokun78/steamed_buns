'use strict';
exports.main = async (event, context) => {
	console.log('wfy-generate-pickup-number start')
	//event为客户端上传的参数
	console.log('event : ', event)

	let now = new Date()

	const db = uniCloud.database()
	const dbCmd = db.command

	let res = await db.collection('wfy-pickup-number').where({
		shop_id: event.shop_id,
		year: now.getFullYear(),
		month: now.getMonth() + 1,
		day: now.getDate()
	}).limit(1).get()
	console.log('wfy-pickup-number query', res)

	if (res && res.data.length > 0) {
		res = await db.collection('wfy-pickup-number').where({
			shop_id: event.shop_id,
			year: now.getFullYear(),
			month: now.getMonth() + 1,
			day: now.getDate()
		}).update({
			pickup_number: dbCmd.inc(1)
		})
		console.log('wfy-pickup-number update', res)
	} else {
		res = await db.collection('wfy-pickup-number').add({
			shop_id: event.shop_id,
			year: now.getFullYear(),
			month: now.getMonth() + 1,
			day: now.getDate(),
			pickup_number: 1
		})
		console.log('wfy-pickup-number add', res)
	}

	//返回数据给客户端
	res = await db.collection('wfy-pickup-number').where({
		shop_id: event.shop_id,
		year: now.getFullYear(),
		month: now.getMonth() + 1,
		day: now.getDate()
	}).limit(1).get()
	console.log('wfy-pickup-number query', res)

	console.log('wfy-generate-pickup-number end')
	return res
};
