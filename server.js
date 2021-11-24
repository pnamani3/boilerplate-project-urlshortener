'use strict';
const dotenv = require('dotenv').config();
const express = require('express');
const mongo = require('mongodb');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;
app.use(bodyParser.urlencoded({extended: false}));
app.use(cors());
app.use(express.json());
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

// const uri = process.env.MONGO_URI;
// console.log(uri);
mongoose.connect("mongodb+srv://new_user_1:redball2020@cluster0.9sps0.mongodb.net/myFirstDatabase?retryWrites=true&w=majority", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000
});

const connection= mongoose.connection;
connection.on('error', console.error.bind(console, 'connection error:'));
connection.once('open',() => {
  console.log("MongoDB databse connection established success");
});

const Schema = mongoose.Schema;

const urlSchema = new Schema({
  original_url: String,
  short_url: String
});
const URL = mongoose.model('URL', urlSchema);

app.post('/api/shorturl/new', async function(req, res) {
  const url = req.body.url_input;
  const urlCode = shortId.generate();

  if(!validUrl.isWebUri(url)) {
    res.status(401).json({
      error:'invalid URL'
    });
  } else {
    try {
      let findOne = await URL.findOne({
        original_url: url
      });
      if (findOne) {
        res.json({
          original_url: findOne.original_url,
          short_url: findOne.short_url
        });
      } else {
        findOne = new URL({
          original_url: url,
          short_url: urlCode
        });
        await findOne.save();
        res.json({
          original_url: findOne.original_url,
          short_url: findOne.short_url
        });
      }
    } catch(err) {
      console.error(err);
      res.status(500).json('server error.');
    }
  }
});

app.get('/api/shorturl/:short_url?', async function(req,res) {
  try {
    const urlParams = await URL.findOne({
      short_url: req.params.short_url
    })
    if(urlParams) {
      return res.redirect(urlParams.original_url);
    } else {
      return res.status(404).json('No URL found');
    }
  } catch(err) {
    console.log(err);
    res.status(500).json('Server Error');
  }
});