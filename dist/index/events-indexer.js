'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _elasticsearch = require('elasticsearch');

var _elasticsearch2 = _interopRequireDefault(_elasticsearch);

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

var EventsIndexer = function () {
    function EventsIndexer() {
        _classCallCheck(this, EventsIndexer);
    }

    _createClass(EventsIndexer, [{
        key: 'indexDocument',
        value: function indexDocument(properties) {
            return new Promise(function (resolve, reject) {
                client.create({
                    index: INDEX_NAME,
                    type: INDEX_TYPE,
                    id: properties.event_id,
                    body: properties
                }).then(function (createResponse) {
                    console.log(createResponse);
                    resolve(createResponse);
                }).catch(function (err) {
                    console.log(err);
                    reject(err);
                });
            });
        }
    }, {
        key: 'updateContent',
        value: function updateContent(eventId, text) {
            return new Promise(function (resolve, reject) {
                client.update({
                    index: INDEX_NAME,
                    type: INDEX_TYPE,
                    id: eventId,
                    body: {
                        doc: {
                            content: text
                        }
                    }
                }).then(function (updateResponse) {
                    console.log(updateResponse);
                    resolve(updateResponse);
                }).catch(function (err) {
                    console.log('Failed to update doc: ', err);
                    reject(err);
                });
            });
        }
    }]);

    return EventsIndexer;
}();

module.exports = new EventsIndexer();