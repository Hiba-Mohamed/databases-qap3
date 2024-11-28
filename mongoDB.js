const express = require("express");
const mongoose = require("mongoose");
const app = express();
const PORT = 3000;
const MONGO_URI = "mongodb://localhost:27017";
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  author: { type: String, required: true, trim: true },
  genre: { type: String, required: true, trim: true },
  year: { type: Number, required: true, trim: true },
});
const Book = mongoose.model("Book", bookSchema, "books");

app.use(express.json());

// Sample books data
const sampleBooks = [
  { title: "1984", author: "George Orwell", genre: "Dystopian", year: 1949 },
  {
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    genre: "Fantasy",
    year: 1937,
  },
  {
    title: "The Fellowship of the Ring",
    author: "J.R.R. Tolkien",
    genre: "Fantasy",
    year: 1954,
  },
];

// Insert sample data
async function insertSampleData() {
  try {
    await Book.insertMany(sampleBooks);
    console.log("Sample books inserted");
  } catch (error) {
    console.error("Error inserting sample data", error);
  }
}
insertSampleData();

// Retrieve the titles of all books.
async function retrieveBooksTitles() {
  try {
    const booksTitles = await Book.find({}, { title: 1, _id: 0 });
    console.log("Books available: ", booksTitles);
  } catch (error) {
    console.log(error);
  }
}
retrieveBooksTitles();

// Find all books written by “J.R.R. Tolkien”.
async function findBookByAuthor(author) {
  try {
    const authorBooks = await Book.find(
      { author: author },
      { title: 1, _id: 0 }
    );
    console.log(`Book by ${author}: `,authorBooks);
  } catch (error) {
    console.log(error);
  }
}
findBookByAuthor('J.R.R. Tolkien');

  // Update the genre of “1984” to "Science Fiction".
  async function updateGenreByBookName(bookName, newGenre) {
    try{
      const updatedGenre = await Book.updateOne({title: bookName}, {$set:{genre: newGenre}})
      console.log(updatedGenre)
    }catch(error){
      console.log(error)
    }
  }
 updateGenreByBookName("1984", "Science Fiction")

//   // Delete the book “The Hobbit”.
//   async function deleteBookByName() {}
// deleteBookByName();
