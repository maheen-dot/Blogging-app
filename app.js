require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const checkForAuthenticationCookie = require('./middleware/authenticaiion');
const methodOverride = require('method-override');
const session = require('express-session');

const Blog = require('./models/blog');

const userRoutes = require('./routes/user');
const blogRoutes = require('./routes/blog');
const app = express();
const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MONGODB"))
  .catch(err => console.error(err));

app.set('view engine', 'ejs');
app.set('views', './views');

app.use(cookieParser());
app.use(express.json()); // for JSON body
app.use(express.urlencoded({ extended: true })); // for form submissions
app.use(checkForAuthenticationCookie("token"));
app.use(express.static(path.resolve('./public')));
app.use(methodOverride('_method'));
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret123',
  resave: false,
  saveUninitialized: false
}));

// Middleware to make flash messages available in views
app.use((req, res, next) => {
  res.locals.success = req.session.success;
  res.locals.error = req.session.error;
  delete req.session.success;
  delete req.session.error;
  next();
});


app.use('/users', userRoutes);
app.use('/blog', blogRoutes);

app.get('/', async (req, res) => {
  const allBlogs = await Blog.find({}).sort({ createdAt: -1 });
  res.render('home', { user: req.user, blogs: allBlogs });
});
app.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});