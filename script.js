const form = document.querySelector('.js-search-form');

async function handleSubmit(event) {
    // prevent page from reloading when form is submitted
    event.preventDefault();

    // get the value of the input field
    const inputValue = document.querySelector('.js-search-input').value;

    // remove whitespace from the input
    const searchQuery = inputValue.trim();

    const searchResults = document.querySelector('.js-search-results');
    // Clear the previous results
    searchResults.innerHTML = '';

    const spinner = document.querySelector('.js-spinner');
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
        alert('Failed to search wikipedia');
    } finally {
        spinner.classList.add('hidden');
    }
    
form.addEventListener('submit', () => {
    suggestionsContainer.innerHTML = '';
});

}

async function searchWikipedia(searchQuery) {
    const endpoint = `https://en.wikipedia.org/w/api.php?action=query&list=search&prop=info&inprop=url&utf8=&format=json&origin=*&srlimit=20&srsearch=${searchQuery}`;
    const response = await fetch(endpoint);
    if (!response.ok) {
        throw Error(response.statusText);
    }
    const json = await response.json();
    return json;
}

function displayResults(results) {
    // Get a reference to the '.js-search-results' element
    const searchResults = document.querySelector('.js-search-results');

    // Iterate over the `search` array. Each nested object in the array can be
    // accessed through the `result` parameter
    results.query.search.forEach((result) => {
        const url = `https://en.wikipedia.org/?curid=${result.pageid}`;

        // Append the search result to the DOM
        searchResults.insertAdjacentHTML(
            'beforeend',
            `<div class="result-item">
                <h3 class="result-title">
                    <a href="${url}" target="_blank" rel="noopener">${result.title}</a>
                </h3>
                <a href="" class="result-link" target="_blank" rel="noopener">${url}</a>
                <span class="result-snippet">${result.snippet}</span><br>
            </div>`
        );
    });
}

form.addEventListener('submit', handleSubmit);


const suggestionsContainer = document.querySelector('.js-suggestions');

async function fetchSuggestions(query) {
    const endpoint = `https://en.wikipedia.org/w/api.php?action=opensearch&format=json&origin=*&search=${query}`;
    const response = await fetch(endpoint);
    const data = await response.json();
    return data[1]; // Returns the array of suggestions
}

document.querySelector('.js-search-input').addEventListener('input', async function () {
    const query = this.value.trim();
    if (query.length > 2) {
        const suggestions = await fetchSuggestions(query);
        displaySuggestions(suggestions);
    } else {
        suggestionsContainer.innerHTML = '';
    }
});

function displaySuggestions(suggestions) {
    suggestionsContainer.innerHTML = '';
    suggestions.forEach((suggestion) => {
        const suggestionItem = document.createElement('div');
        suggestionItem.textContent = suggestion;
        suggestionItem.classList.add('suggestion-item');
        suggestionItem.addEventListener('click', () => {
            document.querySelector('.js-search-input').value = suggestion;
            suggestionsContainer.innerHTML = '';
            form.dispatchEvent(new Event('submit'));
        });
        suggestionsContainer.appendChild(suggestionItem);
    });
}

const darkModeToggle = document.querySelector('.dark-mode-toggle');

darkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
});

