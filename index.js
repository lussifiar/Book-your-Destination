if(process.env.NODE_ENV!="production"){
    require("dotenv").config();
}
// console.log(process.env.CLOUD_API_SECRET);
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const port = 4000;
const Listing=require("./models/Listing.js");
const review=require("./models/reviews.js");
const methodOverride = require("method-override");
const engine = require('ejs-mate');
const ExpressError=require("./utlis/ExpressError.js");
const {correct,correctreview}=require("./schema.js");
const session=require("express-session");
const MongoStore = require("connect-mongo").default;
const flash=require("connect-flash");
const user=require("./models/users.js");
const passport=require("passport");
const LocalStrategy = require("passport-local");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const { cloudinary } = require("./cloudconfig.js");

// const storage = multer.diskStorage({
//     destination: "uploads/",
//     filename: (req, file, cb) => {
//         cb(null, Date.now() + "-" + file.originalname);
//     }
// });
// const upload = multer({ storage });

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "airbnb_DEV",
        allowed_formats: ["jpg", "png", "jpeg"],
    },
});

const upload = multer({ storage });



// app.listen(port, () => {
//   console.log(`app listening on port ${port}`);
// });

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(methodOverride("_method"));

app.set("view engine","ejs");
app.use(express.static("public"));
// app.use("/uploads", express.static("uploads"));

// use ejs-locals for all ejs templates:
app.engine('ejs', engine);

 const mongodb_url=process.env.Atlas_db_url;

main().then((res)=>{
    console.log("connection successfull");
})
.catch(err => console.log(err));
async function main() {
  await mongoose.connect(mongodb_url);
}

const store = MongoStore.create({
    mongoUrl: process.env.Atlas_db_url,
    crypto: {
        secret: process.env.SESSION_SECRET,
    },
    touchAfter: 24 * 3600,
});

//express session
app.use(session({
    store: store,
    secret:process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        httpOnly: true,
    }
}));

app.use (flash());

//user authentication and autorization
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(user.authenticate()));

passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());

//flash middleware
app.use((req, res, next) => {
    res.locals.currUser = req.user;
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});

app.get("/",(req,res)=>{
    res.redirect("/listing");
});

app.get("/signup",(req,res)=>{
    res.render("./listings/signup.ejs");
});

app.post("/signup",async(req,res)=>{
try{
     let {username,email,password}=req.body;
    let newuser=new user({
        username:username,
        email:email,
    })
    let registereduser=await user.register(newuser,password);
    console.log(registereduser);
    req.flash("success", "created account successfully!");
    res.redirect("/listing")
}
catch(err){
    req.flash("error", err.message);
    res.redirect("/signup");
}  
});

app.get("/login", (req, res) => {
    res.render("./listings/login.ejs");
});

app.post(
    "/login",
    passport.authenticate("local", {
        failureRedirect: "/login",
        failureFlash: true,
    }),
    (req, res) => {
        req.flash("success", "Welcome back!");
        res.redirect("/listing");
    }
);

app.get("/logout",(req,res)=>{
    req.logout((err)=>{
        if(err){
           return next(err);
        }
        else{
         req.flash("success", "You are logout");
         res.redirect("/listing");
        }
    });  
});

// app.get("/demouser", async (req, res, next) => {
//     try {
//         const fakeUser = new user({
//             username: "ashishjaiswal",
//             email: "ashishjaiswal5660@gmail.com",
//         });

//         const demo = await user.register(fakeUser, "1221@jaiswal");

//         res.send(demo);
//     } catch (err) {
//           req.flash("error", err.message);
//           res.redirect("/listings/signup");
//     }
// });


app.get("/listing",async(req,res,next)=>{
try{
     const lst= await Listing.find({});
     res.render("listings/main.ejs",{lst});
}
catch(err){
    next(err);
}
});


app.get("/listing/detail/:id",async(req,res,next)=>{
try{
    if(req.isAuthenticated()){
     let {id}=req.params;    
     const detail= await Listing.findById(id).populate("owner") .populate({path: "reviews",populate: {  path: "author" } });
     res.render("listings/detail.ejs",{detail});
}
else{
    req.flash("error", "please login ");
    res.redirect("/login");
}
}
catch(err){
    next(err);
}
});


