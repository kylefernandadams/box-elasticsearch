'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _elasticsearch = require('elasticsearch');

var _elasticsearch2 = _interopRequireDefault(_elasticsearch);

var _typeMapping = require('./type-mapping.json');

var _typeMapping2 = _interopRequireDefault(_typeMapping);

var _app_config = require('../app_config.json');

var _app_config2 = _interopRequireDefault(_app_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ELASTIC_CONFIG = _app_config2.default.elastic;
var client = new _elasticsearch2.default.Client({
    host: ELASTIC_CONFIG.host,
    log: ELASTIC_CONFIG.logLevel
});

var INDEX_NAME = ELASTIC_CONFIG.indexName;
var INDEX_TYPE = ELASTIC_CONFIG.filesType;

var IndexManager = function () {
    function IndexManager() {
        _classCallCheck(this, IndexManager);
    }

    _createClass(IndexManager, [{
        key: 'configure',
        value: function configure() {
            var _this = this;

            return new Promise(function (resolve, reject) {
                _this.indexExist().then(function (indexExists) {
                    console.log('Index already exists? ', indexExists);

                    // The index does not exist
                    if (!indexExists) {
                        console.log('Index does not exist, lets create it!');
                        // Create the index
                        return _this.createIndex();
                    } else {
                        return 'Index already exists!';
                    }
                }).then(function (indexStatus) {
                    console.log('Index status: ', indexStatus);

                    return _this.typeMappingExist();
                }).then(function (typeExists) {
                    console.log('Type mapping exsits? ', typeExists);

                    if (!typeExists) {
                        console.log('Type mapping does not exist, lets create it!');

                        return _this.createTypeMapping();
                    } else {
                        return 'Type mapping already exists!';
                    }
                }).then(function (typeMappingStatus) {
                    console.log('Type mapping status: ', typeMappingStatus);
                    resolve(_this.getLastEvent());
                }).catch(function (err) {
                    console.log(err);
                    reject(err);
                });
            });
        }
    }, {
        key: 'indexExist',
        value: function indexExist() {
            console.log('Checking if ES index exists...');

            return new Promise(function (resolve, reject) {
                client.indices.exists({
                    index: INDEX_NAME
                }).then(function (indexExists) {
                    console.log('Index exists? ', indexExists);
                    resolve(indexExists);
                }).catch(function (err) {
                    console.log(err);
                    reject(err);
                });
            });
        }
    }, {
        key: 'createIndex',
        value: function createIndex() {
            return new Promise(function (resolve, reject) {
                client.indices.create({
                    index: INDEX_NAME
                }).then(function (indexCreated) {
                    console.log('Index created: ', indexCreated);
                    resolve(indexCreated);
                }).catch(function (err) {
                    console.log(err);
                    reject(err);
                });
            });
        }
    }, {
        key: 'typeMappingExist',
        value: function typeMappingExist() {
            return new Promise(function (resolve, reject) {
                client.indices.existsType({
                    index: INDEX_NAME,
                    type: INDEX_TYPE
                }).then(function (typeMappingExists) {
                    console.log('Index type mapping exists? ', typeMappingExists);
                    resolve(typeMappingExists);
                }).catch(function (err) {
                    console.log(err);
                    reject(err);
                });
            });
        }
    }, {
        key: 'createTypeMapping',
        value: function createTypeMapping() {
            return new Promise(function (resolve, reject) {
                client.indices.putMapping({
                    index: INDEX_NAME,
                    type: INDEX_TYPE,
                    body: _typeMapping2.default
                }).then(function (typeMappingCreated) {
                    console.log('Type mapping created? ', typeMappingCreated);
                    resolve(typeMappingCreated);
                }).catch(function (err) {
                    console.log(err);
                    reject(err);
                });
            });
        }
    }, {
        key: 'getLastEvent',
        value: function getLastEvent() {
            return new Promise(function (resolve, reject) {
                client.search({
                    index: INDEX_NAME,
                    type: INDEX_TYPE,
                    body: {
                        _source: ['created_at'],
                        query: {
                            match_all: {}
                        },
                        size: 1,
                        sort: {
                            created_at: 'desc'
                        }
                    }
                }).then(function (lastEvent) {
                    console.log('^^^^ ', lastEvent.hits.hits[0]);
                    resolve(lastEvent);
                }).catch(function (err) {
                    console.log(err);
                    reject(err);
                });
            });
        }
    }]);

    return IndexManager;
}();

module.exports = new IndexManager();