const path = require('path');

const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer')
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');

const errorController = require('./controllers/error');
const Staff = require('./models/staff')
const MONGODB_URI = 'mongodb+srv://tunglt:dvalvuumm1ty1@cluster0.5hjpvkp.mongodb.net/staff2?retryWrites=true&w=majority'


const app = express();
const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: 'sessions'
});

const csrfProtection = csrf();



app.set('view engine', 'ejs');
app.set('views', 'views');

const staffRoutes = require('./routes/staff');
const authRoutes = require('./routes/auth');

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images')
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString() + '-' + file.originalname)
    }
})

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg') {
        cb(null, true)
    } else {
        cb(null, false)
    }
}

app.use(express.urlencoded({ extended: false }));
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use(
    session({
        secret: 'my secret',
        resave: false,
        saveUninitialized: false,
        store: store
    })
);
app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.isManager = req.session.isManager;
    res.locals.csrfToken = req.csrfToken();
    next();
});

//Luu staff vao req
app.use((req, res, next) => {
    if (!req.session.staff) {
        return next();
    }
    Staff.findById(req.session.staff._id)
        .then(staff => {
            if (!staff) {
                return next();
            }
            req.staff = staff;
            next();
        })
        .catch(err => {
            next(new Error(err))
        });
});

app.use(staffRoutes);
app.use(authRoutes)

app.use(errorController.get404);
app.get('/500', errorController.get500)

app.use((error, req, res, next) => {
    res.status(500).render('500', {
        pageTitle: 'Server error',
        path: '/500',
        isAuthenticated: req.session.isLoggedIn
    });
})

mongoose
    .connect(MONGODB_URI)
    .then(result => {
        app.listen(3000)
    })
    .catch(err => console.log(err))