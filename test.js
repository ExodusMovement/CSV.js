const CSV = require('./csv')
const assert = require('assert')
const fs = require('fs')

const sets = ['marriage_census', 'worldbank']

const data = {
  marriage_census: {},
  worldbank: {},
}

sets.forEach(function(set) {
  data[set].csv = fs.readFileSync('./datasets/csv/' + set + '.csv', 'utf8')
  data[set].json = JSON.parse(fs.readFileSync('./datasets/json/' + set + '.json', 'utf8'))
})

describe('CSV', function() {
  describe('#encode()', function() {
    it('should return an empty string if no data', function() {
      const expected = ''

      const actual = []
      assert.deepStrictEqual(expected, new CSV(actual).encode())
    })
    it('should encode edge cases', function() {
      const expected = ['1,2,"3,4"', '1,2,"""3,4"""', '1,2,"3\n4"', '1,2,"3\n4"', '1,2,"3\n4"']

      const actual = [
        [[1, 2, '3,4']],
        [[1, 2, '"3,4"']],
        [[1, 2, '3\n4']],
        [[1, 2, '3\n4']],
        [[1, 2, '3\n4']],
      ]

      expected.map(function(result, index) {
        assert.deepStrictEqual(result, new CSV(actual[index], { line: '\n' }).encode())
      })
    })
    it('should encode with no headers', function() {
      const expected = '1,2,3,4\r\n5,6,7,8'

      const actual = [[1, 2, 3, 4], [5, 6, 7, 8]]
      assert.deepStrictEqual(expected, new CSV(actual).encode())
    })
    it('should encode with headers', function() {
      const expected = '"name","age"\r\n"Will",32'

      const actual = [{ name: 'Will', age: 32 }]
      assert.deepStrictEqual(expected, new CSV(actual, { header: true }).encode())
    })
    it('should encode files', function() {
      const options = { header: true, lineDelimiter: '\n' }
      sets.forEach(function(set) {
        assert.deepStrictEqual(data[set].csv, new CSV(data[set].json, options).encode())
      })
    })
    it('should encode with cast', function() {
      const options = { cast: ['String', 'Primitive'] }

      const expected = '"123",\r\n,456'

      const actual = [['123', null], [null, '456']]
      assert.deepStrictEqual(expected, new CSV(actual, options).encode())
    })
    it('should encode with custom cast', function() {
      const customFunc = function(val) {
        return val === null ? '' : this.string(val)
      }

      const options = { cast: [customFunc, customFunc] }

      const expected = '"123",\r\n,"456"'

      const actual = [['123', null], [null, '456']]
      assert.deepStrictEqual(expected, new CSV(actual, options).encode())
    })
  })
})
