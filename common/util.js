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
	//批量计算距离并且按距离从近到远排序
	calculateDistance(targetArray) {
		return new Promise((resolve, reject) => {
			qqmapsdk.calculateDistance({
				mode: 'straight',
				to: targetArray,
				success: function(res) {
					console.log('calculateDistance', res)
					if (res.status == 0) {
						const sortedArray = res.result.elements.sort(function(a, b) {
							return a.distance - b.distance
						})
						resolve(sortedArray)
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
	}
}

export default util
