


import React, { useState, useEffect } from 'react';
import { Droplets, Bell, CircleCheckBig, Wifi, RefreshCw, History, Zap } from 'lucide-react';
  function App() {
  const [slaveData, setSlaveData] = useState([]);
  const [historyLogs, setHistoryLogs] = useState([]);
  const [lastUpdated, setLastUpdated] = useState('Connecting...');
  const [selectedTank, setSelectedTank] = useState(null); // null means show main dashboard
  // Define your backend URL (change when deploying to production)
  const API_URL = 'https://water-level-backend-pyr6.onrender.com/api/water-levels';

  // Function to fetch telemetry and history from backend
  const fetchData = async () => {
    try {
      // 1. Fetch live tank statuses
      const telemetryRes = await fetch(`${API_URL}/api/telemetry`);
      const telemetryJson = await telemetryRes.json();
      if (telemetryJson.success) {
        setSlaveData(telemetryJson.data);
      }

      // 2. Fetch event history logs
      const logsRes = await fetch(`${API_URL}/api/logs`);
      const logsJson = await logsRes.json();
      if (logsJson.success) {
        // Map database fields to match your UI structure
        const formattedLogs = logsJson.logs.map((log, idx) => ({
          id: log._id,
          slaveId: log.slaveId,
          status: log.status,
          timestamp: new Date(log.timestamp).toLocaleString()
        }));
        setHistoryLogs(formattedLogs);
      }

      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      console.error("Failed to fetch data from backend:", err);
      setLastUpdated('Sync Failed (Check Backend)');
    }
  };

  // Poll the backend API every 5 seconds automatically
  useEffect(() => {
    fetchData('https://water-level-backend-pyr6.onrender.com/api/water-levels'); // Fetch immediately on load
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);


  // --- Component: Status Card ---
const SlaveStatusCard = ({ data, onClick }) => {
  const isCritical = data.isCritical;
  
  const getLevelColor = (level) => {
    if (level > 90) return 'bg-red-500';
    if (level > 75) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <div 
      onClick={onClick}
      className={`bg-white p-6 rounded-3xl shadow-sm border cursor-pointer transition-all duration-300 hover:shadow-md hover:border-emerald-300 ${isCritical ? 'border-red-200 shadow-red-50/50' : 'border-stone-100'}`}
    >
      {/* Card content remains the same */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-2xl ${isCritical ? 'bg-red-50' : 'bg-emerald-50'}`}>
            <Droplets className={`w-8 h-8 ${isCritical ? 'text-red-600' : 'text-emerald-600'}`} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-stone-950">{data.id}</h3>
            <p className={`text-sm font-medium flex items-center gap-1.5 ${isCritical ? 'text-red-600' : 'text-emerald-600'}`}>
              <Zap className="w-3.5 h-3.5" />
              {isCritical ? 'CRITICAL ALERT' : 'SYSTEM NORMAL'}
            </p>
          </div>
        </div>
        {/* Status Badge */}
        <div className={`p-3 rounded-full text-sm font-semibold flex items-center gap-1.5 ${isCritical ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
          {isCritical ? <Bell className="w-5 h-5 animate-pulse" /> : <CircleCheckBig className="w-5 h-5" />}
          {data.status}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <div className="text-sm text-stone-600">Current Level</div>
          <div className={`text-5xl font-extrabold tracking-tight ${isCritical ? 'text-red-600' : 'text-stone-950'}`}>
            {data.level}<span className="text-3xl text-stone-400 font-medium">%</span>
          </div>
        </div>
        <div className="w-full h-4 bg-stone-100 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ${getLevelColor(data.level)} ${isCritical ? 'animate-pulse' : ''}`} 
            style={{ width: `${data.level}%` }}
          ></div>
        </div>
        <div className="flex items-center justify-between text-xs text-stone-400 pt-1">
            <span>Click to view history logs</span>
            <span className="font-semibold text-emerald-600">View Details &rarr;</span>
        </div>
      </div>
    </div>
  );
};

 


return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans">
      {/* Header */}
      <header className="w-full bg-stone-50 sticky top-0 z-10 border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600 text-white p-3 rounded-2xl">
              <Droplets className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-stone-950 tracking-tight">Water Tank IoT Center</h1>
              <p className="text-sm text-stone-500">Real-time, multi-tank monitoring platform</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 text-sm bg-emerald-50 text-emerald-700 px-5 py-3 rounded-full font-medium border border-emerald-100">
              <Wifi className="w-5 h-5 text-emerald-600" />
              Live Data Sync Active (Updated: {lastUpdated})
            </div>
          </div>
        </div>
      </header>

      {/* Conditional View: Specific Tank Detail OR Main Dashboard */}
      {selectedTank ? (
        <main className="max-w-7xl mx-auto px-6 py-10">
          <button 
            onClick={() => setSelectedTank(null)}
            className="mb-6 text-sm font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-5 py-2.5 rounded-xl transition-colors flex items-center gap-2"
          >
            &larr; Back to All Tanks Dashboard
          </button>
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-100">
            <h2 className="text-2xl font-bold text-stone-950 mb-2">Event History for {selectedTank}</h2>
            <p className="text-sm text-stone-500 mb-6">Showing recorded status changes and telemetry logs.</p>
            
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-stone-200 text-xs uppercase tracking-wider text-stone-500">
                  <th className="py-4 px-5">Event ID</th>
                  <th className="py-4 px-5">Status Change</th>
                  <th className="py-4 px-5 text-right">Date & Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-sm">
                {historyLogs
                  .filter(log => log.slaveId === selectedTank)
                  .map((log) => (
                    <tr key={log.id}>
                      <td className="py-5 px-5 font-mono text-stone-500">{log.id}</td>
                      <td className="py-5 px-5">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${log.status === 'FULL' || log.status === 'CRITICAL' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="py-5 px-5 text-right text-stone-500 font-medium">{log.timestamp}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </main>
      ) : (
        <main className="max-w-7xl mx-auto px-6 py-10">
          {/* Slave Grid Section with Click Handlers */}
          <section className="mb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {slaveData.map(slave => (
                <SlaveStatusCard key={slave.id} data={slave} onClick={() => setSelectedTank(slave.id)} />
              ))}
            </div>
          </section>

          {/* History Logs Section */}
          <section>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-100">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-stone-950 flex items-center gap-3">
                  <History className="w-7 h-7 text-emerald-600" />
                  System Event History Log
                </h2>
                <button
                  onClick={fetchData}
                  className="flex items-center gap-2.5 text-sm bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-xl transition-colors font-semibold"
                >
                  <RefreshCw className="w-4 h-4" />
                  Fetch Latest Logs
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-stone-200 text-xs uppercase tracking-wider text-stone-500">
                      <th className="py-4 px-5">Event ID</th>
                      <th className="py-4 px-5">Device / Slave ID</th>
                      <th className="py-4 px-5">Status Change</th>
                      <th className="py-4 px-5 text-right">Date & Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-sm">
                    {historyLogs.map((log, index) => (
                      <tr key={log.id} className={index % 2 === 1 ? 'bg-stone-50' : ''}>
                        <td className="py-5 px-5 font-mono text-stone-500">{log.id}</td>
                        <td className="py-5 px-5 font-semibold text-emerald-700">{log.slaveId}</td>
                        <td className="py-5 px-5">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            log.status === 'FULL' || log.status === 'CRITICAL' 
                              ? 'bg-red-100 text-red-700' 
                              : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="py-5 px-5 text-right text-stone-500 font-medium">{log.timestamp}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* View More Button */}
              <div className="mt-10 text-center">
                <button className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 border border-emerald-200 hover:border-emerald-300 px-6 py-3 rounded-xl transition-colors">
                    Load More Event History (Pages 2-5)
                </button>
              </div>
            </div>
          </section>
        </main>
      )}
      
      {/* Footer */}
      <footer className="border-t border-stone-100 mt-16 py-8 px-6 bg-stone-100/50 text-center text-sm text-stone-500">
          Cloud Monitoring System v3.1 | &copy; 2026 Industrial IOT Solutions | <a href="#" className="text-emerald-700 font-medium">Technical Support</a>
      </footer>
    </div>
  );
}

export default App;