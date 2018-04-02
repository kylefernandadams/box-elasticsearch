'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _boxNodeSdk = require('box-node-sdk');

var _boxNodeSdk2 = _interopRequireDefault(_boxNodeSdk);

var _box_config = require('../box_config.json');

var _box_config2 = _interopRequireDefault(_box_config);

var _app_config = require('../app_config.json');

var _app_config2 = _interopRequireDefault(_app_config);

var _base64Stream = require('base64-stream');

var _base64Stream2 = _interopRequireDefault(_base64Stream);

var _eventsIndexer = require('../index/events-indexer');

var _eventsIndexer2 = _interopRequireDefault(_eventsIndexer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var BOX_CONFIG = _app_config2.default.box;

var TextExtractor = function () {
    function TextExtractor() {
        _classCallCheck(this, TextExtractor);
    }

    _createClass(TextExtractor, [{
        key: 'getTextRepresentation',
        value: function getTextRepresentation(client, properties) {
            return new Promise(function (resolve, reject) {
                console.log('Attempting to extract text from item with id: ', properties.item_id);
                var params = {
                    qs: {
                        fields: 'representations'
                    },
                    headers: {
                        'x-rep-hints': '[extracted_text]'
                    }
                };
                client.get('/files/' + properties.item_id, params).then(function (reps) {
                    var representations = reps.body.representations;
                    if (representations) {
                        if (representations.entries.length > 0) {
                            var representationUrl = representations.entries[0].content.url_template.replace('{+asset_path}', '');
                            console.log('Representation url: ', representationUrl);
                            return client.get(representationUrl);
                        } else {
                            console.log('NO Representations!!!');
                            return;
                        }
                    }
                }).then(function (textResponse) {
                    if (textResponse) {
                        _eventsIndexer2.default.updateContent(properties.event_id, new Buffer(textResponse.body).toString());
                        resolve('');
                    } else {
                        resolve('');
                    }
                }).catch(function (err) {
                    console.log('Failed to extract text: ', err);
                    reject(err);
                });
            });
        }
    }]);

    return TextExtractor;
}();

module.exports = new TextExtractor();