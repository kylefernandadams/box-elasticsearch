import elasticsearch from 'elasticsearch';
import typeMapping from './type-mapping.json';
import appConfig from '../app_config.json';
const ELASTIC_CONFIG = appConfig.elastic;
const client = new elasticsearch.Client({
    host: ELASTIC_CONFIG.host,
    log: ELASTIC_CONFIG.logLevel
});

const INDEX_NAME = ELASTIC_CONFIG.indexName;
const INDEX_TYPE = ELASTIC_CONFIG.filesType;

class IndexManager {

    configure(){
        return new Promise((resolve, reject) => {
            this.indexExist()
            .then(indexExists => {
                console.log('Index already exists? ', indexExists);
                
                // The index does not exist
                if(!indexExists) {
                    console.log('Index does not exist, lets create it!');
                    // Create the index
                    return this.createIndex()
                } else {
                    return 'Index already exists!';
                }
            })
            .then(indexStatus => {
                console.log('Index status: ', indexStatus);
            
                return this.typeMappingExist();    
            })
            .then(typeExists => {
                console.log('Type mapping exsits? ', typeExists);
                
                if(!typeExists) {
                    console.log('Type mapping does not exist, lets create it!');
                    
                    return this.createTypeMapping();
                } else {
                    return 'Type mapping already exists!';
                }
            })
            .then(typeMappingStatus => {
                console.log('Type mapping status: ', typeMappingStatus);
                resolve(this.getLastEvent());
            })
            .catch(err => {
                console.log(err)
                reject(err);
            });
        });
        
    }

    indexExist(){
        console.log('Checking if ES index exists...');
        
        return new Promise((resolve, reject) => {
            client.indices.exists({
                index: INDEX_NAME
            })
            .then(indexExists => {
                console.log('Index exists? ', indexExists)
                resolve(indexExists)
            })
            .catch(err => {
                console.log(err);
                reject(err);
            });
        });
        
    }

    createIndex(){
        return new Promise((resolve, reject) => {
            client.indices.create({
                index: INDEX_NAME
            })
            .then(indexCreated => {
                console.log('Index created: ', indexCreated);
                resolve(indexCreated);
            })
            .catch(err => {
                console.log(err);
                reject(err);
            });
        });
    }

    typeMappingExist(){
        return new Promise((resolve, reject) => {
            client.indices.existsType({
                index: INDEX_NAME,
                type: INDEX_TYPE
            })
            .then(typeMappingExists => {
                console.log('Index type mapping exists? ', typeMappingExists);
                resolve(typeMappingExists);
            })
            .catch(err => {
                console.log(err);
                reject(err);
            });
        });
    }

    createTypeMapping(){
        return new Promise((resolve, reject) => {
            client.indices.putMapping({
                index: INDEX_NAME,
                type: INDEX_TYPE,
                body: typeMapping
            })
            .then(typeMappingCreated => {
                console.log('Type mapping created? ', typeMappingCreated);
                resolve(typeMappingCreated);
            })
            .catch(err => {
                console.log(err);
                reject(err);
            })
        });
    }

    getLastEvent(){
        return new Promise((resolve, reject) => {
            client.search({
                index: INDEX_NAME,
                type: INDEX_TYPE,
                body: {
                    _source: ['created_at'],
                    query: {
                        match_all: {}
                    },
                    size: 1,
                    sort: {
                        created_at: 'desc'
                    }
                }
            })
            .then(lastEvent=> {
                console.log('^^^^ ', lastEvent.hits.hits[0]);                
                resolve(lastEvent);
            })
            .catch(err => {
                console.log(err);
                reject(err);
            });
        });
    }
}

module.exports = new IndexManager();