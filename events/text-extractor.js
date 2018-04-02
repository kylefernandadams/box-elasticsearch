import BoxSDK from 'box-node-sdk';
import boxConfig from '../box_config.json';
import appConfig from '../app_config.json';
import base64 from 'base64-stream'
import eventIndexer from '../index/events-indexer';
const BOX_CONFIG = appConfig.box;

class TextExtractor  {
    getTextRepresentation(client, properties) {
        return new Promise((resolve, reject) => {
            console.log('Attempting to extract text from item with id: ', properties.item_id);
            const params = {
                qs: {
                    fields: 'representations'
                },
                headers: {
                    'x-rep-hints': '[extracted_text]'
                }
            };
            client.get(`/files/${properties.item_id}`, params)
            .then(reps => {
                const representations = reps.body.representations;
                if(representations) {
                    if(representations.entries.length > 0) {
                        const representationUrl = representations.entries[0].content.url_template.replace('{+asset_path}', '');                    
                        console.log('Representation url: ', representationUrl);
                        return client.get(representationUrl);                    
                    } else {
                        console.log('NO Representations!!!');
                        return;
                    }
                }
            })
            .then(textResponse => {
                if(textResponse) {
                    eventIndexer.updateContent(properties.event_id, new Buffer(textResponse.body).toString());                   
                    resolve('');
                } else {
                    resolve('');
                }
            })
            .catch(err => {
                console.log('Failed to extract text: ', err);
                reject(err);
            });
        });
    }
}

module.exports = new TextExtractor();