const {Router} = require('express');
const User = require('../models/users');
const router = Router();
const bcrypt = require('bcrypt');
const { generateToken } = require('../services/authentication');

router.post('/subscribe/:id', async (req, res) => {
  console.log("subscribe route hit");
  try {

    const authorId = req.params.id;
    const currentUserId = req.user.id;

    if (authorId === currentUserId) {
      return res.redirect(req.get('Referrer') || '/');
    }

    const currentUser = await User.findById(currentUserId);
    const author = await User.findById(authorId);

    if (!author) {
      return res.status(404).send('User not found');
    }

    if (currentUser.subscribedto.includes(authorId)) {
      return res.redirect(req.get('Referrer') || '/');
    }

    currentUser.subscribedto.push(authorId);

    await currentUser.save();

    return res.redirect(req.get('Referrer') || '/');

  } catch (error) {
    console.error(error);
    return res.status(500).send('Server error');
  }
});


router.get('/signup', (req, res) => {
  res.render('signup');
});

router.get('/login', (req, res) => {
  res.render('login');
});

router.post('/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

   await User.create({username, email, password});
   return res.redirect("login")
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
  
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).render('login', { error: 'Invalid credentials' });
    } 

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).render('login', { error: 'Invalid password' });
    }

    const token = generateToken(user);
    return res.cookie('token', token, { httpOnly: true }).redirect("/");
    
  } catch (error) {
    console.log(error);
    return res.status(500).render('login', { error: 'Server error' });
  } 
});


module.exports = router;