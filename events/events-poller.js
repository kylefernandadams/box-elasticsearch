import BoxSDK from 'box-node-sdk';
import boxConfig from '../box_config.json';
import appConfig from '../app_config.json';
import moment from 'moment';
import path from 'path';

import eventsParser from './events-parser';
import textExtractor from './text-extractor';
import eventsIndexer from '../index/events-indexer';

const BOX_CONFIG = appConfig.box;
const POLLING_INTERVAL = BOX_CONFIG.pollingInterval;
const TEXT_FILE_EXTENSIONS = BOX_CONFIG.textFileExtensions;
const EVENT_TYPE = BOX_CONFIG.eventTypes;

const sdk = BoxSDK.getPreconfiguredInstance(boxConfig);
sdk.configure({
    staleBufferMS: 0,
    expiredBufferMS: 180000
});

class EventsPoller  {

    start(lastEvent) {
        console.log('Getting box enterprise events...');
        const client = sdk.getAppAuthClient('user', BOX_CONFIG.serviceAccount);
        
        const now = moment.utc(new Date()).format();
        const past = moment(now).subtract(BOX_CONFIG.lookbackValue, BOX_CONFIG.lookbackDuration).utc().format();
        let startDate = past;
        
        if(lastEvent.hits.total > 1) {
            const lastCreatedAtDate = lastEvent.hits.hits[0]._source.created_at;
            console.log('Found last created_at date: ', lastCreatedAtDate);
            startDate = lastCreatedAtDate;            
        }
        console.log('Using start date: ', startDate);
        
        const EVENT_TYPES = [
            client.events.enterpriseEventTypes.UPLOAD
        ];        

        client.events.getEnterpriseEventStream({
            startDate: startDate,
            pollingInterval: POLLING_INTERVAL,
            eventTypeFilter: EVENT_TYPES
        })
        .then(stream => {
            stream.on('error', (err) => {
                console.log('Found error streaming events:', err);
            });
            stream.on('data', event => {
                console.log('Successfully streaming events...');
                
                if(event.source.item_type === 'file') {
                    const esJson = {};            
                    const properties = eventsParser.parseEvent(event);    
                    let fileExtension = '';
                    client.files.get(properties.item_id, { fields: 'item_status' })
                    .then(fileInfo => {
                        if(fileInfo.item_status === 'active') {
                            const fileName = properties.item_name;
                            fileExtension = path.extname(fileName);
                            return eventsIndexer.indexDocument(properties)
                        }
                    })
                    .then(indexRes => {
                        if(TEXT_FILE_EXTENSIONS.indexOf(fileExtension) !== -1){
                            return textExtractor.getTextRepresentation(client, properties)   
                        }
                    })
                    .then(text => {
                        console.log(`Found text for 
                        item_id: ${properties.item_id}, 
                        name: ${properties.item_name}, 
                        event_id: ${properties.event_id}`);                            
                    })
                    .catch(err => {
                        console.log(`Failed to get fileInfo with status: ${err.response.body.status} and code: ${err.response.body.code}`);
                    });  
                }
            });
            stream.on('end', () => console.log('End of enterprise event stream'));
        })
        .catch( err => {
            console.log('Failed to get enterprise events', err);
        });
    }
}

module.exports = new EventsPoller();