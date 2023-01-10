const express = require ('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync')
const {isLoggedIn, isAuthor, validateCampground} = require('../middleware');
const campground = require('../controllers/campground');
const multer = require('multer');
const {storage} = require('../cloudinary');
const upload = multer({storage});


router.get('/', catchAsync(campground.index));

router.get('/new', isLoggedIn, campground.renderNewForm);

// router.post('/', isLoggedIn, validateCampground, catchAsync(campground.createCampground));
router.post('/', isLoggedIn,upload.array('image'), validateCampground, catchAsync(campground.createCampground));

/* router.post('/', isLoggedIn, upload.array('image'), catchAsync((req,res)=>{
    console.log(req.body, req.files);
    res.send('IT worked');
})); */

router.get('/:id', catchAsync(campground.showCampground));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campground.renderEditForm));

router.put('/:id', isAuthor,upload.array('image'), validateCampground, catchAsync(campground.updateCampground));

router.delete('/:id', isLoggedIn, isAuthor, catchAsync(campground.deleteCampground));

module.exports = router;