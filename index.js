import eventsPoller from './events/events-poller';
import indexManager from './index/index-manager';

class Index {
    constructor() {
        console.log('Starting box elasticsearch example...')

        indexManager.configure()
        .then(lastEvent => {
            return eventsPoller.start(lastEvent);
        })
        .then(eventPollingStatus => {
            console.log(eventPollingStatus);
        })
        .catch(err => console.log(err));
    }
}
module.exports = new Index();