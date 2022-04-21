'use strict';
const createConfig = require('uni-config-center')
const db = uniCloud.database()
const uniPay = require('uni-pay')
const uniID = require('uni-id')

exports.main = async (event, context) => {
	const uniPayConfig = createConfig({
		pluginId: 'uni-pay'
	})
	const {
		wxConfigMp,
	} = uniPayConfig.requireFile('config.js')
	let {
		uniIdToken
	} = event

	const payload = await uniID.checkToken(uniIdToken)
	if (payload.code > 0) {
		return {
			code: 1001,
			msg: '用户身份验证失败，请重新登录'
		}
	}
	const uid = payload.uid
	const userList = await db.collection('uni-id-users').where({
		_id: uid
	}).get()
	const userInfo = userList.data[0]

	let uniPayInstance, openid
	uniPayInstance = uniPay.initWeixin(wxConfigMp)
	openid = userInfo.wx_openid['mp-weixin']

	let res = await uniPayInstance.profitSharingAddReceiver({
		type: 'PERSONAL_OPENID',
		account: openid,
		relation_type: 'STORE_OWNER'
	})
	console.log('profitSharingAddReceiver', res)
	return res
};
