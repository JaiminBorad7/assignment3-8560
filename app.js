const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access')
const hbs = require('express-handlebars');
const mongoose=require('mongoose');
const bodyParser = require('body-parser');
const Handlebars = require('handlebars');
const app = express();
const cors = require("cors");
const session = require("express-session");
const flash = require('req-flash');
const MongoStore = require("connect-mongo")(session);
const passport = require("./passport/setup");
const auth = require("./routes/auth");;
const hbshelpers = require('handlebars-helpers');
const propertyRouter = require('./routes/property');
const { cities } = require('./cities');
const paymentsRouter = require('./routes/payments');
const Property = require('./models/Property');

const multihelpers = hbshelpers(['object', 'string']);
const helpers = {
  eq: function(a, b, options){
    if (a === b) {
      return true;
      }
    return false;
  },
}

//setup view engine
app.engine('hbs', hbs({
  extname: 'hbs', 
  defaultLayout: 'layout', 
  layoutsDir: __dirname + '/views/layouts/',
  handlebars: allowInsecurePrototypeAccess(Handlebars),
  helpers: {...multihelpers, ...helpers } 
}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

//other setup
app.use(express.json());
app.use(bodyParser());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors())

//Set up Express Session
app.use(
    session({
        secret: "mySecret",
        resave: false,
        saveUninitialized: true,
        store: new MongoStore({ mongooseConnection: mongoose.connection })
    })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

//set up flash
app.use(flash());

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.use('/uploads', express.static('uploads'));

//connect to mongo db using connection string
mongoose.connect('mongodb+srv://realtor:realtor@cluster0.lxpjx.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
).then(async () => {
  console.log('connected to db');
  /** To insert initial 2000 books in database (execute only once) **/
  // const books = require('./books.json');
  // await Book.insertMany(books);
  // console.log('inserted');  
}).catch((err) => {
  console.log('db connection failed with ', err);
})

//routes
app.use("/auth", auth);
app.use('/property', propertyRouter);
app.use('/payments', paymentsRouter);

app.get('/', async (req, res) => {
  console.log(req.isAuthenticated());
  const properties = await Property.find();
  res.render('home', { user: req.user, properties, cities, message: req.flash('message')  });
});

module.exports = app;