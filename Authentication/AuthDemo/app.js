var express               = require("express"),
    mongoose              = require("mongoose"),
    passport              = require("passport"),
    bodyParser            = require("body-parser"),
    User                  = require("./models/user.js"),
    LocalStrategy         = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose")
    
mongoose.connect("mongodb://localhost/auth_demo_app");
var app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(require("express-session")({
    secret: "This is the stuff that encrypts your pass",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//============
// ROUTES
//============

app.get("/", function(req, res){
    res.render("home");
});

// Auth Routes

//show sign up form
app.get("/register", function(req, res){
   res.render("register"); 
});

//handling user sign up
app.post("/register", function(req, res){
    User.register(new User({username: req.body.username}), req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.render('register');
        }
        passport.authenticate("local")(req, res, function(){
           res.redirect("/");
        });
    });
});

// LOGIN ROUTES
//render login form
app.get("/login", function(req, res){
   res.render("login"); 
});
//login logic
//middleware
app.post("/login", passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login"
}) ,function(req, res){
});

app.get("/logout", function(req, res){
    req.logout();
    res.redirect("/");
});


function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}


app.get('/users/:id', (req, res) => {
    const userID = req.params.id;

    User.findOne({username : userID})
    .exec()
    .then(doc => {
        res.render("secret", {doc});
        console.log(doc);
    })
    .catch(err => {
        console.log(err);
    });
});

app.get('/users/:id/edit', isLoggedIn, (req, res) => {
    const id = req.session.passport.user;
    const userID = req.params.id;

    if (id !== userID){
        console.log('Illegal login------------------------');
        res.redirect("/login");
    }
    User.findOneAndUpdate({username : userID})
    .exec()
    .then(doc => {
        res.render("blabla", {doc});
        console.log(doc);
    })
    .catch(err => {
        console.log(err);
    });
});

app.get('/users/:id/stream', isLoggedIn, (req, res) => {
    const id = req.session.passport.user;
    const userID = req.params.id;
    let video_id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    if (id !== userID){
        console.log('Illegal login------------------------');
        res.redirect("/login");
    }
    User.findOneAndUpdate({username : userID}, {video_id : video_id})
    .exec()
    .then(doc => {
        res.render("secret", {doc});
        console.log(doc);
    })
    .catch(err => {
        console.log(err);
    });
});

app.get('/users/:id/watch', isLoggedIn, (req, res) => {
    const userID = req.params.id;

    User.findOne({username : userID})
    .exec()
    .then(doc => {
        res.render("secret", {doc});
        console.log(doc);
    })
    .catch(err => {
        console.log(err);
    });
});

app.listen(3000, function(){
    console.log("server started.......");
})
