const QQMapWX = require('./qqmap-wx-jssdk1.2/qqmap-wx-jssdk.min.js')
const qqmapsdk = new QQMapWX({
	key: '7XCBZ-32TKK-UPWJL-AED47-LQ2L6-BDBOF'
})

const util = {
	/**
	 * 处理富文本里的图片宽度自适应
	 * 1.查找img标签有无style属性，如果没有，加上style
	 * 2.所有标签style后追加 max-width:100% !important;
	 * 4.去掉<br/>标签
	 * @param html
	 * @returns {void|string|*}
	 */
	formatRichTextImgWidth(html) {
		let newContent = html.replace(/<img[^>]*>/gi, function(match, capture) {
			//console.log(match.search(/style=/gi));

			if (match.search(/style=/gi) == -1) {
				match = match.replace(/\<img/gi, '<img style=""');
			}
			return match;
		});

		newContent = newContent.replace(/style="/gi, '$& width:100% !important; height:100% !important; ');
		//newContent = newContent.replace(/<br[^>]*\/>/gi, '');
		return newContent;
	},
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
	formatOrderState(order) {
		switch (order.status) {
			case 1:
				return '待付款'
				break
			case 2:
				return '已付款'
				break
			case 3:
				return '备餐中'
				break
			case 4:
				return order.type == 0 ? '待取餐' : '配送中'
				break
			case 5:
				return '已完成'
				break
			case 6:
				return '退款审核中'
				break
			case 7:
				return '退款中'
				break
			case 8:
				return '已退款'
				break
			case -1:
				return '取消退款'
				break
			case -2:
				return '退款拒绝'
				break
			case -3:
				return '退款失败'
				break
			default:
				return '未知'
				break
		}
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
	},
	//随机取26个字母中的一个
	randomLetter() {
		//创建26个字母数组
		const arr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y',
			'Z'
		];
		let idvalue = ''
		let n = 1; //这个值可以改变的，对应的生成多少个字母，根据自己需求所改
		for (let i = 0; i < n; i++) {
			idvalue += arr[Math.floor(Math.random() * 26)]
		}
		return idvalue
	},
	//手机号检查
	phoneNumberCheck(phone) {
		const reg_tel = /^1[3-9]\d{9}$/
		return reg_tel.test(phone)
	}
}

export default util
