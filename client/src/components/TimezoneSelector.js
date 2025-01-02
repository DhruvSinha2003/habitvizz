import React, { useState } from "react";
import { useTimezone } from "../context/TimezoneContext";

const TimezoneSelector = ({ onClose }) => {
  const { timezone, updateTimezone } = useTimezone();
  const [search, setSearch] = useState("");

  // Get all IANA timezone names
  const timezones = Intl.supportedValuesOf("timeZone");

  const filteredTimezones = timezones.filter((tz) =>
    tz.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (tz) => {
    updateTimezone(tz);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Select Timezone</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <input
          type="text"
          placeholder="Search timezones..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        />

        <div className="max-h-96 overflow-y-auto">
          {filteredTimezones.map((tz) => (
            <button
              key={tz}
              onClick={() => handleSelect(tz)}
              className={`w-full text-left p-2 hover:bg-gray-100 rounded ${
                timezone === tz ? "bg-blue-50 text-blue-600" : ""
              }`}
            >
              {tz}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TimezoneSelector;
