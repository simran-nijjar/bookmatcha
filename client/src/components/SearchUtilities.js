// This file contains methods used to search for books

// Each page will show 20 results
const maxResults = 20;

export const handleQueryChange = (event, setQuery) => {
    setQuery(event.target.value);
  };

// This method fetches the results from Google Books that matches the user's query
export const fetchResults = async (query, startIndex = 0) => {
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&startIndex=${startIndex}&key=${process.env.REACT_APP_API_KEY}&maxResults=${maxResults}`;
  try {
    const response = await fetch(url);
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error fetching from Google Books API', error);
    return null;
  }
};

// This method is called when the user clicks "Search"
export const handleSearch = async (event, query, setResults, setTotalPages, setCurrentPage) => {
    event.preventDefault();
    setCurrentPage(1);
    const result = await fetchResults(query);
    if (result) {
      setResults(result.items || []);
      setTotalPages(Math.ceil(result.totalItems / maxResults));
    }
  };

// This method handles updating the page and the start index of the next page
export const handleNextPage = async (currentPage, query, setResults, setCurrentPage) => {
    const nextPage = currentPage + 1;
    const startIndex = (nextPage - 1) * maxResults;
    const result = await fetchResults(query, startIndex);
    if (result) {
      setResults(result.items || []);
      setCurrentPage(nextPage);
    }
  };

  // This method handles updating the page and the start index of the previous page
  export const handlePrevPage = async (currentPage, query, setResults, setCurrentPage) => {
    if (currentPage > 1) {
      const prevPage = currentPage - 1;
      const startIndex = (prevPage - 1) * maxResults;
      const result = await fetchResults(query, startIndex);
      if (result) {
        setResults(result.items || []);
        setCurrentPage(prevPage);
      }
    }
  };