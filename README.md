# bookmatcha

bookmatcha is a library application created using React for the front-end and Node.js and Express.js for the back-end, integrated with a MySQL database.
The library is made using books using the Google Books API. Users can search for books, write, edit, and delete reviews and give ratings to books, and view reviews written by other users. Users can get book recommendations based on what they have reviewed/rated.
User authentication was developed using JWT tokens and session state using localStorage. Books are added to a user's library when they give a review and rating for a book.

### Landing Page
This is the first page the user sees if they are not already logged in.
The user can login or register from here.
![Landing Page](images/landingpage.png)

### Login
This is the form the user has to fill out to login.
![Login](images/login.png)

### Register
This is the form the user has to fill out to register.
![Register](images/register.png)

### Homepage 
When the user successfully logs in or registers, they will see this page once they enter bookmatcha.
Here they will see the top rated books by bookmatcha users.
![Homepage](images/homepage.png)

### User's Books 
### Non-empty
When the user has reviewed/rated books they can view their books here.
From this table, users can edit or delete their reviews/ratings here.
![Non-empty User's Books](images/nonemptyuserbooks.png)
### Empty
![Empty User's Books](images/emptyuserbooks.png)

### Book Recommendations
### Non-empty 
If the user has reviewed/rated at least one book, then they can view books that are recommended to them.
Books are recommended based on books the user has given a rating of greater than or equal to three.
![Empty Book Recommendations](images/nonemptybookrecommendations.png)
### Empty
![Non-empty Book Recommendations](images/emptybookrecommendations.png)

### User Account
The user can change their first name, last name, or password on this page.
![User Account](images/useraccount.png)

### Search Results
When a user searches for a book, this is how the results will be displayed to them.
The books are queried and shown for them using Google Books API.
![Search Results](images/searchresults.png)

### Book Details
When a user selects a book, these are the details of the book given. The details are fetched from Google Books This page is also where a user can write their own review and rating and look at reviews and ratings written by other users. If the user has already reviewed the book, they can edit their review and rating here.
![Book Details 1](images/bookdetails1.png)

![Book Details 2](images/bookdetails2.png)
