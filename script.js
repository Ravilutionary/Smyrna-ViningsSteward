// --- Supabase Configuration ---
// Your Supabase project URL
const SUPABASE_URL = 'https://urgurpbydvtydoxtcawr.supabase.co';
// Your Supabase public "anon" key
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyZ3VycGJ5ZHZ0eWRveHRjYXdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0NDQ3NzIsImV4cCI6MjA2NjAyMDc3Mn0.8kKdcbt8vB3GdJ6-ukFQgIxNlCUM31wTF2O-N75nZWQ';

// --- DOM Elements ---
// Get the container where business listings will be displayed
const businessListContainer = document.getElementById('businessList');
// Get the search input element
const searchInput = document.getElementById('searchInput');
// Get the category filter dropdown element
const categoryFilter = document.getElementById('categoryFilter');
// Get the loading indicator element
const loadingIndicator = document.getElementById('loadingIndicator');
// Get the no results message element
const noResultsMessage = document.getElementById('noResultsMessage');

// --- Global Variables ---
// Array to store all fetched businesses
let allBusinesses = [];
// Variable to store the current search term
let currentSearchTerm = '';
// Variable to store the currently selected category
let currentCategory = '';
// Debounce timer for search input
let searchDebounceTimer;

// --- Functions ---

/**
 * Fetches business data from the Supabase 'businesses' table.
 * Displays loading indicator and handles errors.
 */
async function fetchBusinesses() {
    // Show loading indicator and hide no results message
    loadingIndicator.classList.remove('hidden');
    noResultsMessage.classList.add('hidden');
    businessListContainer.innerHTML = ''; // Clear previous listings

    try {
        // Construct the URL for fetching data from the 'businesses' table
        const response = await fetch(`${SUPABASE_URL}/rest/v1/businesses`, {
            method: 'GET', // HTTP GET method
            headers: {
                'Content-Type': 'application/json', // Specify content type
                'apikey': SUPABASE_ANON_KEY, // Pass the Supabase API key
                'Accept': 'application/json' // Request JSON response
            }
        });

        // Check if the response was successful (status code 200-299)
        if (!response.ok) {
            // If not successful, throw an error with the status
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Parse the JSON response into an array of business objects
        const data = await response.json();
        allBusinesses = data; // Store the fetched data globally

        // Populate the category filter dropdown
        populateCategoryFilter(allBusinesses);

        // Render the businesses with current filters (initially all)
        renderBusinesses();

    } catch (error) {
        // Log any errors during fetching
        console.error('Error fetching businesses:', error);
        // Display an error message to the user (optional, could be more user-friendly)
        businessListContainer.innerHTML = '<p class="no-results-message">Failed to load businesses. Please try again later.</p>';
    } finally {
        // Hide the loading indicator after fetch attempt
        loadingIndicator.classList.add('hidden');
    }
}

/**
 * Populates the category filter dropdown with unique categories from the businesses data.
 * @param {Array} businesses - The array of business objects.
 */
function populateCategoryFilter(businesses) {
    // Get unique categories using Set and map
    const categories = [...new Set(businesses.map(b => b.category).filter(Boolean))];
    // Clear existing options, keeping "All Categories"
    categoryFilter.innerHTML = '<option value="">All Categories</option>';

    // Sort categories alphabetically
    categories.sort((a, b) => a.localeCompare(b));

    // Add each unique category as an option to the dropdown
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });

    // Set the selected value back if a category was already chosen
    categoryFilter.value = currentCategory;
}

/**
 * Renders the filtered businesses to the DOM.
 */
function renderBusinesses() {
    // Clear the current business list displayed on the page
    businessListContainer.innerHTML = '';

    // Apply filters based on current search term and category
    const filteredBusinesses = allBusinesses.filter(business => {
        // Search filter: check if business name or description includes the search term (case-insensitive)
        const matchesSearch = currentSearchTerm === '' ||
            business.name.toLowerCase().includes(currentSearchTerm.toLowerCase()) ||
            (business.description && business.description.toLowerCase().includes(currentSearchTerm.toLowerCase()));

        // Category filter: check if business category matches the selected category
        const matchesCategory = currentCategory === '' || business.category === currentCategory;

        // Return true if both search and category filters match
        return matchesSearch && matchesCategory;
    });

    // If no businesses are found after filtering, display a message
    if (filteredBusinesses.length === 0) {
        noResultsMessage.classList.remove('hidden');
        return; // Exit the function
    } else {
        noResultsMessage.classList.add('hidden'); // Hide the message if results are found
    }

    // Iterate over each filtered business and create a card for it
    filteredBusinesses.forEach(business => {
        // Create a new div element for the business card
        const businessCard = document.createElement('div');
        businessCard.classList.add('business-card'); // Add CSS class for styling

        // Populate the card's inner HTML with business details
        // Use optional chaining (?) and nullish coalescing (?? '') for potentially missing data
        businessCard.innerHTML = `
            <h2>${business.name ?? 'N/A'}</h2>
            <p><strong>Description:</strong> ${business.description ?? 'No description provided.'}</p>
            <p><strong>Address:</strong> ${business.address ?? 'N/A'}</p>
            <p><strong>Phone:</strong> ${business.phone ?? 'N/A'}</p>
            ${business.category ? `<p><strong>Category:</strong> ${business.category}</p>` : ''}
        `;
        // Append the newly created business card to the main container
        businessListContainer.appendChild(businessCard);
    });
}

/**
 * Handles search input changes with debouncing to limit function calls.
 * @param {Event} event - The input event object.
 */
function handleSearchInput(event) {
    // Clear any existing debounce timer
    clearTimeout(searchDebounceTimer);
    // Set a new timer to update the search term and re-render after a delay
    searchDebounceTimer = setTimeout(() => {
        currentSearchTerm = event.target.value.trim(); // Get trimmed search value
        renderBusinesses(); // Re-render businesses with the new search term
    }, 300); // 300ms debounce delay
}

/**
 * Handles category filter changes.
 * @param {Event} event - The change event object.
 */
function handleCategoryFilter(event) {
    currentCategory = event.target.value; // Get the selected category value
    renderBusinesses(); // Re-render businesses with the new category
}

// --- Event Listeners ---
// Add an event listener to the search input for 'input' events
searchInput.addEventListener('input', handleSearchInput);

// Add an event listener to the category filter for 'change' events
categoryFilter.addEventListener('change', handleCategoryFilter);

// --- Initial Data Fetch ---
// Fetch businesses when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', fetchBusinesses);

