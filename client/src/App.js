import axios from "axios";
import { useState } from "react";

function App() {
  const [testMessage, setTestMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const testServerConnection = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get("http://localhost:5000/test");
      setTestMessage(response.data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary-dark text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">HabitVizz</h1>

        <div className="max-w-md mx-auto bg-primary p-6 rounded-lg shadow-lg">
          <button
            onClick={testServerConnection}
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? "Testing..." : "Test Server Connection"}
          </button>

          {testMessage && (
            <div className="mt-4 p-4 bg-green-800 rounded-md">
              {testMessage}
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-800 rounded-md">Error: {error}</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
