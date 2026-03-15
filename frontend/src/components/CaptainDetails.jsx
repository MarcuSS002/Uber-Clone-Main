import { useContext } from "react";
import { CaptainDataContext } from "../context/CapatainContext";

const CaptainDetails = () => {
  const { captain } = useContext(CaptainDataContext);
  const captainName = captain?.fullname
    ? `${captain.fullname.firstname || ""} ${captain.fullname.lastname || ""}`.trim()
    : "Captain";
  const captainVehicle = captain?.vehicle?.vehicleType || "Standard ride";
  const captainPlate = captain?.vehicle?.plate || "Vehicle pending";

  if (!captain) {
    return (
      <div className="rounded-[28px] border border-neutral-200 bg-white px-6 py-10 text-center shadow-sm">
        <p className="text-sm font-medium text-neutral-500">
          Loading captain info...
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-[30px] border border-neutral-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <img
            className="h-14 w-14 rounded-2xl object-cover ring-2 ring-neutral-100"
            src={
              captain.avatar ||
              "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRdlMd7stpWUCmjpfRjUsQ72xSWikidbgaI1w&s"
            }
            alt={captainName}
          />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-500">
              Captain Profile
            </p>
            <h4 className="mt-1 text-xl font-semibold capitalize text-neutral-900">
              {captainName}
            </h4>
            <p className="mt-1 text-sm text-neutral-500">
              {captainVehicle} • {captainPlate}
            </p>
          </div>
        </div>

        <div className="rounded-2xl bg-neutral-900 px-4 py-3 text-right text-white">
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-300">
            Today
          </p>
          <h4 className="mt-1 text-2xl font-semibold">Rs 295.20</h4>
          <p className="text-xs text-neutral-300">Earnings</p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-neutral-50 px-3 py-4 text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
            <i className="ri-timer-2-line text-lg text-neutral-800"></i>
          </div>
          <h5 className="mt-3 text-lg font-semibold text-neutral-900">10.2</h5>
          <p className="text-xs leading-5 text-neutral-500">Hours online</p>
        </div>

        <div className="rounded-2xl bg-neutral-50 px-3 py-4 text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
            <i className="ri-speed-up-line text-lg text-neutral-800"></i>
          </div>
          <h5 className="mt-3 text-lg font-semibold text-neutral-900">4.8</h5>
          <p className="text-xs leading-5 text-neutral-500">Rating today</p>
        </div>

        <div className="rounded-2xl bg-neutral-50 px-3 py-4 text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
            <i className="ri-booklet-line text-lg text-neutral-800"></i>
          </div>
          <h5 className="mt-3 text-lg font-semibold text-neutral-900">18</h5>
          <p className="text-xs leading-5 text-neutral-500">Completed trips</p>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-neutral-200 bg-gradient-to-r from-yellow-50 to-white px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Status
            </p>
            <p className="mt-1 text-sm font-medium text-neutral-800">
              Online and ready for new ride requests
            </p>
          </div>
          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
            Active
          </span>
        </div>
      </div>
    </div>
  );
};

export default CaptainDetails;
