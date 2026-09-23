

import React, { useState, useEffect } from 'react';
import { Droplets, Bell, CircleCheckBig, Wifi, RefreshCw, History, Zap, UploadCloud, Home, LayoutDashboard, AlertTriangle } from 'lucide-react';

export default function App() {
  // Navigation & View State
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Dashboard & Telemetry State
  const [slaveData, setSlaveData] = useState([]);
  const [historyLogs, setHistoryLogs] = useState([]);
  const [lastUpdated, setLastUpdated] = useState('Connecting...');
  const [selectedTank, setSelectedTank] = useState(null);

  // OTA Updation State
  const [deviceType, setDeviceType] = useState('water-master');
  const [firmwareFile, setFirmwareFile] = useState(null);
  const [versionStr, setVersionStr] = useState('1.0.1');
  const [uploadStatus, setUploadStatus] = useState('');

  const API_URL = 'https://water-level-backend-pyr6.onrender.com';

  // Fetch telemetry and history from backend
  const fetchData = async () => {
    try {
      const telemetryRes = await fetch(`${API_URL}/api/telemetry`);
      const telemetryJson = await telemetryRes.json();
      if (telemetryJson.success) {
        setSlaveData(telemetryJson.data);
      }

      const logsRes = await fetch(`${API_URL}/api/logs`);
      const logsJson = await logsRes.json();
      if (logsJson.success) {
        const formattedLogs = logsJson.logs.map((log) => ({
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

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  // Handle OTA Firmware Upload
  const handleOtaUpload = async (e) => {
    e.preventDefault();
    if (!firmwareFile) return alert('Please select a .bin file first!');

    const formData = new FormData();
    formData.append('firmware', firmwareFile);
    formData.append('version', versionStr);
    formData.append('deviceType', deviceType);

    setUploadStatus('Uploading firmware...');
    try {
      const response = await fetch(`${API_URL}/api/firmware/upload`, {
        method: 'POST',
        headers: { 
          'x-api-key': 'WTR_KEY_99a8fbc763e21aa07' 
        },
        body: formData,
      });
      const data = await response.json();
      if (data.success) {
        setUploadStatus(`Success! Version ${data.version} uploaded for [${deviceType}]. ESP32 will update on next check.`);
      } else {
        setUploadStatus('Upload failed.');
      }
    } catch (err) {
      setUploadStatus('Error connecting to server.');
    }
  };

  const getLevelColor = (level) => {
    if (level > 90) return 'bg-red-500';
    if (level > 75) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="flex h-screen bg-stone-50 font-sans text-stone-900 overflow-hidden">
      
      {/* Sidebar Navigation */}
      <div className="w-64 bg-slate-900 text-white flex flex-col p-4 shrink-0 shadow-lg">
        <div className="flex items-center gap-3 mb-8 px-2 pt-2">
          <div className="bg-emerald-600 text-white p-2.5 rounded-xl">
            <Droplets className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight">Water Monitor</h1>
            <p className="text-xs text-slate-400">IoT Control Panel</p>
          </div>
        </div>

        <nav className="space-y-1.5 flex-1">
          <button 
            onClick={() => setActiveTab('home')} 
            className={`w-full flex items-center gap-3 p-3 text-left rounded-xl font-medium transition-colors ${activeTab === 'home' ? 'bg-blue-600 text-white shadow' : 'text-slate-300 hover:bg-slate-800'}`}
          >
            <Home className="w-5 h-5" /> Home
          </button>
          
          <button 
            onClick={() => { setActiveTab('dashboard'); setSelectedTank(null); }} 
            className={`w-full flex items-center gap-3 p-3 text-left rounded-xl font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow' : 'text-slate-300 hover:bg-slate-800'}`}
          >
            <LayoutDashboard className="w-5 h-5" /> Dashboard
          </button>

          <button 
            onClick={() => setActiveTab('alerts')} 
            className={`w-full flex items-center gap-3 p-3 text-left rounded-xl font-medium transition-colors ${activeTab === 'alerts' ? 'bg-blue-600 text-white shadow' : 'text-slate-300 hover:bg-slate-800'}`}
          >
            <AlertTriangle className="w-5 h-5" /> Alert Options
          </button>

          <button 
            onClick={() => setActiveTab('history')} 
            className={`w-full flex items-center gap-3 p-3 text-left rounded-xl font-medium transition-colors ${activeTab === 'history' ? 'bg-blue-600 text-white shadow' : 'text-slate-300 hover:bg-slate-800'}`}
          >
            <History className="w-5 h-5" /> Water Log History
          </button>

          <button 
            onClick={() => setActiveTab('ota')} 
            className={`w-full flex items-center gap-3 p-3 text-left rounded-xl font-medium transition-colors ${activeTab === 'ota' ? 'bg-blue-600 text-white shadow' : 'text-slate-300 hover:bg-slate-800'}`}
          >
            <UploadCloud className="w-5 h-5" /> OTA Updation
          </button>
        </nav>

        <div className="text-xs text-slate-500 pt-4 border-t border-slate-800 text-center">
          v3.1 | Industrial IoT
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
        
        {/* Top Header */}
        <header className="bg-white border-b border-stone-200 px-8 py-4 sticky top-0 z-10 flex items-center justify-between shadow-sm">
          <h2 className="text-xl font-extrabold capitalize text-stone-900">
            {activeTab === 'dashboard' && (selectedTank ? `Tank Details: ${selectedTank}` : 'Live Tank Monitoring')}
            {activeTab === 'home' && 'Welcome Home'}
            {activeTab === 'alerts' && 'System Alert Configurations'}
            {activeTab === 'history' && 'Complete System Event History'}
            {activeTab === 'ota' && 'Over-The-Air Firmware Updates'}
          </h2>

          <div className="flex items-center gap-3 text-sm bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full font-medium border border-emerald-100">
            <Wifi className="w-4 h-4 text-emerald-600 animate-pulse" />
            Live Sync: {lastUpdated}
          </div>
        </header>

        {/* Tab Content Display */}
        <main className="p-8 flex-1">
          
          {/* DASHBOARD TAB */}
          {activeTab === 'dashboard' && (
            selectedTank ? (
              <div>
                <button 
                  onClick={() => setSelectedTank(null)}
                  className="mb-6 text-sm font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-5 py-2.5 rounded-xl transition-colors flex items-center gap-2 w-fit"
                >
                  &larr; Back to All Tanks Dashboard
                </button>
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-100">
                  <h3 className="text-2xl font-bold text-stone-950 mb-2">Event History for {selectedTank}</h3>
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
              </div>
            ) : (
              <div className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {slaveData.map(slave => {
                    const isCritical = slave.isCritical;
                    return (
                      <div 
                        key={slave.id}
                        onClick={() => setSelectedTank(slave.id)}
                        className={`bg-white p-6 rounded-3xl shadow-sm border cursor-pointer transition-all duration-300 hover:shadow-md hover:border-emerald-300 ${isCritical ? 'border-red-200 shadow-red-50/50' : 'border-stone-200'}`}
                      >
                        <div className="flex items-center justify-between mb-5">
                          <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-2xl ${isCritical ? 'bg-red-50' : 'bg-emerald-50'}`}>
                              <Droplets className={`w-7 h-7 ${isCritical ? 'text-red-600' : 'text-emerald-600'}`} />
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-stone-950">{slave.id}</h3>
                              <p className={`text-xs font-medium flex items-center gap-1 ${isCritical ? 'text-red-600' : 'text-emerald-600'}`}>
                                <Zap className="w-3 h-3" /> {isCritical ? 'CRITICAL ALERT' : 'SYSTEM NORMAL'}
                              </p>
                            </div>
                          </div>
                          <div className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 ${isCritical ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                            {isCritical ? <Bell className="w-4 h-4 animate-pulse" /> : <CircleCheckBig className="w-4 h-4" />}
                            {slave.status}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex justify-between items-end">
                            <span className="text-xs text-stone-500">Current Level</span>
                            <span className={`text-4xl font-extrabold tracking-tight ${isCritical ? 'text-red-600' : 'text-stone-950'}`}>
                              {slave.level}<span className="text-2xl text-stone-400 font-medium">%</span>
                            </span>
                          </div>
                          <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-1000 ${getLevelColor(slave.level)} ${isCritical ? 'animate-pulse' : ''}`} 
                              style={{ width: `${slave.level}%` }}
                            ></div>
                          </div>
                          <div className="flex items-center justify-between text-xs text-stone-400 pt-1">
                            <span>Click to view history</span>
                            <span className="font-semibold text-emerald-600">Details &rarr;</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )
          )}

          {/* HOME TAB */}
          {activeTab === 'home' && (
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-200">
              <h3 className="text-2xl font-bold text-stone-900 mb-4">Water Tank IoT System Overview</h3>
              <p className="text-stone-600 leading-relaxed">
                Welcome to your centralized industrial monitoring dashboard. Use the sidebar to inspect live telemetry across multiple tank nodes, review event logs, configure notifications, or push remote OTA firmware updates securely to your connected ESP32 controllers.
              </p>
            </div>
          )}

          {/* ALERTS TAB */}
          {activeTab === 'alerts' && (
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-200">
              <h3 className="text-2xl font-bold text-stone-900 mb-4">Alert Configuration Options</h3>
              <p className="text-stone-600 mb-6">Manage thresholds and notification triggers for critical water levels.</p>
              <div className="space-y-4 max-w-lg">
                <div className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl border border-stone-200">
                  <span className="font-medium text-stone-800">Critical High Threshold (%)</span>
                  <input type="number" defaultValue={90} className="w-20 p-2 border rounded-xl text-center bg-white" />
                </div>
                <div className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl border border-stone-200">
                  <span className="font-medium text-stone-800">Buzzer Alarm Active</span>
                  <input type="checkbox" defaultChecked className="w-5 h-5 accent-emerald-600" />
                </div>
              </div>
            </div>
          )}

          {/* HISTORY TAB */}
          {activeTab === 'history' && (
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-stone-900">System Event History Log</h3>
                <button onClick={fetchData} className="flex items-center gap-2 text-sm bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-semibold transition-colors">
                  <RefreshCw className="w-4 h-4" /> Refresh Logs
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-stone-200 text-xs uppercase tracking-wider text-stone-500">
                      <th className="py-3 px-4">Event ID</th>
                      <th className="py-3 px-4">Device / Slave ID</th>
                      <th className="py-3 px-4">Status Change</th>
                      <th className="py-3 px-4 text-right">Date & Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-sm">
                    {historyLogs.map((log) => (
                      <tr key={log.id}>
                        <td className="py-4 px-4 font-mono text-stone-500">{log.id}</td>
                        <td className="py-4 px-4 font-semibold text-emerald-700">{log.slaveId}</td>
                        <td className="py-4 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${log.status === 'FULL' || log.status === 'CRITICAL' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right text-stone-500 font-medium">{log.timestamp}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* OTA UPDATION TAB */}
          {activeTab === 'ota' && (
            <div className="max-w-xl bg-white p-8 rounded-3xl shadow-sm border border-stone-200">
              <h3 className="text-2xl font-bold text-stone-900 mb-2">Multi-Device ESP32 OTA Update</h3>
              <p className="text-sm text-stone-500 mb-6">Select the hardware model and upload the compiled binary firmware file.</p>
              
              <form onSubmit={handleOtaUpload} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Target Device Type</label>
                  <select 
                    value={deviceType} 
                    onChange={(e) => setDeviceType(e.target.value)} 
                    className="w-full border border-stone-300 rounded-xl p-3 bg-white text-stone-900 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="water-master">Water Master Controller</option>
                    <option value="relay-node">Relay Node Unit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">New Firmware Version</label>
                  <input 
                    type="text" 
                    value={versionStr} 
                    onChange={(e) => setVersionStr(e.target.value)} 
                    className="w-full border border-stone-300 rounded-xl p-3 bg-white text-stone-900 focus:ring-2 focus:ring-blue-500 outline-none" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Select Compiled .bin File</label>
                  <input 
                    type="file" 
                    accept=".bin" 
                    onChange={(e) => setFirmwareFile(e.target.files[0])} 
                    className="w-full border border-stone-300 rounded-xl p-2 bg-stone-50 text-stone-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
                  />
                </div>

                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors shadow">
                  Upload and Deploy OTA
                </button>
              </form>

              {uploadStatus && (
                <div className="mt-6 p-4 rounded-xl bg-stone-50 border border-stone-200 text-sm font-semibold text-stone-700">
                  {uploadStatus}
                </div>
              )}
            </div>
          )}

        </main>
      </div>
    </div>
  );
}