const express=require('express');
const app=express();
const bodyParser = require('body-parser');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false,limit :'50mb' }));
// parse application/json
app.use(bodyParser.json());

const fileUpload = require('express-fileupload');
app.use(fileUpload());

require('dotenv').config();
const cors = require('cors');
app.use(cors());
global.publicPath=__dirname+'/public';

app.use(function(req, res, next){
	global.req=req;
	next();
});

app.use(express.static(__dirname + '/public'));



const mongoose = require('mongoose');
DB_STRING='mongodb+srv://sana:sana1234@cluster0.2e6v7.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'
 //DB_STRING='mongodb://localhost:27017/auth'
  mongoose.connect(DB_STRING, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });

    mongoose.connection.on('connected', () => {
        console.log('Database connected');
    });

require('./helpers/extend-node-input-validator')
require('./routes/index')(app);

const http=require('http');
const server=http.Server(app);
const port=process.env.PORT||3001;
server.listen(port,()=>{
	console.log(`server is running on port localhost:${port}`);
});



