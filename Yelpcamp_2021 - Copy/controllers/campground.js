const Campground = require('../models/campground');
const {cloudinary} = require('../cloudinary');

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('./campground/index',{campgrounds});
};

module.exports.renderNewForm = (req, res) => {
    res.render('./campground/new');
};

module.exports.createCampground = async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    campground.images = req.files.map( f=> ({ url: f.path, filename: f.filename}));
    campground.author = req.user._id;
    await campground.save();
    req.flash('success', 'Successfully! created new campground');
    res.redirect(`/campground/${campground._id}`);
};

module.exports.showCampground = async (req, res, next) => {
    const campground = await Campground.findById(req.params.id).populate({
       path: 'reviews',
       populate:{
           path: 'author'
       }
    }).populate('author');
    if(!campground){
        req.flash('error', 'Sorry! this Campground doesnt exist');
        res.redirect('/campground');
    }
    res.render('./campground/show',{campground});
};

module.exports.renderEditForm = async (req, res, next) => {
    const campground = await Campground.findById(req.params.id);
    if(!campground){
        req.flash('error', 'Sorry! this Campground doesnt exist');
        res.redirect('/campground');
    }
    res.render('./campground/edit',{campground});
};

module.exports.updateCampground = async (req, res, next) => {
    const {id} = req.params;
    const campground = await Campground.findByIdAndUpdate(id,{...req.body.campground},{new:true});
    const imgs = req.files.map( f=> ({ url: f.path, filename: f.filename}));
    campground.images.push(...imgs);
    await campground.save();
    if(req.body.deleteImages){
        const arr = req.body.deleteImages;
        for(let filename of arr){
            await cloudinary.uploader.destroy(filename);
        }
         await campground.updateOne({$pull: {images: {filename: {$in: arr}}}});
    }
    req.flash('success', 'Successfully! updated campground');
    res.redirect(`/campground/${campground._id}`);
};

module.exports.deleteCampground = async (req, res, next) => {
    const {id} = req.params;
    const campground = await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully! deleted campground');
    res.redirect('/campground');
};