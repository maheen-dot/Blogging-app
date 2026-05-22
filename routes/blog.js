const {Router} = require('express');
const Blog = require('../models/blog');
const User = require('../models/users');
const Comment = require('../models/comment');
const multer = require('multer');
const path = require('path');
const router = Router();
const fs = require('fs');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve("./public/uploads") )
  },
  filename: function (req, file, cb) {
  const fileName = `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;
  cb(null, fileName);
  }
})

const upload = multer({ storage: storage })

router.get('/add-blog', (req, res) => {
  res.render('addBlog', {
    user: req.user,
    blog: null, 
    success: req.query.success
  });
});



router.post('/add-blog',upload.single('coverImage'), async (req, res) => {
  try {
    const { title, content } = req.body;
    const author = req.user.id; // Assuming user is authenticated and user info is in req.user
    const coverImgUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const blog = await Blog.create({ title, content, coverImgUrl, author });
    console.log('Blog post created successfully');
    console.log("FILE:", req.file);
    return res.redirect(`/blog/${blog._id}?success=Blog post created successfully`);
  } catch (error) {
    console.error('Error creating blog post:', error);
    res.status(500).render('addBlog', { user: req.user, error: 'Failed to create blog post.' });
  }
});

router.get('/:id', async (req, res) => {
  try {

    const blog = await Blog.findById(req.params.id)
      .populate('author', 'username profileImgUrl');

    const comments = await Comment.find({ blog: blog._id })
      .populate('author');

    if (!blog) {
      return res.status(404).render('404');
    }

    // FETCH FRESH USER DATA
    let currentUser = null;

    if (req.user) {
      currentUser = await User.findById(req.user.id);
    }

    res.render('blog', {
      user: currentUser,
      blog,
      comments
    });

  } catch (error) {
    console.error('Error fetching blog post:', error);
    res.status(500).render('500');
  }
});


router.get('/edit/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).render('404');
    }
    res.render('addBlog', { user: req.user, blog });
  } catch (error) {
    console.error('Error fetching blog post for editing:', error);
    res.status(500).render('500');
  }
});


router.put('/edit/:id', upload.single('coverImage'), async (req, res) => {
  try {
    const { title, content, keepExistingImage, existingCoverUrl } = req.body;
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).render('404');
    }
    
    let coverImgUrl = blog.coverImgUrl; // Default to existing image
    
    // THE FIX: Handle image based on user action
    if (req.file) {
      // Case 1: User uploaded a new image
      coverImgUrl = `/uploads/${req.file.filename}`;
      
      // Optional: Delete old image file from server
      if (blog.coverImgUrl && blog.coverImgUrl !== coverImgUrl) {
        const oldImagePath = path.join(__dirname, '..', blog.coverImgUrl);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    } else if (keepExistingImage === 'true') {
      // Case 2: User didn't change the image - KEEP existing one
      coverImgUrl = blog.coverImgUrl;
    } else if (keepExistingImage === 'false' && !req.file) {
      // Case 3: User explicitly removed the image
      coverImgUrl = null;
      
      // Optional: Delete old image file from server
      if (blog.coverImgUrl) {
        const oldImagePath = path.join(__dirname, '..', blog.coverImgUrl);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }
    
    // Update blog with the determined coverImgUrl
    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id, 
      { 
        title, 
        content, 
        coverImgUrl  // This will correctly preserve, update, or remove the image
      }, 
      { returnDocument: 'after' }
    );
    
    res.redirect(`/blog/${updatedBlog._id}?success=Blog post updated successfully`);
  } catch (error) {
    console.error('Error updating blog post:', error);
    res.status(500).render('500');
  }
});



router.delete('/delete/:id', async (req, res) => {
   
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) {
      return res.status(404).render('404');
    }
    req.session.success = 'Blog post deleted successfully';
    res.redirect('/');  }
    catch (error) { 
    console.error('Error deleting blog post:', error);
    res.status(500).render('500');
  }
});

router.post('/add-comment/:blogId', async (req, res) => {
  try {
    const { content } = req.body;
    const author = req.user.id; // Assuming user is authenticated and user info is in req.user
    const blogId = req.params.blogId;

    const comment = new Comment({
      content,
      author,
      blog: blogId
    });

    await comment.save();
    req.session.success = 'Comment added successfully';
    res.redirect(`/blog/${blogId}`);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).render('500');
  }
});



router.delete('/delete-comment/:commentId', async (req, res) => {
  try {
    const comment = await Comment.findByIdAndDelete(req.params.commentId);
    if (!comment) {
      return res.status(404).render('404');
    }

    const blogId = comment.blog;
    res.redirect(`/blog/${blogId}`); // Redirect back to the blog post page (you may want to pass the blogId in the query or session)
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).render('500');
  }
});


module.exports = router;