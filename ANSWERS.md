1. How to run?
install the dependencies using npm install command. make a .env file and copy the following
MONGO_URI= "mongodb+srv://maheenfarhat11_db_user:VT2Y0A92zucjCl5A@cluster0.ubx8xal.mongodb.net/?appName=bloggify"
JWT_SECRET_KEY= "mySuperSecret"
PORT= 3000


npm start - to run the code

2. Stack choice?
I used Node.js, Express, MongoDB, and EJS for building this blogging application.I chose this stack because it allowed me to build a full-stack application using JavaScript across both frontend using SSR and backend, which made development faster.
Express made routing simple, MongoDB was flexible for storing blogs, users, comments, and EJS helped me quickly render server-side pages without needing a complex frontend framework. It was easy to mange both frontend and backend at the same place.

3. One real edge case
User edits a blog without uploading a new image. If not handled properly it deletes the existing image

I handled this in addblog.ejs file line 42-onnwards

4. AI usage: 
I used chat gpt in add blog page, first I designed the page myself but UI felt boring so i asked chatgpt to optimize it and in debugging in blog.ejs and some other places when APIs gave error responses.

5. Honest gap
The UI is certainly very basic and features too. If I had more time I would have focused on a better UI. The feature i would have loved to create would be categorizing blogs and user could follow the category the are interested in such as sccience, politics, arts, religion, history,etc.