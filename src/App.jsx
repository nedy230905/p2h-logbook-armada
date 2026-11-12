// ... existing code ...
      items: {
        rem: 'OK', ban: 'OK', lampu: 'OK', klakson: 'OK', seatbelt: 'OK', kemudi: 'OK', apar: 'OK', p3k: 'OK',
        oli: 'OK', radiator: 'OK', kabin: 'OK', body: 'OK', wiper: 'OK'
      },
      signature: 'SIGNED_OK'
    }
  ];

  const INITIAL_LOGS = [
// ... existing code ...
  const handleDeleteVehicle = async (vehicleId) => {
    setVehicles(prev => prev.filter(v => v.id !== vehicleId));
    deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'vehicles', vehicleId)).catch(() => {});
    showToast(`Unit ${vehicleId} berhasil dihapus dari armada`);
    setVehicleToDelete(null);
  };

  const copyToClipboard = (text) => {
// ... existing code ...
  const displayAppUrl = selectedQrVehicle === 'ALL' 
    ? (customAppUrl || 'https://kendaraan-senkom.vercel.app') 
    : `${customAppUrl || 'https://kendaraan-senkom.vercel.app'}?unit=${selectedQrVehicle}`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-12">
      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-2xl border flex items-center space-x-2 text-xs font-semibold animate-bounce ${
          toast.type === 'error' ? 'bg-rose-900 border-rose-600 text-rose-100' : 'bg-emerald-900 border-emerald-600 text-emerald-100'
        }`}>
          {toast.type === 'error' ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* HEADER UTAMA DENGAN LOGO SENKOM MITRA POLRI */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
// ... existing code ...
