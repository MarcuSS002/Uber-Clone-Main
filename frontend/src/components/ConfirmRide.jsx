import PropTypes from 'prop-types';

const ConfirmRide = (props) => {
    // 1. Define a mapping of vehicle types to image URLs
    const vehicleImages = {
        // You'll need to replace these with your actual image URLs/paths
        'car': "https://swyft.pl/wp-content/uploads/2023/05/how-many-people-can-a-uberx-take.jpg", // The original image for 'car' or similar
        'auto': "https://cn-geo1.uber.com/image-proc/crop/resizecrop/udam/format=auto/width=1152/height=768/srcb64=aHR0cHM6Ly90Yi1zdGF0aWMudWJlci5jb20vcHJvZC91ZGFtLWFzc2V0cy8xZGRiOGM1Ni0wMjA0LTRjZTQtODFjZS01NmExMWEwN2ZlOTgucG5n", // Example URL for 'auto'
        'bike': "https://d1a3f4spazzrp4.cloudfront.net/car-types/haloProductImages/v1.1/Uber_Moto_India1.png" // Example URL for 'bike'
        // Add other vehicle types as needed (e.g., 'luxury', 'minivan')
    };

    // 2. Get the image URL for the current vehicleType, defaulting to 'car' or a placeholder if not found
    const currentVehicleImage = vehicleImages[props.vehicleType] || vehicleImages['car']; // Fallback to 'car' image if type isn't mapped

    return (
        <div>
            <h5 className='p-1 text-center w-[93%] absolute top-0' onClick={() => {
                props.setConfirmRidePanel(false)
            }}><i className="text-3xl text-gray-200 ri-arrow-down-wide-line"></i></h5>
            <h3 className='text-2xl font-semibold mb-5'>Confirm your Ride</h3>

            <div className='flex gap-2 justify-between flex-col items-center'>
                {/* 3. Use the dynamic image source */}
                <img className='h-20' src={currentVehicleImage} alt={`Image of a ${props.vehicleImages}`} />
                
                <div className='w-full mt-5'>
                    <div className='flex items-center gap-5 p-3 border-b-2'>
                        <i className="ri-map-pin-user-fill"></i>
                        <div>
                            <h3 className='text-lg font-medium'>{props.pickup}</h3>
                            <p className='text-sm -mt-1 text-gray-600'>{props.pickup}</p>
                        </div>
                    </div>
                    <div className='flex items-center gap-5 p-3 border-b-2'>
                        <i className="text-lg ri-map-pin-2-fill"></i>
                        <div>
                            <h3 className='text-lg font-medium'>{props.destination}</h3>
                            <p className='text-sm -mt-1 text-gray-600'>{props.destination}</p>
                        </div>
                    </div>
                    <div className='flex items-center gap-5 p-3'>
                        <i className="ri-currency-line"></i>
                        <div>
                            <h3 className='text-lg font-medium'>₹{props.fare[ props.vehicleType ]}</h3>
                            <p className='text-sm -mt-1 text-gray-600'>Cash Cash</p>
                        </div>
                    </div>
                </div>
                <button onClick={() => {
                    props.setVehicleFound(true)
                    props.setConfirmRidePanel(false)
                    props.createRide()

                }} className='w-full mt-5 bg-green-600 text-white font-semibold p-2 rounded-lg'>Confirm</button>
            </div>
        </div>
    )
}

ConfirmRide.propTypes = {
    setConfirmRidePanel: PropTypes.func.isRequired,
    pickup: PropTypes.string.isRequired,
    destination: PropTypes.string.isRequired,
    fare: PropTypes.object.isRequired,
    vehicleType: PropTypes.string.isRequired,
    setVehicleFound: PropTypes.func.isRequired,
    createRide: PropTypes.func.isRequired,
};

export default ConfirmRide;