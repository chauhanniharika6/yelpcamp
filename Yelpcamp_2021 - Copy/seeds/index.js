const cities = require ('./cities');
const {places, descriptors} = require ('./seedHelpers');
const mongoose = require ('mongoose');
const Campground = require('../models/campground');
 
 mongoose.connect('mongodb://localhost:27017/yelp-camp',{
     useNewUrlParser:true,     
     useUnifiedTopology:true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console,"connection error:"));
db.once("open", () => {
    console.log('Database Connected');
});

const sample = array => array[ Math.floor(Math.random() * array.length )];

const seedDb = async() => {
    await Campground.deleteMany({});
    for(let i=0; i<=50; i++){
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author:'62564f530fbf6a96078dc3d1',
            location:`${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            image:'https://source.unsplash.com/collection/483251',
            description:'Lorem ipsum dolor sit amet consectetur adipisicing elit. Error praesentium quisquam quibusdam. Adipisci esse nihil porro eius eligendi sed aut accusantium repellendus ut! Distinctio recusandae impedit error? Tempora, aut sunt?',
            price
        })
        await camp.save();
    }
};

seedDb().then(() => {
    mongoose.connection.close();
});