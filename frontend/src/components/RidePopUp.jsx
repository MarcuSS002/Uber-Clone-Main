import PropTypes from "prop-types";

const RidePopUp = (props) => {
  const riderName = props.ride?.user?.fullname
    ? `${props.ride.user.fullname.firstname} ${props.ride.user.fullname.lastname}`
    : "Passenger";

  return (
    <div className="rounded-[28px] bg-white text-neutral-900">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-neutral-500">
            Incoming Request
          </p>
          <h3 className="mt-2 text-2xl font-semibold leading-tight">
            New ride available
          </h3>
          <p className="mt-1 text-sm text-neutral-500">
            Review trip details before accepting.
          </p>
        </div>
        <div className="rounded-full bg-neutral-100 px-3 py-1 text-sm font-semibold text-neutral-700">
          2.2 km
        </div>
      </div>

      <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <img
            className="h-14 w-14 rounded-2xl object-cover ring-2 ring-white"
            src="https://i.pinimg.com/236x/af/26/28/af26280b0ca305be47df0b799ed1b12b.jpg"
            alt={riderName}
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm text-neutral-500">Rider</p>
            <h2 className="truncate text-lg font-semibold">{riderName}</h2>
          </div>
          <div className="rounded-2xl bg-yellow-400 px-3 py-2 text-right shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-neutral-700">
              Fare
            </p>
            <p className="text-lg font-bold text-neutral-900">
              ₹{props.ride?.fare ?? "--"}
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <div className="flex gap-4">
            <div className="flex w-10 shrink-0 flex-col items-center pt-1">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white">
                <i className="ri-map-pin-user-fill text-sm"></i>
              </span>
              <span className="mt-2 h-10 w-px bg-neutral-300"></span>
            </div>
            <div className="min-w-0 border-b border-neutral-200 pb-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Pickup
              </p>
              <p className="mt-1 text-sm leading-6 text-neutral-800">
                {props.ride?.pickup || "Pickup location unavailable"}
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex w-10 shrink-0 items-start justify-center pt-1">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-white">
                <i className="ri-map-pin-2-fill text-sm"></i>
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Destination
              </p>
              <p className="mt-1 text-sm leading-6 text-neutral-800">
                {props.ride?.destination || "Destination unavailable"}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-2xl bg-white px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Payment
              </p>
              <p className="mt-1 font-medium text-neutral-800">Cash</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Trip value
              </p>
              <p className="mt-1 text-lg font-semibold text-neutral-900">
                ₹{props.ride?.fare ?? "--"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <button
          onClick={() => {
            props.setRidePopupPanel(false);
          }}
          className="rounded-2xl border border-neutral-300 bg-neutral-100 px-5 py-3 font-semibold text-neutral-700 transition hover:bg-neutral-200"
        >
          Ignore
        </button>

        <button
          onClick={() => {
            props.confirmRide();
          }}
          disabled={props.isConfirming}
          className={`rounded-2xl bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-700 ${props.isConfirming ? "cursor-not-allowed opacity-50" : ""}`}
        >
          {props.isConfirming ? "Accepting..." : "Accept Ride"}
        </button>
      </div>

      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-neutral-500">
        <i className="ri-shield-check-line"></i>
        <span>Only accept when you're ready to start this trip.</span>
      </div>
    </div>
  );
};

export default RidePopUp;

RidePopUp.propTypes = {
  ride: PropTypes.object,
  setRidePopupPanel: PropTypes.func.isRequired,
  setConfirmRidePopupPanel: PropTypes.func,
  confirmRide: PropTypes.func.isRequired,
  isConfirming: PropTypes.bool,
};
