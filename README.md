# My Library App

My Library App is a full-stack library application created using React for the front-end and Node.js and Express.js for the back-end, integrated with a MySQL database.
The library is made using books using the Google Books API. Users can search for books, write reviews and give ratings to books, and view reviews written by other users. 
User authentication was developed using JWT tokens and session state using localStorage. Books are added to a user's library when they give a review and rating for a book.

### Landing Page
This is the first page the user sees if they are not already logged in.
The user can login or register from here.
![Landing Page](Images/landingpage.png)

### Login
This is the form the user has to fill out to login.
![Login](Images/login.png)

### Register
This is the form the user has to fill out to register.
![Register](Images/register.png)

### Homepage 
When the user successfully logs in or registers, they will see this page once they enter bookmatcha.
Here they will see the top rated books by bookmatcha users.
![Homepage](Images/homepage.png)

### User's Books (Empty Library)
When the user has not reviewed/rated any books yet this what they will see.
![Empty User's Books](Images/emptyuserbooks.png)

### User's Books (Non-Empty Library)
When the user has reviewed/rated books they can view their books here.
From this table, users can edit or delete their reviews/ratings here.
![Non-empty User's Books](Images/homepagenonemptylibrary.png)

### User Account
The user can change their first name, last name, or password on this page.
![User Account](Images/useraccount.png)

### Search Results
When a user searches for a book, this is how the results will be displayed to them.
The books are queried and shown for them using Google Books API.
![Search Results](Images/searchresults.png)

### Book Details
When a user selects a book, these are the details of the book given. The details are fetched from Google Books This page is also where a user can write their own review and rating and look at reviews and ratings written by other users. If the user has already reviewed the book, they can edit their review and rating here.
![Book Details 1](Images/bookdetails1.png)

![Book Details 2](Images/bookdetails2.png)
