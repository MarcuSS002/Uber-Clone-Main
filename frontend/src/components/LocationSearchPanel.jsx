/* eslint-disable react/prop-types */
const LocationSearchPanel = ({ suggestions = [], setPanelOpen, setPickup, setDestination, activeField }) => {

    const handleSuggestionClick = (suggestion) => {
        // suggestion is expected to be a PlacePrediction-like object with a description
        const value = suggestion.description || suggestion
        if (activeField === 'pickup') {
            setPickup(value)
        } else if (activeField === 'destination') {
            setDestination(value)
        }
        setPanelOpen(false)
    }

    return (
        <div>
            {/* Display fetched suggestions */}
            {
                suggestions.map((elem, idx) => (
                    <div key={idx} onClick={() => handleSuggestionClick(elem)} className='flex gap-4 border-2 p-3 border-gray-50 active:border-black rounded-xl items-center my-2 justify-start'>
                        <h2 className='bg-[#eee] h-8 flex items-center justify-center w-12 rounded-full'><i className="ri-map-pin-fill"></i></h2>
                        <h4 className='font-medium'>{elem.description || elem}</h4>
                    </div>
                ))
            }
        </div>
    )
}

export default LocationSearchPanel