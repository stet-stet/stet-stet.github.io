var express = require('./express');
var scrapper = require('./scrap');
const app = express();

app.get('/',function(req,res){
    res.send('Hello world!');
})