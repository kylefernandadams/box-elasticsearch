import elasticsearch from 'elasticsearch';
import appConfig from '../app_config.json';
const ELASTIC_CONFIG = appConfig.elastic;
const client = new elasticsearch.Client({
    host: ELASTIC_CONFIG.host,
    log: ELASTIC_CONFIG.logLevel
});

const INDEX_NAME = ELASTIC_CONFIG.indexName;
const INDEX_TYPE = ELASTIC_CONFIG.filesType;

class EventsIndexer {
    indexDocument(properties){
        return new Promise((resolve, reject) => {
            client.create({
                index: INDEX_NAME,
                type: INDEX_TYPE,
                id: properties.event_id,
                body: properties
            })
            .then(createResponse => {
                console.log(createResponse);
                resolve(createResponse);
            })
            .catch(err => {
                console.log(err);
                reject(err);    
            });
        });
    }

    updateContent(eventId, text) {
        return new Promise((resolve, reject) => {
            client.update({
                index: INDEX_NAME,
                type: INDEX_TYPE,
                id: eventId,
                body: {
                    doc: {
                        content: text
                    }
                }
            })
            .then(updateResponse => {
                console.log(updateResponse);
                resolve(updateResponse);
            })
            .catch(err => {
                console.log('Failed to update doc: ', err);
                reject(err);
            })
        });
    }
}

module.exports = new EventsIndexer();