import user from '@/store/modules/user.js'

// #ifndef VUE3
import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)
const store = new Vuex.Store({
	state: {
		orderType: 'takein',
		address: {},
		store: {},
	},
	mutations: {
		SET_ORDER_TYPE(state, type) {
			state.orderType = type
		},
		SET_ADDRESS(state, address) {
			state.address = address
		},
		SET_STORE(state, store) {
			state.store = store
		},
	},
	modules: {
		user
	},
	strict: true
})
// #endif

// #ifdef VUE3
import {
	createStore
} from 'vuex'
const store = createStore({
	modules: {
		user
	}
})
// #endif

export default store
