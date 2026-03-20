import { useEffect, useState, useContext, lazy, Suspense } from "react";
import axios from "axios";
import { apiBaseUrl } from "../utils/api-config";
import "remixicon/fonts/remixicon.css";
import LocationSearchPanel from "../components/LocationSearchPanel";
import VehiclePanel from "../components/VehiclePanel";
import ConfirmRide from "../components/ConfirmRide";
import LookingForDriver from "../components/LookingForDriver";
import WaitingForDriver from "../components/WaitingForDriver";
import { SocketContext } from "../context/SocketContext";
import { UserDataContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";

const LiveTracking = lazy(() => import("../components/LiveTracking"));

const Home = () => {
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [panelOpen, setPanelOpen] = useState(false);
  const [vehiclePanel, setVehiclePanel] = useState(false);
  const [confirmRidePanel, setConfirmRidePanel] = useState(false);
  const [vehicleFound, setVehicleFound] = useState(false);
  const [waitingForDriver, setWaitingForDriver] = useState(false);
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState([]);
  const [activeField, setActiveField] = useState(null);
  const [fare, setFare] = useState({});
  const [vehicleType, setVehicleType] = useState(null);
  const isBottomSheetOpen =
    vehiclePanel || confirmRidePanel || vehicleFound || waitingForDriver;
  // ride moved to global UserDataContext so socket listeners can update it centrally

  const navigate = useNavigate();

  const { socket } = useContext(SocketContext);
  const { user, ride } = useContext(UserDataContext);

  useEffect(() => {
    if (socket && user && user._id) {
      socket.emit("join", { userType: "user", userId: user._id });
    }
  }, [socket, user]);

  useEffect(() => {
    if (!socket) return;

    const handleRideConfirmedLocal = () => {
      setVehicleFound(false);
      setWaitingForDriver(true);
      // ride is set globally by SocketContext; Home just toggles panels
    };

    const handleRideStartedLocal = (r) => {
      console.debug("Socket event: ride-started", r);
      setWaitingForDriver(false);
      navigate("/riding", { state: { ride: r } }); // Navigate carrying ride data
    };
    const handleRideConfirmed = (r) => {
      console.debug("Socket event: ride-confirmed (home)", r);
      handleRideConfirmedLocal(r);
    };
    const handleRideStarted = (r) => {
      console.debug("Socket event: ride-started (home)", r);
      handleRideStartedLocal(r);
    };

    socket.on("ride-confirmed", handleRideConfirmed);
    socket.on("ride-started", handleRideStarted);

    return () => {
      socket.off("ride-confirmed", handleRideConfirmed);
      socket.off("ride-started", handleRideStarted);
    };
  }, [socket, navigate]);

  const handlePickupChange = async (e) => {
    const val = e.target.value;
    setPickup(val);
    if (!val) {
      setPickupSuggestions([]);
      // Close panel if input is empty
      setPanelOpen(false);
      return;
    }
    // Check for minimum length to avoid 400 Bad Request
    if (val.length < 3) return;

    try {
      const resp = await axios.get(`${apiBaseUrl}/maps/get-suggestions`, {
        params: { input: val },
      });
      setPickupSuggestions(resp.data);
      setPanelOpen(true);
    } catch (err) {
      console.error("Failed to fetch pickup suggestions", err);
      setPickupSuggestions([]);
    }
  };

  const handleDestinationChange = async (e) => {
    const val = e.target.value;
    setDestination(val);
    if (!val) {
      setDestinationSuggestions([]);
      // Close panel if input is empty
      setPanelOpen(false);
      return;
    }
    // Check for minimum length to avoid 400 Bad Request
    if (val.length < 3) return;

    try {
      const resp = await axios.get(`${apiBaseUrl}/maps/get-suggestions`, {
        params: { input: val },
      });
      setDestinationSuggestions(resp.data);
      setPanelOpen(true);
    } catch (err) {
      console.error("Failed to fetch destination suggestions", err);
      setDestinationSuggestions([]);
    }
  };

  const submitHandler = (e) => {
    e.preventDefault();
  };

  async function findTrip() {
    setVehiclePanel(true);
    // This sets the panelOpen state to false, triggering the GSAP close and class change.
    setPanelOpen(false);
    try {
      const token = localStorage.getItem("token");
      console.log("Token sent for get-fare:", token);
      if (!token) {
        console.warn("No auth token found when requesting fare");
        navigate("/login");
        return;
      }

      const response = await axios.get(`${apiBaseUrl}/rides/get-fare`, {
        params: { pickup, destination },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setFare(response.data);
    } catch (err) {
      console.error("Error finding trip/fare:", err);
      alert("Error finding trip/fare. Please check locations.");

      setVehiclePanel(false);
      setPanelOpen(true);
      return;
    }
  }

  // ... existing code ...

  async function createRide() {
    try {
      const token = localStorage.getItem("token");
      console.log("Token sent for createRide:", token);
      if (!token) {
        console.warn("No auth token found when creating ride");
        alert("You must be logged in to create a ride");
        navigate("/login");
        return;
      }

      await axios.post(
        `${apiBaseUrl}/rides/create`,
        {
          pickup,
          destination,
          vehicleType,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      // No need to do anything here on success, as the server should emit a
      // socket event that your useEffect listener handles.
    } catch (err) {
      console.error("Error creating ride:", err);

      // Handle the error state in the UI
      // 1. Alert the user
      alert("Failed to create ride. Please try again.");

      // 2. Optionally, reset state to an earlier step
      // (e.g., close LookingForDriver and show ConfirmRide/VehiclePanel)
      setVehicleFound(false);
      setWaitingForDriver(false);
      setConfirmRidePanel(true); // Go back to the confirm ride panel

      // NOTE: If the server is sending an actual 500 error,
      // the root fix must still be on the server-side!
      // This client-side change prevents the user interface from being stuck.
    }
  }

  return (
    <div className="flex flex-col h-screen w-screen relative overflow-hidden">
      {/* Logo/Header (Fixed at top for visibility) */}
      <img
        className="w-16 absolute right-5 top-5 z-20"
        src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png"
        alt=""
      />

      {/* 1. MAP CONTAINER (TOP 70% of screen height) */}
      <div className="h-[70%] w-full relative z-10">
        <Suspense fallback={<div className="h-full w-full bg-gray-100" />}>
          <LiveTracking pickup={pickup} destination={destination} />
        </Suspense>
      </div>

      {/* 2. INPUT/SEARCH PANEL CONTAINER */}
      {!isBottomSheetOpen && (
        <div
          className={`${
            panelOpen
              ? "fixed inset-0 z-40 flex flex-col bg-white shadow-lg"
              : "relative z-20 h-[30%] w-full bg-white"
          }`}
        >
          <div className="flex-shrink-0 p-6">
            <h4 className="text-2xl font-semibold">Find a trip</h4>
            <form
              className="relative py-3"
              onSubmit={(e) => {
                submitHandler(e);
              }}
            >
              <div className="absolute left-5 top-1/2 h-16 w-1 -translate-y-1/2 rounded-full bg-gray-700"></div>
              <input
                onFocus={() => {
                  setPanelOpen(true);
                  setActiveField("pickup");
                }}
                value={pickup}
                onChange={handlePickupChange}
                className="w-full rounded-lg bg-[#eee] px-12 py-2 text-lg"
                type="text"
                placeholder="Add a pick-up location"
              />
              <input
                onFocus={() => {
                  setPanelOpen(true);
                  setActiveField("destination");
                }}
                value={destination}
                onChange={handleDestinationChange}
                className="mt-3 w-full rounded-lg bg-[#eee] px-12 py-2 text-lg"
                type="text"
                placeholder="Enter your destination"
              />
            </form>
            <button
              onClick={findTrip}
              className="mt-3 w-full rounded-lg bg-black px-4 py-2 text-white"
            >
              Find Trip
            </button>
          </div>

          {panelOpen && (
            <div className="flex-grow overflow-y-auto p-6 pt-0">
              <LocationSearchPanel
                suggestions={
                  activeField === "pickup"
                    ? pickupSuggestions
                    : destinationSuggestions
                }
                setPanelOpen={setPanelOpen}
                setPickup={setPickup}
                setDestination={setDestination}
                activeField={activeField}
              />
            </div>
          )}
        </div>
      )}

      {vehiclePanel && (
        <div className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl bg-white px-3 py-10 pt-12 shadow-2xl">
          <VehiclePanel
            selectVehicle={setVehicleType}
            fare={fare}
            setConfirmRidePanel={setConfirmRidePanel}
            setVehiclePanel={setVehiclePanel}
          />
        </div>
      )}

      {confirmRidePanel && (
        <div className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl bg-white px-3 pb-3 pt-3 shadow-2xl">
          <ConfirmRide
            createRide={createRide}
            pickup={pickup}
            destination={destination}
            fare={fare}
            vehicleType={vehicleType}
            setConfirmRidePanel={setConfirmRidePanel}
            setVehicleFound={setVehicleFound}
          />
        </div>
      )}

      {vehicleFound && (
        <div className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl bg-white px-3 py-6 pt-3 shadow-2xl">
          <LookingForDriver
            createRide={createRide}
            pickup={pickup}
            destination={destination}
            fare={fare}
            vehicleType={vehicleType}
            setVehicleFound={setVehicleFound}
          />
        </div>
      )}

      {waitingForDriver && (
        <div className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl bg-white px-3 py-6 pt-12 shadow-2xl">
          <WaitingForDriver
            ride={ride}
            setVehicleFound={setVehicleFound}
            setWaitingForDriver={setWaitingForDriver}
            waitingForDriver={waitingForDriver}
          />
        </div>
      )}
    </div>
  );
};

export default Home;
