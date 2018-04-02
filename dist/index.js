'use strict';

var _eventsPoller = require('./events/events-poller');

var _eventsPoller2 = _interopRequireDefault(_eventsPoller);

var _indexManager = require('./index/index-manager');

var _indexManager2 = _interopRequireDefault(_indexManager);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Index = function Index() {
    _classCallCheck(this, Index);

    console.log('Starting box elasticsearch example...');

    _indexManager2.default.configure().then(function (lastEvent) {
        return _eventsPoller2.default.start(lastEvent);
    }).then(function (eventPollingStatus) {
        console.log(eventPollingStatus);
    }).catch(function (err) {
        return console.log(err);
    });
};

module.exports = new Index();