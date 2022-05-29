const path = require('path')
module.exports = {
	// 微信小程序端对应的微信支付及登录配置配置
	wxConfigMp: {
		appId: 'wxe253c868826cc9f9',
		secret: 'ef19401ab4be0cae1f2c0cefd16a0923',
		mchId: '1623879294',
		key: 'JFmllN9V6yvEFRduy6f4XcvjDdsFP4Wr',
	},
	wxConfigMp_1626274711: {
		appId: 'wxe253c868826cc9f9',
		secret: 'ef19401ab4be0cae1f2c0cefd16a0923',
		mchId: '1626274711',
		key: 'HPnxcYXUYRzbydaRPIDaYxmGtmH4MCVi',
	},
	// App端对应的微信支付配置
	wxConfigApp: {
		appId: '',
		mchId: '',
		key: '',
	},
	// 微信PC网站支付
	wxConfigH5: {
		appId: '',
		mchId: '',
		key: '',
	},
	// 支付宝小程序端对应的支付宝支付及登录配置
	aliConfigMp: {
		mchId: '',
		appId: '',
		alipayPublicKey: '',
		privateKey: '',
	},
	// App端对应的支付宝支付配置
	aliConfigApp: {
		mchId: '',
		appId: '',
		alipayPublicKey: '',
		privateKey: '',
	},
	aliConfigH5: {
		mchId: '',
		appId: '',
		alipayPublicKey: '',
		privateKey: '',
	}
}
