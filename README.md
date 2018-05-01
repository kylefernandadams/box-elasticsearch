# box-elasticsearch

**Installation instructions for macOS:**

1. Install Elasticsearch with Homebrew:
 - brew install elasticsearch

2. Then install Kibana if you want to easily visualize your ES index:
 - brew install kibana

3. If you do not have yarn install you can install it with homebrew:
 - brew install yarn

4. Create a Box JWT application from the box develoepr console.
 - Follow the steps [here](https://developer.box.com/docs/setting-up-a-jwt-app#section-step-1-create-and-configure-a-jwt-application)

5. After you download your application configuration json file, rename it to box_config.json and move it to the box-elasticsearch folder before running "yarn start" 

6. Start elastic search and Kibana

7. To start the indexing process, you can use the following yarn command:
 - yarn start

*Here are some useful links:*

Check all available indexes: 
http://localhost:9200/_cat/indices?v&pretty 

Run a search against the box index: 
http://localhost:9200/box/_search?q=*&pretty

Access Kibana: http://localhost:5601
You will need configure Kibana to use the box index in the Management -> Index Patterns part of the console. 
Then use box and use created_at as the Time Filter field.

