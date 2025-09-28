/* eslint-disable react/prop-types */

// Use an interface/type for clarity if using TypeScript, otherwise this JSDoc provides clear documentation
/**
 * @typedef {Object} LocationSuggestion
 * @property {string} description The suggested location name/address.
 * @property {string} [place_id] Optional ID for fetching further details (e.g., coordinates).
 */

/**
 * Renders a list of location suggestions and handles the selection of a pickup or destination.
 *
 * @param {Object} props
 * @param {LocationSuggestion[]} props.suggestions List of location objects.
 * @param {function(boolean): void} props.setPanelOpen Function to close the panel.
 * @param {function(string): void} props.setPickup Function to set the pickup location value.
 * @param {function(string): void} props.setDestination Function to set the destination location value.
 * @param {'pickup' | 'destination'} props.activeField The currently active input field.
 */
const LocationSearchPanel = ({ 
    suggestions = [], 
    setPanelOpen, 
    setPickup, 
    setDestination, 
    activeField 
}) => {

    const handleSuggestionClick = (suggestion) => {
        // Use optional chaining for safer access to description
        const value = suggestion.description ?? suggestion; 
        
        // 1. Set the correct location field
        if (activeField === 'pickup') {
            setPickup(value);
        } else if (activeField === 'destination') {
            setDestination(value);
        }
        
        // 2. Close the panel 
        // We use 'false' because we want to hide the panel after selection.
        setPanelOpen(false); 
    };

    if (suggestions.length === 0) {
        // Optional: Show a message when no suggestions are available
        return (
             <div className="p-4 text-gray-500">
                Start typing to see location suggestions...
            </div>
        );
    }

    return (
        <div className="location-search-panel p-2">
            {suggestions.map((suggestion, index) => (
                // BEST PRACTICE: Use a stable unique ID (like place_id) as the key
                // If a unique ID is not available, use index as a last resort
                <div 
                    key={suggestion.place_id || index} // Improved key handling
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="suggestion-item 
                               flex gap-4 border-b p-3 
                               border-gray-200 
                               hover:bg-gray-50 cursor-pointer 
                               rounded-md items-center 
                               transition-colors duration-150"
                    role="button" // Improve accessibility
                    aria-label={`Select location: ${suggestion.description || suggestion}`}
                >
                    {/* Icon component - uses 'ri-map-pin-fill' from Remix Icon library */}
                    <div className="icon-container 
                                    bg-gray-100 h-8 w-8 
                                    flex items-center 
                                    justify-center 
                                    rounded-full 
                                    text-gray-600">
                        <i className="ri-map-pin-fill"></i>
                    </div>
                    
                    <h4 className="location-text font-medium text-gray-800">
                        {/* Use optional chaining again for safety */}
                        {suggestion.description ?? suggestion}
                    </h4>
                </div>
            ))}
        </div>
    );
};

export default LocationSearchPanel;