import moment from 'moment';

class EventsParser  {

    parseEvent(event){
            if(event) {
                const eventJson = JSON.parse(JSON.stringify(event));
                const esJson = {};
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
                esJson.created_at = moment(eventJson.created_at).format('YYYY-MM-DDThh:mm:ss');
                esJson.event_id = eventJson.event_id;
                esJson.event_type = eventJson.event_type; 
    
                return esJson;
            } else {
                return;
            }
    }
}

module.exports = new EventsParser();