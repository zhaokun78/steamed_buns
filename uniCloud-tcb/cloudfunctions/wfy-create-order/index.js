'use strict';

const db = uniCloud.database()
exports.main = async (event, context) => {
	console.log('wfy-create-order event:', event)

	//创建订单记录
	try {
		const result = await db.runTransaction(async transaction => {
			try {
				let orderResult = await db.collection('uni-id-base-order').add({
					status: 1,
					total_fee: event.cart.reduce((acc, cur) => acc + (cur.number * cur.price) * 100, 0),
					is_refund: false,
				})
				console.log('add uni-id-base-order', orderResult)

				if (orderResult.result.code == 0) {
					//创建 订单---商品 关联记录
					for (let i = 0; i < event.cart.length; i++) {
						let r = await db.collection('wfy-order-goods').add({
							// order_id: orderResult.result.id,
							// goods_id: event.cart[i]._id,
							goods_name: event.cart[i].name,
							price: event.cart[i].price * 100,
							num: event.cart[i].number,
						})
						console.log('add wfy-order-goods', r)

						if (r.result.code != 0) {
							// throw '创建 订单---商品 出错：' + r.result.message
							await transaction.rollback(-2)
						}
					}
				} else {
					// throw '创建订单出错：' + orderResult.result.message
					await transaction.rollback(-1)
				}
			} catch (err) {
				console.log('wfy-create-order err', err)
				await transaction.rollback(-3)
			}

			return {
				orderId: orderResult.result.id
			}
		})

		return {
			success: true,
			message: result.orderId
		}
	} catch (e) {
		console.log('wfy-create-order error', e)
		return {
			success: false,
			message: e
		}
	}
};
