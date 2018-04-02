'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var EventsParser = function () {
    function EventsParser() {
        _classCallCheck(this, EventsParser);
    }

    _createClass(EventsParser, [{
        key: 'parseEvent',
        value: function parseEvent(event) {
            if (event) {
                var eventJson = JSON.parse(JSON.stringify(event));
                var esJson = {};
                esJson.item_type = eventJson.source.item_type;
                esJson.item_id = eventJson.source.item_id;
                esJson.item_name = eventJson.source.item_name;
                esJson.parent_type = eventJson.source.parent.type;
                esJson.parent_id = eventJson.source.parent.id;
                esJson.parent_name = eventJson.source.parent.name;
                esJson.created_by_type = eventJson.created_by.type;
                esJson.created_by_id = eventJson.created_by.id;
                esJson.created_by_name = eventJson.created_by.name;
                esJson.created_by_login = eventJson.created_by.login;
                esJson.created_at = (0, _moment2.default)(eventJson.created_at).format('YYYY-MM-DDThh:mm:ss');
                esJson.event_id = eventJson.event_id;
                esJson.event_type = eventJson.event_type;

                return esJson;
            } else {
                return;
            }
        }
    }]);

    return EventsParser;
}();

module.exports = new EventsParser();