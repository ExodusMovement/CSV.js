function isObject(object) {
  const type = typeof object
  return type === 'function' || (type === 'object' && !!object)
}
const isArray =
  Array.isArray ||
  function(object) {
    return toString.call(object) === '[object Array]'
  }
function isString(object) {
  return typeof object === 'string'
}

function isNull(value) {
  return value == null
}

function isPresent(value) {
  return value != null
}

function fallback(value, fallback) {
  return isPresent(value) ? value : fallback
}

function forEach(collection, iterator) {
  for (let _i = 0, _len = collection.length; _i < _len; _i += 1) {
    if (iterator(collection[_i], _i) === false) break
  }
}

const CSV = (function() {
  function CSV(data, options) {
    if (!options) options = {}

    if (!isArray(data)) {
      throw new Error('Incompatible format!')
    }

    this.data = data

    this.options = {
      header: fallback(options.header, false),
      cast: fallback(options.cast, true),
    }

    const lineDelimiter = options.lineDelimiter || options.line

    const cellDelimiter = options.cellDelimiter || options.delimiter

    this.options.lineDelimiter = lineDelimiter || '\r\n'
    this.options.cellDelimiter = cellDelimiter || ','
  }

  function serializeType(object) {
    if (isArray(object)) {
      return 'array'
    } else if (isObject(object)) {
      return 'object'
    } else if (isString(object)) {
      return 'string'
    } else if (isNull(object)) {
      return 'null'
    } else {
      return 'primitive'
    }
  }

  CSV.prototype.serialize = {
    object: function(object) {
      const that = this

      const attributes = Object.keys(object)

      const serialized = Array(attributes.length)
      forEach(attributes, function(attr, index) {
        serialized[index] = that[serializeType(object[attr])](object[attr])
      })
      return serialized
    },
    array: function(array) {
      const that = this

      const serialized = Array(array.length)
      forEach(array, function(value, index) {
        serialized[index] = that[serializeType(value)](value)
      })
      return serialized
    },
    string: function(string) {
      return string == null ? '' : '"' + String(string).replace(/"/g, '""') + '"'
    },
    null: function(value) {
      return ''
    },
    primitive: function(value) {
      return value
    },
  }

  CSV.prototype.encode = function(callback) {
    if (this.data.length === 0) return ''

    let data = this.data
    let options = this.options
    let header = options.header
    let sample = data[0]
    let serialize = this.serialize
    let offset = 0
    let attributes
    let response
    let map

    if (!callback) {
      response = Array(data.length)
      callback = function(record, index) {
        response[index + offset] = record
      }
    }

    function serializeLine(record) {
      return record.join(options.cellDelimiter)
    }

    if (header) {
      if (!isArray(header)) {
        attributes = Object.keys(sample)
        header = attributes
      }
      callback(serializeLine(serialize.array(header)), 0)
      offset = 1
    }

    const recordType = serializeType(sample)

    if (recordType === 'array') {
      if (isArray(options.cast)) {
        map = Array(options.cast.length)
        forEach(options.cast, function(type, index) {
          if (isString(type)) {
            map[index] = type.toLowerCase()
          } else {
            map[index] = type
            serialize[type] = type
          }
        })
      } else {
        map = Array(sample.length)
        forEach(sample, function(value, index) {
          map[index] = serializeType(value)
        })
      }
      forEach(data, function(record, recordIndex) {
        const serializedRecord = Array(map.length)
        forEach(record, function(value, valueIndex) {
          serializedRecord[valueIndex] = serialize[map[valueIndex]](value)
        })
        callback(serializeLine(serializedRecord), recordIndex)
      })
    } else if (recordType === 'object') {
      attributes = Object.keys(sample)
      if (isArray(options.cast)) {
        map = Array(options.cast.length)
        forEach(options.cast, function(type, index) {
          if (isString(type)) {
            map[index] = type.toLowerCase()
          } else {
            map[index] = type
            serialize[type] = type
          }
        })
      } else {
        map = Array(attributes.length)
        forEach(attributes, function(attr, index) {
          map[index] = serializeType(sample[attr])
        })
      }
      forEach(data, function(record, recordIndex) {
        const serializedRecord = Array(attributes.length)
        forEach(attributes, function(attr, attrIndex) {
          serializedRecord[attrIndex] = serialize[map[attrIndex]](record[attr])
        })
        callback(serializeLine(serializedRecord), recordIndex)
      })
    }

    if (response) {
      return response.join(options.lineDelimiter)
    } else {
      return this
    }
  }

  return CSV
})()

CSV.encode = function(data, options) {
  return new CSV(data, options).encode()
}

module.exports = CSV
