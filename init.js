const mongoose = require('mongoose');
const Listing=require("./models/Listing.js");

let all_listing = [
  {
    title: "Cozy Beachfront Cottage",
    description: "A beautiful beachfront cottage with stunning ocean views.",
    image: "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?auto=format&fit=crop&w=800&q=60",
    price: 1500,
    location: "Malibu",
    country: "United States",
  },
  {
    title: "Modern Loft",
    description: "Stylish loft apartment in the heart of the city.",
    image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=60",
    price: 1200,
    location: "New York",
    country: "United States",
  },
  {
    title: "Mountain Cabin",
    description: "Peaceful cabin surrounded by mountains and forests.",
    image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=60",
    price: 1000,
    location: "Aspen",
    country: "United States",
  },
  {
    title: "Luxury Villa",
    description: "Luxury villa with private swimming pool.",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=60",
    price: 3500,
    location: "Bali",
    country: "Indonesia",
  },
  {
    title: "Tree House",
    description: "Unique tree house surrounded by nature.",
    image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=60",
    price: 800,
    location: "Portland",
    country: "United States",
  },
  {
    title: "Lake View Cabin",
    description: "Cabin with amazing lake views and outdoor activities.",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=60",
    price: 900,
    location: "Lake Tahoe",
    country: "United States",
  },
  {
    title: "City Penthouse",
    description: "Luxury penthouse with a panoramic city skyline.",
    image: "https://images.unsplash.com/photo-1622396481328-9b1b78cdd9fd?auto=format&fit=crop&w=800&q=60",
    price: 4000,
    location: "Los Angeles",
    country: "United States",
  },
  {
    title: "Beach Resort",
    description: "Enjoy a relaxing vacation at this beautiful beach resort.",
    image: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=800&q=60",
    price: 2200,
    location: "Cancun",
    country: "Mexico",
  },
  {
    title: "Swiss Chalet",
    description: "Traditional chalet located near ski slopes.",
    image: "https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=800&q=60",
    price: 3000,
    location: "Verbier",
    country: "Switzerland",
  },
  {
    title: "Historic Cottage",
    description: "Classic countryside cottage with modern amenities.",
    image: "https://images.unsplash.com/photo-1602088113235-229c19758e9f?auto=format&fit=crop&w=800&q=60",
    price: 1300,
    location: "Cotswolds",
    country: "United Kingdom",
  }
];

main().then((res)=>{
    console.log("connection successfull");
})
.catch(err => console.log(err));
async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/hotel');
  await Listing.deleteMany({});
  let updatedListings = all_listing.map((obj) => ({...obj,owner: "6a4b95604e6081e351b49e66"}));
  await Listing.insertMany(updatedListings);
}



