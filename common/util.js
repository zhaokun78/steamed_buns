const QQMapWX = require('./qqmap-wx-jssdk1.2/qqmap-wx-jssdk.min.js')
const qqmapsdk = new QQMapWX({
	key: '7XCBZ-32TKK-UPWJL-AED47-LQ2L6-BDBOF'
})

const util = {
	//时间戳转日期
	formatDate(time) {
		let date = new Date(time);
		let y = date.getFullYear();
		let MM = date.getMonth() + 1;
		MM = MM < 10 ? ('0' + MM) : MM;
		let d = date.getDate();
		d = d < 10 ? ('0' + d) : d;
		let h = date.getHours();
		h = h < 10 ? ('0' + h) : h;
		let m = date.getMinutes();
		m = m < 10 ? ('0' + m) : m;
		let s = date.getSeconds();
		s = s < 10 ? ('0' + s) : s;
		return y + '-' + MM + '-' + d + ' ' + h + ':' + m + ':' + s;
	},
	//时间戳格式化为日期时间
	formatDateTime(date, fmt = 'yyyy-MM-dd hh:mm:ss') {
		if (!date) {
			return ''
		}
		if (typeof(date) === 'number') {
			date = new Date(date * 1000)
		}
		var o = {
			"M+": date.getMonth() + 1, //月份
			"d+": date.getDate(), //日
			"h+": date.getHours(), //小时
			"m+": date.getMinutes(), //分
			"s+": date.getSeconds(), //秒
			"q+": Math.floor((date.getMonth() + 3) / 3), //季度
			"S": date.getMilliseconds() //毫秒
		}
		if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length))
		for (var k in o)
			if (new RegExp("(" + k + ")").test(fmt))
				fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)))
		return fmt
	},
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
