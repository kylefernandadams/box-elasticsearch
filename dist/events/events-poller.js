'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _boxNodeSdk = require('box-node-sdk');

var _boxNodeSdk2 = _interopRequireDefault(_boxNodeSdk);

var _box_config = require('../box_config.json');

var _box_config2 = _interopRequireDefault(_box_config);

var _app_config = require('../app_config.json');

var _app_config2 = _interopRequireDefault(_app_config);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _eventsParser = require('./events-parser');

var _eventsParser2 = _interopRequireDefault(_eventsParser);

var _textExtractor = require('./text-extractor');

var _textExtractor2 = _interopRequireDefault(_textExtractor);

var _eventsIndexer = require('../index/events-indexer');

var _eventsIndexer2 = _interopRequireDefault(_eventsIndexer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var BOX_CONFIG = _app_config2.default.box;
var POLLING_INTERVAL = BOX_CONFIG.pollingInterval;
var TEXT_FILE_EXTENSIONS = BOX_CONFIG.textFileExtensions;
var EVENT_TYPE = BOX_CONFIG.eventTypes;

var sdk = _boxNodeSdk2.default.getPreconfiguredInstance(_box_config2.default);
sdk.configure({
    staleBufferMS: 0,
    expiredBufferMS: 180000
});

var EventsPoller = function () {
    function EventsPoller() {
        _classCallCheck(this, EventsPoller);
    }

    _createClass(EventsPoller, [{
        key: 'start',
        value: function start(lastEvent) {
            console.log('Getting box enterprise events...');
            var client = sdk.getAppAuthClient('user', BOX_CONFIG.serviceAccount);

            var now = _moment2.default.utc(new Date()).format();
            var past = (0, _moment2.default)(now).subtract(BOX_CONFIG.lookbackValue, BOX_CONFIG.lookbackDuration).utc().format();
            var startDate = past;

            if (lastEvent.hits.total > 1) {
                var lastCreatedAtDate = lastEvent.hits.hits[0]._source.created_at;
                console.log('Found last created_at date: ', lastCreatedAtDate);
                startDate = lastCreatedAtDate;
            }
            console.log('Using start date: ', startDate);

            var EVENT_TYPES = [client.events.enterpriseEventTypes.UPLOAD];

            client.events.getEnterpriseEventStream({
                startDate: startDate,
                pollingInterval: POLLING_INTERVAL,
                eventTypeFilter: EVENT_TYPES
            }).then(function (stream) {
                stream.on('error', function (err) {
                    console.log('Found error streaming events:', err);
                });
                stream.on('data', function (event) {
                    console.log('Successfully streaming events...');

                    if (event.source.item_type === 'file') {
                        var esJson = {};
                        var properties = _eventsParser2.default.parseEvent(event);
                        var fileExtension = '';
                        client.files.get(properties.item_id, { fields: 'item_status' }).then(function (fileInfo) {
                            if (fileInfo.item_status === 'active') {
                                var fileName = properties.item_name;
                                fileExtension = _path2.default.extname(fileName);
                                return _eventsIndexer2.default.indexDocument(properties);
                            }
                        }).then(function (indexRes) {
                            if (TEXT_FILE_EXTENSIONS.indexOf(fileExtension) !== -1) {
                                return _textExtractor2.default.getTextRepresentation(client, properties);
                            }
                        }).then(function (text) {
                            console.log('Found text for \n                        item_id: ' + properties.item_id + ', \n                        name: ' + properties.item_name + ', \n                        event_id: ' + properties.event_id);
                        }).catch(function (err) {
                            console.log('Failed to get fileInfo with status: ' + err.response.body.status + ' and code: ' + err.response.body.code);
                        });
                    }
                });
                stream.on('end', function () {
                    return console.log('End of enterprise event stream');
                });
            }).catch(function (err) {
                console.log('Failed to get enterprise events', err);
            });
        }
    }]);

    return EventsPoller;
}();

module.exports = new EventsPoller();