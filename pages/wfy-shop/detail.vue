<template>
  <view class="container">
    <unicloud-db ref="udb" v-slot:default="{data, loading, error, options}" :options="options" collection="wfy-shop,opendb-city-china" field="create_time,type,name,owner_id,city_code{name as text},address,longitude,latitude,phone,business_hour_start,business_hour_end,business_state" :where="queryWhere" :getone="true" :manual="true">
      <view v-if="error">{{error.message}}</view>
      <view v-else-if="loading">
        <uni-load-more :contentText="loadMore" status="loading"></uni-load-more>
      </view>
      <view v-else-if="data">
        <view>
          <text>创建时间</text>
          <uni-dateformat :threshold="[0, 0]" :date="data.create_time"></uni-dateformat>
        </view>
        <view>
          <text>店铺类型</text>
          <text>{{options.type_valuetotext[data.type]}}</text>
        </view>
        <view>
          <text>店铺名称</text>
          <text>{{data.name}}</text>
        </view>
        <view>
          <text>店主id</text>
          <text>{{data.owner_id}}</text>
        </view>
        <view>
          <text>所在城市</text>
          <text>{{data.city_code && data.city_code[0] && data.city_code[0].name}}</text>
        </view>
        <view>
          <text>详细地址</text>
          <text>{{data.address}}</text>
        </view>
        <view>
          <text>经度</text>
          <text>{{data.longitude}}</text>
        </view>
        <view>
          <text>纬度</text>
          <text>{{data.latitude}}</text>
        </view>
        <view>
          <text>电话</text>
          <text>{{data.phone}}</text>
        </view>
        <view>
          <text>每天几点开始营业</text>
          <text>{{data.business_hour_start}}</text>
        </view>
        <view>
          <text>每天几点结束营业</text>
          <text>{{data.business_hour_end}}</text>
        </view>
        <view>
          <text>营业状态</text>
          <text>{{options.business_state_valuetotext[data.business_state]}}</text>
        </view>
      </view>
    </unicloud-db>
    <view class="btns">
      <button type="primary" @click="handleUpdate">修改</button>
      <button type="warn" class="btn-delete" @click="handleDelete">删除</button>
    </view>
  </view>
</template>

<script>
  // 由schema2code生成，包含校验规则和enum静态数据
  import { enumConverter } from '../../js_sdk/validator/wfy-shop.js';

  export default {
    data() {
      return {
        queryWhere: '',
        loadMore: {
          contentdown: '',
          contentrefresh: '',
          contentnomore: ''
        },
        options: {
          // 将scheme enum 属性静态数据中的value转成text
          ...enumConverter
        }
      }
    },
    onLoad(e) {
      this._id = e.id
    },
    onReady() {
      if (this._id) {
        this.queryWhere = '_id=="' + this._id + '"'
      }
    },
    methods: {
      handleUpdate() {
        // 打开修改页面
        uni.navigateTo({
          url: './edit?id=' + this._id,
          events: {
            // 监听修改页面成功修改数据后, 刷新当前页面数据
            refreshData: () => {
              this.$refs.udb.loadData({
                clear: true
              })
            }
          }
        })
      },
      handleDelete() {
        this.$refs.udb.remove(this._id, {
          success: (res) => {
            // 删除数据成功后跳转到list页面
            uni.navigateTo({
              url: './list'
            })
          }
        })
      }
    }
  }
</script>

<style>
  .container {
    padding: 10px;
  }

  .btns {
    margin-top: 10px;
    /* #ifndef APP-NVUE */
    display: flex;
    /* #endif */
    flex-direction: row;
  }

  .btns button {
    flex: 1;
  }

  .btn-delete {
    margin-left: 10px;
  }
</style>
