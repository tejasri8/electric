var express = require('express')
var bodyParser = require('body-parser')
var passport = require('passport')
var nodemailer = require('nodemailer');
var router = require('express').Router()
const request = require('request');
var LocalStrategy = require('passport-local').Strategy;
var ejs = require('ejs');
var User = require('./models/user');

var Details = require('./models/detailsSchema')
const port = process.env.PORT || 4000;
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        //giving the mail details through which the mail should be sent after signed up
        user: 'techluminav@gmail.com',
        pass: 'Tejasri08'
    }
});
var app = express()

app.use(bodyParser.urlencoded({ extended: true }));
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;



//&useNewUrlParser=true&useUnifiedTopology=false
//connecting ourdatabase
mongoose.connect('mongodb+srv://fudict:fudict@client@cluster0.axvuy.mongodb.net/fudict?retryWrites=true&w=majority',
    { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, }).then(() => { console.log("successful db connection") }).catch((err) => { console.log(err) });
mongoose.set('useFindAndModify', false);
app.set("view engine", 'ejs');
app.use(require('express-session')({
    //hashing the password
    secret: "salt",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());




//Rendering the login.ejs , to view when we run the server .
app.get('/', (req, res) => {
    res.render('login', { data: { view: false } })
});


//render to the register page
app.get("/signup?", (req, res) => {
    res.render("register", { data: { view: false } });
});

app.get("/profile", (req, res) => {
    res.render("profile", {
        data: {
            view: false
        }
    });

});
app.get("/addorEdit", (req, res) => {
    res.render("addorEdit", { data: { view: false } })

})


app.get('/pdetails', function (req, res, next) {

    //here it is
    var user = req.user;
    console.log(user)

    //you probably also want to pass this to your view
    res.render('pdetails', { data: { view: false, title: 'profile', show: user } });
});


//render to the details page once we click on login
app.get('/login', isLoggedIn, function (req, res) {
    res.render('details', { data: { view: false } })
});
app.get('/postsignup', isLoggedIn, function (req, res) {
    res.render('postsignup', { data: { view: false } })
});
app.get("/login", (req, res) => {
    res.render("login", { data: { view: false } });
});
app.get("/details", (req, res) => {
    res.render("details", { data: { view: false } });
});
app.get("/email", (req, res) => {
    res.render("email", { data: { view: false } });
});







//posting  details in register page 
app.post("/signup", function (req, res) {
    //user is a colllection 
    Users = new User({ email: req.body.email, username: req.body.username, phonenumber: req.body.phonenumber, meteridnumber: req.body.meteridnumber, adhaarnumber: req.body.adhaarnumber });
    //checking whether the given details are exist or new one
    User.register(Users, req.body.cpassword, function (err, user) {
        if (err) {
            res.render('register', { data: { view: true, msg: "given details are already exist" } })//if error msg will print
        } else {
            res.render('login.ejs', { data: { view: false, show: data } });//if correct render to login page
            //sending email after successfully signedup
            const mailOptions = {
                from: 'techluminav@gmail.com', // sender address
                to: req.body.email, // list of receivers
                subject: 'Subject of your email', // Subject line
                html: `<h2>Welcome to Techlumin Av</h2>
            <h1> ${req.body.username}</h1>
           
            `// plain text body
            };
            transporter.sendMail(mailOptions, function (err, info) {
                if (err)
                    console.log(err)
                else
                    console.log(info);
            });



        }
    });


});
//posting in login page
app.post("/login", function (req, res) {
    //if user is not given msg will print
    if (!req.body.username) {
        res.render('login', { data: { view: true, msg1: "Username was not given" } })
    } else {
        //if password is not given msg will print
        if (!req.body.password) {
            res.render('login', { data: { view: true, msg: "Password was not given" } })
        } else {
            passport.authenticate('local', function (err, user, info) {
                if (err) {
                    console.log(err)

                    res.render('login', { data: { view: true, msg: err } })
                } else {
                    if (!user) {
                        //if given details are wrong
                        res.render('login', { data: { view: true, msg: "Username or password incorrect " } })//if given details are wrong
                    } else {
                        req.login(user, function (err) {
                            if (err) {
                                console.log(err)
                                res.render('login', { data: { view: true, msg: err } })

                            } else {
                                //if the ogin details are correct render to details page&and show helps us to print username

                                res.render('details', { data: { view: true, show: req.body.username } });




                            }
                        })
                    }
                }
            })(req, res);
        }
    }
}
)


app.put("/pdetails", (req, res) => {
    console.log("editing");
    var userObj = {
        "Pnonenumber": req.body.phonenumber,
        "Email": req.body.email
        
    }
    User.findByIdAndUpdate(req.params.id, userObj, { new: true }).exec((err, user) => {
        if (err)
            res.status(400).send(err)
        else
            res.render('pdetails')
    })
})




app.get('/getall', isLoggedIn, (req, res) => {
    User.findById(req.user.id).populate(
        {
            path: "users",
            options: { sort: { 'date': -1 } }
        }).exec(function (err, user) {
            if (err) {
                console.log(err);
            } else {
                res.render('alldetails', { data: { view: true, result: user.details } })
            }
        })


})
app.get("/data", (req, res) => {
    User.find({}, (err, result) => {
        if (err)
            console.log(err)
        else {
            res.render("data", { data: { view: false, userdata: result } })

        }
    })

});
// app.post("/search", (req, res) => {
//     const reg = new RegExp(req.body.username)


//     User.find({ username: { $regex: reg } }, function (err, found) {
//         if(err)
//         console.log(err)
//         else{

        
//         console.log("Partial Search Begins");
//         console.log(found.hits.hits);
//         res.send(found)
//     }
//     });
// })

// app.post("/search", function(req, res){
//     const reg = new RegExp(req.body.username,"i")
  
//     User.find({
        

//             username: {$regex: reg},
          
        
//     }, function(err, searchedUser){
//         if(err){
//             console.log(err);
           
//         } else {
//            console.log(searchedUser)
//         }
//     });
// });








function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.redirect('/');
    }

}
//logout 
app.get("/logout", function (req, res) {
    req.logout();
    res.render('login', { data: { view: false } });
});

app.listen(port, () => { console.log(" server running") })