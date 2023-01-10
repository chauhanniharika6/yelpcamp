if (process.env.NODE_ENV !== "production"){
    require('dotenv').config();
}

const express = require ('express');
const app = express();
const path = require('path');
const mongoose = require ('mongoose');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';
const MongoStore = require('connect-mongo');

const campgroundsRoutes = require('./routes/campgrounds')
const reviewsRoutes = require('./routes/reviews')
const userRoutes = require('./routes/user');
 
 mongoose.connect(dbUrl,{
     useNewUrlParser:true,     
     useUnifiedTopology:true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console,"connection error:"));
db.once("open", () => {
    console.log('Database Connected');
});

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname,'views'));
app.use(express.static(path.join(__dirname,'public')));

app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));

const store = MongoStore.create({
    mongoUrl:dbUrl,
    touchAfter: 24 * 60 * 60
});

const secret = process.env.SECRET || "NotInProduction";

store.on("error", function(e){
    console.log("SESSION STORE ERROR", e)
});

const sessionConfig = {
    store,
    secret,
    resave: false,
    saveUninitialized: true,
    cookies:{
        httpOnly:true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next) =>{
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})


/* app.get('/fakeUser', async (req,res) => {
 const user = new User({email:'chauhanniharika@gmail.com', username: 'niharika'});
 const newUser = await User.register(user, 'chicken');
 res.send(newUser);
}) */

app.get('/',(req, res) => {
    res.render("home");
})

app.use('/campground', campgroundsRoutes);
app.use('/campground/:id/review', reviewsRoutes);
app.use('/', userRoutes);

app.all( '*', (req,res,next)=>{
    next(new ExpressError('Page not Found',404))
})

app.use((err,req,res,next) => {
    const {status=500} = err
    if(!err.message) err.message = 'Something went Wrong';
    res.status(status).render('error', {err});
})

const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`listening on port ${port}`);
})