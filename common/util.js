const QQMapWX = require('./qqmap-wx-jssdk1.2/qqmap-wx-jssdk.min.js')
const qqmapsdk = new QQMapWX({
	key: '7XCBZ-32TKK-UPWJL-AED47-LQ2L6-BDBOF'
})

const util = {
	//距离格式化
	formatDistance(distance) {
		if (distance > 1000) {
			return (distance / 1000).toFixed(2) + ' 公里'
		} else {
			return distance + ' 米'
		}
	},
	//批量计算距离
	calculateDistance(targetArray) {
		return new Promise((resolve, reject) => {
			qqmapsdk.calculateDistance({
				mode: 'straight',
				to: targetArray,
				success: function(res) {
					console.log('calculateDistance', res)
					if (res.status == 0) {
						resolve(res.result.elements)
					} else {
						reject(res.message)
					}
				},
				fail: function(err) {
					console.log('calculateDistance', err)
					reject(err)
				}
			})
		})
	},
	//根据坐标逆向位置信息
	reverseGeocoder(location) {
		return new Promise((resolve, reject) => {
			qqmapsdk.reverseGeocoder({
				location: location || '',
				success: function(res) {
					console.log('reverseGeocoder', res)
					if (res.status == 0) {
						resolve(res.result)
					} else {
						reject(res.message)
					}
				},
				fail: function(err) {
					console.log('reverseGeocoder', err)
					reject(err)
				}
			})
		})
	},
	//处理店铺营业状态
	processShopBusinessState(shops) {
		const now = new Date()
		for (let i = 0; i < shops.length; i++) {
			if (shops[i].business_state == 0) {
				if (now.getHours() >= shops[i].business_hour_start && now.getHours() <= shops[i].business_hour_end) {
					shops[i].state = '营业'
				} else {
					shops[i].state = '打烊'
				}
			} else if (shops[i].business_state == 1) {
				shops[i].state = '营业'
			} else if (shops[i].business_state == 2) {
				shops[i].state = '打烊'
			}
		}
	}
}

export default util
