const form = document.querySelector('.js-search-form');
const searchInput = document.querySelector('.js-search-input');
const searchResults = document.querySelector('.js-search-results');
const suggestionsContainer = document.querySelector('.js-suggestions');
const spinner = document.querySelector('.js-spinner');

// Handle form submission
async function handleSubmit(event) {
    event.preventDefault();

    // Get the input value and trim whitespace
    const searchQuery = searchInput.value.trim();

    // Clear previous results and show spinner
    searchResults.innerHTML = '';
    spinner.classList.remove('hidden');

    try {
        const results = await searchWikipedia(searchQuery);

        if (results.query.searchinfo.totalhits === 0) {
            alert('No results found. Try different keywords');
            return;
        }

        displayResults(results);
    } catch (err) {
        console.log(err);
        alert('Failed to search Wikipedia');
    } finally {
        spinner.classList.add('hidden');
    }
}

// Wikipedia API search
async function searchWikipedia(searchQuery) {
    const endpoint = `https://en.wikipedia.org/w/api.php?action=query&list=search&prop=info&inprop=url&utf8=&format=json&origin=*&srlimit=20&srsearch=${searchQuery}`;
    const response = await fetch(endpoint);
    if (!response.ok) {
        throw Error(response.statusText);
    }
    return response.json();
}

// Display search results
function displayResults(results) {
    results.query.search.forEach((result) => {
        const url = `https://en.wikipedia.org/?curid=${result.pageid}`;

        // Append the search result to the DOM
        searchResults.insertAdjacentHTML(
            'beforeend',
            `<div class="result-item">
                <h3 class="result-title">
                    <a href="${url}" target="_blank" rel="noopener">${result.title}</a>
                </h3>
                <span class="result-snippet">${result.snippet}</span>
            </div>`
        );
    });
}

// Fetch suggestions from Wikipedia
async function fetchSuggestions(query) {
    const endpoint = `https://en.wikipedia.org/w/api.php?action=opensearch&format=json&origin=*&search=${query}`;
    const response = await fetch(endpoint);
    const data = await response.json();
    return data[1]; // Returns array of suggestions
}

// Display suggestions in the input
function displaySuggestions(suggestions) {
    suggestionsContainer.innerHTML = '';
    suggestions.forEach((suggestion) => {
        const suggestionItem = document.createElement('div');
        suggestionItem.textContent = suggestion;
        suggestionItem.classList.add('suggestion-item');
        suggestionItem.addEventListener('click', () => {
            searchInput.value = suggestion;
            suggestionsContainer.innerHTML = '';
            form.dispatchEvent(new Event('submit')); // Trigger form submit
        });
        suggestionsContainer.appendChild(suggestionItem);
    });
}

// Handle input for suggestions
searchInput.addEventListener('input', async function () {
    const query = this.value.trim();
    if (query.length > 2) {
        const suggestions = await fetchSuggestions(query);
        displaySuggestions(suggestions);
    } else {
        suggestionsContainer.innerHTML = '';
    }
});

// Dark mode toggle functionality
const darkModeToggle = document.querySelector('.dark-mode-toggle');
darkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
});

// Add event listener to handle form submit
form.addEventListener('submit', handleSubmit);
