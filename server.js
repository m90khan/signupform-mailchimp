const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const async = require('async');
const request = require('request');
const expressHbs = require('express-handlebars');
const path = require('path');
const session = require('express-session'); // inmemorystore: to store objects on memory level
const flash = require('express-flash'); // to render message to user . you entered wrong email etc
const MongoStore = require('connect-mongo')(session); // to store session

const port = 3010;
// express : web framework so we can use htpp methods
//body-parser: how to read data from a form
//morgan:report every request to server read all the request that has been made by user
//request: to fetch data from API

//middleware: acts as a middleman for autehtication
const app = express();
//set engine handlebars
//making the layout : make design from layout page
app.engine('.hbs', expressHbs({ defaultLayout: 'layout', extname: '.hbs' }));
app.set('view engine', 'hbs'); // accessing handlesbars
//middleware for currentdirectory
app.use(express.static(path.join(__dirname, "public")));
// use libraries as middleware
app.use(bodyParser.json()); // to read json datatype
app.use(bodyParser.urlencoded({extended:false})); // to read everytyoe of encoded file
app.use(morgan( 'dev')); // read every request that the user has made
//session
app.use(session({
  resave: true, // forces session to saveback sessionstore even if its not modified
  saveUinitialized: true, //forces session to be save to the data store
  secret: 'dramticstore', // session id cookie
  store: new MongoStore({url: 'mongourlHERE'}) // datastore where to store session
}));
app.use(flash());


//route : when there are multiple http methods
app.route('/')
  .get((req,res,next)=>{
    res.render('main/home',{message: req.flash('success')});
})
.post((req,res,next)=>{
  request({
    url: 'https://us20.api.mailchimp.com/3.0/lists/YourlistId/members',
    method: 'POST',
    headers:{
      'Authorization': 'userData YourAPIKEY',
      'Content-Type': 'application/json'
    },
    json:{

      'email_address':req.body.email,
      'status': 'subscribed',
      merge_fields:{
      FNAME: req.body.name    }
    }
  }, function(err,response,body){
    if(err){
      console.log(err);
    }else{
      console.log('success');
      req.flash('success', 'You have submitted your email')
      res.redirect('/');
    }
  });

});
// session =memory store . to preserve data for future use . use datastor = mongodb, redis

app.listen(port, (err)=>{
  if(err){
    console.log(err);
  }else{
    console.log(`App is running on ${port} `);
  }
})
