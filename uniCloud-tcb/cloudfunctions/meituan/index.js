'use strict';
const APPKEY = 'test'
const SECRET = 'test'
const URL = 'https://peisongopen.meituan.com/api'
const sha1 = require('sha1')

/**
 * 美团签名算法，详见：https://peisong.meituan.com/open/doc#section1-3
 * @param {*} param 业务参数对象
 */
function calcSign(param) {
	console.log('calcSign', param)

	// 1）将所有系统参数及业务参数（其中sign，byte[]及值为空的参数除外）按照参数名的字典顺序排序
	param.appkey = APPKEY
	param.timestamp = '1477395862' //new Date().getTime()
	param.version = '1.0'

	let keys = Object.keys(param)
	// console.log('keys', keys)
	keys.sort()
	// console.log('keys sort', keys)

	// 2）将参数以参数1值1参数2值2...的顺序拼接，例如a=&c=3&b=1，变为b1c3，参数使用utf-8编码
	let signStr = ''
	for (let i = 0; i < keys.length; i++) {
		if (param[keys[i]] != undefined && param[keys[i]] != '') {
			signStr = signStr + keys[i] + param[keys[i]]
			// console.log(i, signStr)
		}
	}

	// 3）按照secret + 排序后的参数的顺序进行连接，得到加密前的字符串
	signStr = SECRET + signStr

	// 4）对加密前的字符串进行sha1加密并转为小写字符串，得到签名
	let sign = sha1(signStr)
	console.log('sha1', sign)

	// 5）将得到的签名赋给sign作为请求的参数
	return sign
}

exports.main = async (event, context) => {
	//event为客户端上传的参数
	console.log('event : ', event)

	let paramObject = {
		number: 123,
		string: '测试',
		double: 123.123,
		boolean: true,
		empty: ''
	}

	let s = calcSign(paramObject)

	//返回数据给客户端
	return event
};
