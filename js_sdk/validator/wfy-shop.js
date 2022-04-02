// 表单校验规则由 schema2code 生成，不建议直接修改校验规则，而建议通过 schema2code 生成, 详情: https://uniapp.dcloud.net.cn/uniCloud/schema


const validator = {
  "type": {
    "rules": [
      {
        "required": true
      },
      {
        "format": "int"
      },
      {
        "range": [
          {
            "text": "直营店",
            "value": 0
          },
          {
            "text": "加盟店",
            "value": 1
          }
        ]
      }
    ],
    "label": "店铺类型"
  },
  "name": {
    "rules": [
      {
        "required": true
      },
      {
        "format": "string"
      }
    ],
    "label": "店铺名称"
  },
  "city_code": {
    "rules": [
      {
        "required": true
      },
      {
        "format": "string"
      }
    ],
    "label": "所在城市"
  },
  "address": {
    "rules": [
      {
        "required": true
      },
      {
        "format": "string"
      }
    ],
    "label": "详细地址"
  },
  "longitude": {
    "rules": [
      {
        "required": true
      },
      {
        "format": "string"
      }
    ],
    "label": "经度"
  },
  "latitude": {
    "rules": [
      {
        "required": true
      },
      {
        "format": "string"
      }
    ],
    "label": "纬度"
  },
  "phone": {
    "rules": [
      {
        "required": true
      },
      {
        "format": "string"
      }
    ],
    "label": "电话"
  },
  "business_hour_start": {
    "rules": [
      {
        "required": true
      },
      {
        "format": "int"
      },
      {
        "minimum": 0,
        "maximum": 23
      }
    ],
    "label": "每天几点开始营业",
    "defaultValue": 6
  },
  "business_hour_end": {
    "rules": [
      {
        "required": true
      },
      {
        "format": "int"
      },
      {
        "minimum": 0,
        "maximum": 23
      }
    ],
    "label": "每天几点结束营业",
    "defaultValue": 18
  },
  "business_state": {
    "rules": [
      {
        "required": true
      },
      {
        "format": "int"
      },
      {
        "range": [
          {
            "text": "自动",
            "value": 0
          },
          {
            "text": "营业",
            "value": 1
          },
          {
            "text": "打烊",
            "value": 2
          }
        ]
      }
    ],
    "label": "营业状态",
    "defaultValue": 0
  },
  "delivery_amount": {
    "rules": [
      {
        "format": "int"
      },
      {
        "minimum": 0
      }
    ],
    "label": "外卖起送金额（分）",
    "defaultValue": 0
  }
}

const enumConverter = {
  "type_valuetotext": {
    "0": "直营店",
    "1": "加盟店"
  },
  "business_state_valuetotext": {
    "0": "自动",
    "1": "营业",
    "2": "打烊"
  }
}

function filterToWhere(filter, command) {
  let where = {}
  for (let field in filter) {
    let { type, value } = filter[field]
    switch (type) {
      case "search":
        if (typeof value === 'string' && value.length) {
          where[field] = new RegExp(value)
        }
        break;
      case "select":
        if (value.length) {
          let selectValue = []
          for (let s of value) {
            selectValue.push(command.eq(s))
          }
          where[field] = command.or(selectValue)
        }
        break;
      case "range":
        if (value.length) {
          let gt = value[0]
          let lt = value[1]
          where[field] = command.and([command.gte(gt), command.lte(lt)])
        }
        break;
      case "date":
        if (value.length) {
          let [s, e] = value
          let startDate = new Date(s)
          let endDate = new Date(e)
          where[field] = command.and([command.gte(startDate), command.lte(endDate)])
        }
        break;
      case "timestamp":
        if (value.length) {
          let [startDate, endDate] = value
          where[field] = command.and([command.gte(startDate), command.lte(endDate)])
        }
        break;
    }
  }
  return where
}

export { validator, enumConverter, filterToWhere }
