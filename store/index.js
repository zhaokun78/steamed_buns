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
		cart: [],
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
		ADD_TO_CART(state, goods) {
			state.cart.push(goods)
			//uni.$emit('showCartRedDot', {})
		},
		MODIFY_GOODS_IN_CART(state, payload) {
			Vue.set(state.cart, payload.index, payload.goods)
		},
		DELETE_GOODS_IN_CART(state, index) {
			state.cart.splice(index, 1)
		},
		CLEAR_CART(state) {
			state.cart = []
		}
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