app.get("/listing/new",(req,res)=>{
    if(req.isAuthenticated()){
res.render("listings/newlist.ejs");
    }
    else{
         req.flash("error", "please login ");
         res.redirect("/login");
    }
});


app.post("/listing/new", upload.single("image"),async(req,res,next)=>{
try{
    // 1. Validate first
        const { error } = correct.validate(req.body);
        if (error) {
            return next(new ExpressError(400, error.details[0].message));
        }

     // 2. If valid → update DB    
      let{title,description,price,location,country}=req.body;
      let listing=new Listing({
      title:title,
      description:description,
      image:req.file.path,
      price:price,
      location:location,
      country:country,
      owner:req.user._id, 
});
await listing.save();
req.flash("success", "Listing added successfully!");
res.redirect("/listing");
}
catch(err){
 next(err);
}
});


app.get("/listing/edit/:id",async(req,res)=>{
let {id}=req.params;    
const edit = await Listing.findById(id);
res.render("listings/edit.ejs",{edit});
});



app.patch("/listing/edit/:id",upload.single("image"),async(req,res,next)=>{
 try {
        // 1. Validate first
        const { error } = correct.validate(req.body);

        if (error) {
            return next(new ExpressError(400, error.details[0].message));
        }

        // 2. If valid → update DB
        let { id } = req.params;

        const edit = await Listing.findById(id);

        edit.title = req.body.title;
        edit.description = req.body.description;
           if(req.file){
            edit.image = req.file.path;
            }
        // edit.image = req.body.image;
        edit.price = req.body.price;
        edit.location = req.body.location;
        edit.country = req.body.country;

        await edit.save();

        res.redirect(`/listing/detail/${id}`);
    

    } catch (err) {
        next(err);
    }
});



app.delete("/listing/delete/:id",async(req,res)=>{
let {id}=req.params; 
// await Listing.findByIdAndDelete(id);
await Listing.findOneAndDelete({ _id: id });
req.flash("success", "Listing deleted successfully!");
res.redirect("/listing");
});

app.post("/listing/review/:id",async(req,res,next)=>{
 if(req.isAuthenticated()){  
    // 1. Validate first
        const { error } = correctreview.validate(req.body);
        if (error) {
            return next(new ExpressError(400, error.details[0].message));
        }

    let{id}=req.params;
    let listing=await Listing.findById(id);
    let{rating,comment}=req.body;
    let newreview=new review({
        rating:rating,
        comment:comment,
        author: req.user._id,
    });
    listing.reviews.push(newreview);

     await newreview.save();
     await listing.save();
    // res.send("added reviews in listing");
    req.flash("success", "review added!");
    res.redirect(`/listing/detail/${listing._id}`);
}
else{
          req.flash("error", "Login first!");
          res.redirect(`/login`);
}
});

app.delete("/listing/:id/review/:review_id",async(req,res)=>{
  if (!req.isAuthenticated()) {
        req.flash("error", "Please login first!");
        return res.redirect("/login");
    }

    let { id, review_id } = req.params;

    // Find the review
    let foundReview = await review.findById(review_id);

    // Check if current user is the review author
    if (!foundReview.author.equals(req.user._id)) {
        req.flash("error", "You are not authorized to delete this review!");
        return res.redirect(`/listing/detail/${id}`);
    }
    // 1. Remove review reference from Listing
    await Listing.findByIdAndUpdate(id, {$pull: { reviews: review_id }});
    await review.findByIdAndDelete(review_id)
      req.flash("success", "review deleted!");
      res.redirect(`/listing/detail/${id}`);
});

app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});


app.use((req,res,next)=>{
    next(new ExpressError(404,"page not found"));
});

//error middlewares
app.use((err, req, res) => {
    let { statusCode = 500, message = "Something went wrong" } = err;
    res.render("listings/error.ejs",{message});
    // res.status(statusCode).send(message);
});
