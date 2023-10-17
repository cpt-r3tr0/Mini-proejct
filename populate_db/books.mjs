import fetch from 'node-fetch';

export async function searchBooks(subject) {
  const url = `https://openlibrary.org/subjects/${subject}.json`;


  console.log(url);
  console.log('Fetching books...');
  
  const res = await fetch(url);
  
  try {
    const data = await res.json();
    console.log(`Fetched ${data}`);
    return data.works.slice(0, 10);
  } catch(err) {

    console.log('Error parsing response as JSON', err);
    return [];
  }
}

export async function getBookDetails(book) {
  const url = `https://openlibrary.org/api/books?bibkeys=OLID:${book.olid}&format=json`;
  
  const res = await fetch(url);
  
  try {
    const data = await res.json();
    
    // Extract the necessary information from the data
    const bookDetails = data[`OLID:${book.olid}`];
    console.log(bookDetails);
    
    // Modify the book object to include the additional information
    book.title = bookDetails.title;
    book.author = bookDetails.authors[0].name; // Assuming the first author is the primary author
    book.subject = bookDetails.subjects ? bookDetails.subjects[0] : '';
    book.cover = bookDetails.cover ? bookDetails.cover.large : ''; // You can choose different cover sizes
    book.price = bookDetails.price ? bookDetails.price : 'Price not available';


    console.log(book);

    return book;
  } catch (err) {
    console.log('Error parsing response as JSON', err);
    return null;
  }
}