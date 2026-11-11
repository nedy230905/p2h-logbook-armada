import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  XCircle, 
  CheckCircle2, 
  Truck, 
  UserCheck, 
  FileText, 
  Navigation, 
  Clock, 
  Calendar, 
  Filter, 
  Download, 
  Plus, 
  Search, 
  Fuel, 
  Activity, 
  PenTool, 
  RotateCcw,
  Check,
  X,
  AlertCircle,
  BarChart3,
  ChevronRight,
  ClipboardList,
  SlidersHorizontal,
  Printer,
  BadgeCheck,
  FileCheck,
  IdCard,
  Building2,
  Briefcase,
  Cloud,
  CloudOff,
  Trash2,
  Lock,
  LogOut,
  KeyRound,
  Share2,
  QrCode,
  Copy
} from 'lucide-react';

// --- FIREBASE CLOUD STORAGE IMPORTS ---
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  signInWithCustomToken, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc,
  onSnapshot 
} from 'firebase/firestore';

// --- FIREBASE INITIALIZATION ---
const firebaseConfig = typeof __firebase_config !== 'undefined' 
  ? JSON.parse(__firebase_config) 
  : { apiKey: "demo-key", authDomain: "demo.firebaseapp.com", projectId: "demo-app" };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'fleet-p2h-app';

// --- INITIAL DUMMY DATA ---
const INITIAL_VEHICLES = [
  { 
    id: 'OP-PANTHER-01', 
    name: 'Isuzu Panther', 
    plat: 'B 1023 PHO', 
    status: 'FIT', 
    lastInspect: '2026-11-11 06:30', 
    driver: 'Budi Santoso',
    stnkExpiry: '2027-08-15'
  },
  { 
    id: 'OP-STRADA-02', 
    name: 'Mitsubishi Strada Triton', 
    plat: 'B 8492 FFR', 
    status: 'WARNING', 
    lastInspect: '2026-11-11 07:00', 
    driver: 'Agus Wijaya',
    stnkExpiry: '2026-11-15'
  },
  { 
    id: 'OP-REBORN-03', 
    name: 'Toyota Innova Reborn', 
    plat: 'B 7001 BKK', 
    status: 'GROUNDED', 
    lastInspect: '2026-11-10 18:15', 
    driver: 'Eko Prasetyo',
    stnkExpiry: '2026-10-30'
  },
  { 
    id: 'OP-ZENIX-04', 
    name: 'Toyota Innova Zenix', 
    plat: 'B 3311 BZD', 
    status: 'FIT', 
    lastInspect: '2026-11-11 05:45', 
    driver: 'Rahmat Hidayat',
    stnkExpiry: '2027-11-01'
  }
];

const INITIAL_INSPECTIONS = [
  {
    id: 'P2H-20261111-001',
    date: '2026-11-11',
    time: '06:30',
    shift: 'Operasional Pagi',
    driverName: 'Budi Santoso',
    simType: 'SIM A',
    simExpiry: '2028-04-10',
    vehicleId: 'OP-PANTHER-01',
    stnkExpiry: '2027-08-15',
    docCompliance: 'PASSED',
    odometer: 145230,
    status: 'FIT',
    criticalStatus: 'PASSED',
    notes: 'Kondisi kendaraan sangat prima. Surat SIM & STNK lengkap.',
    items: {
      rem: 'OK', ban: 'OK', lampu: 'OK', klakson: 'OK', seatbelt: 'OK', kemudi: 'OK', apar: 'OK', p3k: 'OK',
      oli: 'OK', radiator: 'OK', kabin: 'OK', body: 'OK', wiper: 'OK'
    },
    signature: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="40"><path d="M10 25 Q 30 10 50 25 T 90 20" stroke="%23111" fill="none" stroke-width="2"/></svg>'
  }
];

const INITIAL_LOGS = [
  {
    id: 'TRIP-881',
    date: '2026-11-11',
    driverName: 'Budi Santoso',
    vehicleId: 'OP-PANTHER-01',
    startKm: 145230,
    endKm: 145310,
    totalKm: 80,
    origin: 'Kantor Pusat (Sudirman)',
    destination: 'Pabrik / Warehouse (Cikarang)',
    purpose: 'Pengantaran Tim Management & Dokumen Project',
    fuelAdded: 35,
    status: 'COMPLETED'
  }
];

// --- INSPECTION ITEMS DEFINITION ---
const SAFETY_CRITICAL_ITEMS = [
  { id: 'rem', label: 'Sistem Rem (Kaki & Handbrake)', desc: 'Tekanan rem & kepakeman rem tangan' },
  { id: 'ban', label: 'Kondisi Ban & Ban Serep', desc: 'Ketebalan alur, tekanan udara & baut roda' },
  { id: 'lampu', label: 'Lampu Utama, Sen & Hazard', desc: 'Lampu depan, belakang, rem, & sen berkedip' },
  { id: 'klakson', label: 'Klakson & Wiper Belakang', desc: 'Suara nyaring & fungsi pembilas kaca' },
  { id: 'seatbelt', label: 'Sabuk Pengaman (Seat Belt)', desc: 'Mengunci presisi pada seluruh kursi' },
  { id: 'kemudi', label: 'Sistem Kemudi (Steering)', desc: 'Setir responsif & tidak ada bunyi aneh' },
  { id: 'apar', label: 'APAR (Alat Pemadam Api)', desc: 'Indikator tekanan di area hijau & terpasang' },
  { id: 'p3k', label: 'Kotak P3K (First Aid Kit)', desc: 'Segel utuh & isi obat P3K lengkap' }
];

const NON_CRITICAL_ITEMS = [
  { id: 'oli', label: 'Level Oli Mesin & Transmisi', desc: 'Cek dipstick oli di batas aman (F-L)' },
  { id: 'radiator', label: 'Air Radiator & Coolant', desc: 'Tercukupi & tidak ada kebocoran air' },
  { id: 'kabin', label: 'Kebersihan Kabin & AC', desc: 'Bebas bau, sampah & pendingin AC dingin' },
  { id: 'body', label: 'Kondisi Body & Spion', desc: 'Kebersihan exterior & pengaturan spion' },
  { id: 'wiper', label: 'Wiper & Air Pembersih', desc: 'Karet elastis & semprotan air lancar' }
];

export default function App() {
  const [role, setRole] = useState('driver'); // 'driver' | 'manager'
  const [driverTab, setDriverTab] = useState('p2h'); // 'p2h' | 'trip'
  
  // Security PIN State for Manager Access
  const [isManagerAuthenticated, setIsManagerAuthenticated] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const MANAGER_PIN = '1234'; // Default PIN Supervisor/GA

  // Share & QR Modal State
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedQrVehicle, setSelectedQrVehicle] = useState('ALL');
  const [customAppUrl, setCustomAppUrl] = useState('');

  // Google Sheets Integration State
  const [googleScriptUrl, setGoogleScriptUrl] = useState('');
  const [showDriveModal, setShowDriveModal] = useState(false);

  // Data State
  const [vehicles, setVehicles] = useState(INITIAL_VEHICLES);
  const [inspections, setInspections] = useState(INITIAL_INSPECTIONS);
  const [tripLogs, setTripLogs] = useState(INITIAL_LOGS);
  const [syncStatus, setSyncStatus] = useState('connecting');

  // Modal State
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState(null);
  const [newVehicle, setNewVehicle] = useState({
    id: '',
    name: 'Toyota Innova Reborn',
    plat: '',
    stnkExpiry: '2027-12-31'
  });

  // Driver Form State
  const [formData, setFormData] = useState({
    driverName: 'Budi Santoso',
    simType: 'SIM A',
    simExpiry: '2027-10-15',
    vehicleId: 'OP-PANTHER-01',
    stnkExpiry: '2027-08-15',
    shift: 'Operasional Pagi',
    odometer: '',
    notes: '',
    items: {
      rem: 'OK', ban: 'OK', lampu: 'OK', klakson: 'OK', seatbelt: 'OK', kemudi: 'OK', apar: 'OK', p3k: 'OK',
      oli: 'OK', radiator: 'OK', kabin: 'OK', body: 'OK', wiper: 'OK'
    }
  });

  // Trip Log Form State
  const [tripForm, setTripForm] = useState({
    driverName: 'Budi Santoso',
    vehicleId: 'OP-PANTHER-01',
    startKm: '',
    endKm: '',
    origin: '',
    destination: '',
    purpose: '',
    fuelAdded: ''
  });

  // Filter & Search Manager
  const [filterVehicle, setFilterVehicle] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Signature Canvas Ref
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureData, setSignatureData] = useState(null);

  // Toast State
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Handler for Role Switch with Security Check
  const handleRoleSwitch = (targetRole) => {
    if (targetRole === 'manager') {
      if (isManagerAuthenticated) {
        setRole('manager');
      } else {
        setPinInput('');
        setPinError('');
        setShowPinModal(true);
      }
    } else {
      setRole('driver');
    }
  };

  // Verify PIN submission
  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pinInput === MANAGER_PIN) {
      setIsManagerAuthenticated(true);
      setShowPinModal(false);
      setRole('manager');
      showToast('Akses Manager GA Berhasil Diverifikasi!');
    } else {
      setPinError('PIN Keamanan Salah! Hubungi Supervisor Fleet.');
    }
  };

  const handleManagerLogout = () => {
    setIsManagerAuthenticated(false);
    setRole('driver');
    showToast('Berhasil Keluar dari Mode Manager.');
  };

  // Auth & Cloud Firestore Sync
  useEffect(() => {
    let unsubscribeVehicles = () => {};
    let unsubscribeInspections = () => {};
    let unsubscribeLogs = () => {};

    const initFirebase = async () => {
      try {
        if (typeof window !== 'undefined' && window.location.href && !window.location.href.includes('about:srcdoc')) {
          setCustomAppUrl(window.location.href);
        } else {
          setCustomAppUrl('https://p2h.company.com');
        }

        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }

        const vehiclesRef = collection(db, 'artifacts', appId, 'public', 'data', 'vehicles');
        unsubscribeVehicles = onSnapshot(vehiclesRef, (snapshot) => {
          if (!snapshot.empty) {
            const vehicleList = snapshot.docs.map(doc => doc.data());
            setVehicles(vehicleList);
          } else {
            INITIAL_VEHICLES.forEach(async (v) => {
              await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'vehicles', v.id), v);
            });
          }
        }, (err) => console.error("Vehicles listener err:", err));

        const inspectRef = collection(db, 'artifacts', appId, 'public', 'data', 'inspections');
        unsubscribeInspections = onSnapshot(inspectRef, (snapshot) => {
          if (!snapshot.empty) {
            const list = snapshot.docs.map(doc => doc.data());
            list.sort((a, b) => new Date(b.date + ' ' + b.time) - new Date(a.date + ' ' + a.time));
            setInspections(list);
          }
        }, (err) => console.error("Inspections listener err:", err));

        const logsRef = collection(db, 'artifacts', appId, 'public', 'data', 'trip_logs');
        unsubscribeLogs = onSnapshot(logsRef, (snapshot) => {
          if (!snapshot.empty) {
            const list = snapshot.docs.map(doc => doc.data());
            setTripLogs(list);
          }
        }, (err) => console.error("Logs listener err:", err));

        setSyncStatus('connected');
      } catch (err) {
        console.error("Firebase auth/sync error:", err);
        setSyncStatus('offline');
      }
    };

    initFirebase();

    return () => {
      unsubscribeVehicles();
      unsubscribeInspections();
      unsubscribeLogs();
    };
  }, []);

  // Update dates when vehicle is selected
  useEffect(() => {
    const selectedVeh = vehicles.find(v => v.id === formData.vehicleId);
    if (selectedVeh) {
      setFormData(prev => ({
        ...prev,
        stnkExpiry: selectedVeh.stnkExpiry || '2027-12-31'
      }));
    }
  }, [formData.vehicleId, vehicles]);

  // Handle Canvas Drawing
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing && canvasRef.current) {
      setIsDrawing(false);
      setSignatureData(canvasRef.current.toDataURL());
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureData(null);
  };

  const handleItemChange = (itemId, val) => {
    setFormData(prev => ({
      ...prev,
      items: { ...prev.items, [itemId]: val }
    }));
  };

  const getDocStatus = (expiryDateStr) => {
    if (!expiryDateStr) return { status: 'VALID', days: 999 };
    const today = new Date();
    const exp = new Date(expiryDateStr);
    const diffTime = exp - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { status: 'EXPIRED', days: diffDays };
    if (diffDays <= 7) return { status: 'WARNING', days: diffDays };
    return { status: 'VALID', days: diffDays };
  };

  const calculateP2HStatus = () => {
    const simStat = getDocStatus(formData.simExpiry);
    const stnkStat = getDocStatus(formData.stnkExpiry);

    if (simStat.status === 'EXPIRED' || stnkStat.status === 'EXPIRED') {
      return { 
        status: 'GROUNDED', 
        label: 'STOP OPERASI (SURAT MATI / EXPIRED)', 
        color: 'rose',
        reason: 'Dokumen SIM Driver atau STNK Pajak Kendaraan sudah kadaluarsa (Expired). Kepatuhan Legalitas Jalan.',
        icon: XCircle 
      };
    }

    const badCritical = SAFETY_CRITICAL_ITEMS.filter(item => formData.items[item.id] === 'BAD');
    if (badCritical.length > 0) {
      return { 
        status: 'GROUNDED', 
        label: 'DILARANG JALAN (SAFETY CRITICAL BAD)', 
        color: 'rose',
        reason: `Item kritis rusak: ${badCritical.map(i => i.label).join(', ')}`,
        icon: XCircle 
      };
    }

    const isDocWarning = simStat.status === 'WARNING' || stnkStat.status === 'WARNING';
    const badNonCritical = NON_CRITICAL_ITEMS.filter(item => formData.items[item.id] === 'BAD');
    
    if (isDocWarning || badNonCritical.length > 0) {
      return { 
        status: 'WARNING', 
        label: 'FIT WITH WARNING (PERLU PERHATIAN)', 
        color: 'amber',
        reason: isDocWarning ? 'Ada SIM atau STNK yang akan kadaluarsa < 7 hari.' : 'Ada komponen non-kritis perlu pengecekan.',
        icon: AlertTriangle 
      };
    }

    return { 
      status: 'FIT', 
      label: 'FIT TO DRIVE (SIAP OPERASIONAL)', 
      color: 'emerald',
      reason: 'Semua komponen aman & SIM / STNK aktif.',
      icon: CheckCircle2 
    };
  };

  const handleSubmitP2H = async (e) => {
    e.preventDefault();
    if (!signatureData) {
      showToast('Tanda tangan digital pengemudi wajib diisi!', 'error');
      return;
    }

    const currentResult = calculateP2HStatus();
    const newRecord = {
      id: `P2H-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.floor(100 + Math.random() * 900)}`,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      ...formData,
      status: currentResult.status,
      signature: signatureData
    };

    try {
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'inspections', newRecord.id), newRecord);

      const targetVeh = vehicles.find(v => v.id === formData.vehicleId);
      if (targetVeh) {
        const updatedVeh = {
          ...targetVeh,
          status: currentResult.status,
          driver: formData.driverName,
          lastInspect: `${newRecord.date} ${newRecord.time}`
        };
        await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'vehicles', formData.vehicleId), updatedVeh);
      }

      showToast(`P2H Berhasil Dikirim! Status Unit: ${currentResult.label}`);
      clearSignature();
      setFormData(prev => ({ ...prev, odometer: '', notes: '' }));

      // Kirim Otomatis ke Google Sheets / Drive jika Webhook URL dikonfigurasi
      if (googleScriptUrl) {
        try {
          fetch(googleScriptUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'P2H', data: newRecord })
          });
          showToast('Data P2H juga berhasil dikirim ke Google Drive/Sheets!');
        } catch (gErr) {
          console.error("Error Google Sheets API:", gErr);
        }
      }
    } catch (err) {
      console.error("Error saving P2H:", err);
      showToast('Gagal menyimpan P2H ke Cloud Database', 'error');
    }
  };

  const handleSubmitTrip = async (e) => {
    e.preventDefault();
    const startKm = parseFloat(tripForm.startKm);
    const endKm = parseFloat(tripForm.endKm);

    if (endKm <= startKm) {
      showToast('Odometer Akhir harus lebih besar dari Odometer Awal!', 'error');
      return;
    }

    const newTrip = {
      id: `TRIP-${Math.floor(100 + Math.random() * 900)}`,
      date: new Date().toISOString().split('T')[0],
      ...tripForm,
      startKm,
      endKm,
      totalKm: endKm - startKm,
      status: 'COMPLETED'
    };

    try {
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'trip_logs', newTrip.id), newTrip);
      showToast('Logbook Perjalanan Berhasil Disimpan!');
      setTripForm(prev => ({
        ...prev,
        startKm: '',
        endKm: '',
        origin: '',
        destination: '',
        purpose: '',
        fuelAdded: ''
      }));

      if (googleScriptUrl) {
        try {
          fetch(googleScriptUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'TRIP', data: newTrip })
          });
        } catch (gErr) {
          console.error("Error Google Sheets API Trip:", gErr);
        }
      }
    } catch (err) {
      console.error("Error saving trip log:", err);
      showToast('Gagal menyimpan log perjalanan', 'error');
    }
  };

  const handleAddNewVehicle = async (e) => {
    e.preventDefault();
    if (!newVehicle.id || !newVehicle.plat) {
      showToast('ID Unit dan Nomor Plat Wajib Diisi!', 'error');
      return;
    }

    const vehToAdd = {
      ...newVehicle,
      status: 'FIT',
      lastInspect: 'Belum Ada',
      driver: '-'
    };

    try {
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'vehicles', vehToAdd.id), vehToAdd);
      showToast(`Unit ${vehToAdd.id} berhasil ditambahkan!`);
      setShowAddVehicleModal(false);
      setNewVehicle({ id: '', name: 'Toyota Innova Reborn', plat: '', stnkExpiry: '2027-12-31' });
    } catch (err) {
      console.error("Error adding vehicle:", err);
      showToast('Gagal menambahkan unit kendaraan', 'error');
    }
  };

  const handleDeleteVehicle = async (vehicleId) => {
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'vehicles', vehicleId));
      showToast(`Unit ${vehicleId} berhasil dihapus dari armada`);
      setVehicleToDelete(null);
    } catch (err) {
      console.error("Error deleting vehicle:", err);
      showToast('Gagal menghapus unit kendaraan', 'error');
    }
  };

  const copyToClipboard = (text) => {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      showToast('Link berhasil disalin ke clipboard!');
    } catch (err) {
      console.error("Failed to copy link:", err);
      showToast('Gagal menyalin link', 'error');
    }
  };

  const currentResult = calculateP2HStatus();

  const filteredInspections = inspections.filter(item => {
    const matchesVehicle = filterVehicle === 'ALL' || item.vehicleId === filterVehicle;
    const matchesStatus = filterStatus === 'ALL' || item.status === filterStatus;
    const matchesSearch = item.driverName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.vehicleId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesVehicle && matchesStatus && matchesSearch;
  });

  const displayAppUrl = selectedQrVehicle === 'ALL' 
    ? (customAppUrl || 'https://p2h.company.com') 
    : `${customAppUrl || 'https://p2h.company.com'}?unit=${selectedQrVehicle}`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-12">
      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-2xl border flex items-center space-x-2 text-xs font-semibold animate-bounce ${
          toast.type === 'error' ? 'bg-rose-900 border-rose-600 text-rose-100' : 'bg-emerald-900 border-emerald-600 text-emerald-100'
        }`}>
          {toast.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* HEADER UTAMA */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-600 rounded-xl shadow-md shadow-indigo-500/30">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight text-white flex items-center space-x-2">
                <span>P2H & LOGBOOK OPERASIONAL</span>
                <span className="text-[10px] bg-indigo-950 text-indigo-300 border border-indigo-700 px-2 py-0.5 rounded-full font-mono">CORPORATE FLEET</span>
              </h1>
              <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                <span>Sistem Pengecekan Kendaraan Dinas Perusahaan</span>
                <span>•</span>
                <span className="flex items-center space-x-1 font-mono">
                  {syncStatus === 'connected' ? (
                    <>
                      <Cloud className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Cloud Synced</span>
                    </>
                  ) : (
                    <>
                      <CloudOff className="w-3 h-3 text-amber-400" />
                      <span className="text-amber-400">Offline / Local</span>
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowShareModal(true)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-sm"
              title="Bagikan & Cetak QR Code Kendaraan"
            >
              <QrCode className="w-4 h-4 text-indigo-400" />
              <span className="hidden sm:inline">QR Code & Share</span>
            </button>

            <button
              onClick={() => setShowDriveModal(true)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-sm"
              title="Integrasi Google Drive / Sheets"
            >
              <Cloud className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Google Drive</span>
            </button>

            <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => handleRoleSwitch('driver')}
                className={`flex items-center space-x-2 px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  role === 'driver' 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <PenTool className="w-4 h-4" />
                <span>Form Driver</span>
              </button>
              <button
                onClick={() => handleRoleSwitch('manager')}
                className={`flex items-center space-x-2 px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  role === 'manager' 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Manager GA / Fleet</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* ========================================================================= */}
        {/* MODE 1: DRIVER FORM (P2H & TRIP LOGBOOK)                                 */}
        {/* ========================================================================= */}
        {role === 'driver' && (
          <div className="space-y-6">
            {/* DRIVER SUB-NAV */}
            <div className="flex items-center space-x-4 border-b border-slate-800 pb-3">
              <button
                onClick={() => setDriverTab('p2h')}
                className={`flex items-center space-x-2 text-sm font-bold pb-2 border-b-2 transition-all ${
                  driverTab === 'p2h' 
                    ? 'border-indigo-400 text-indigo-400' 
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileCheck className="w-4 h-4" />
                <span>Form Checksheet & Surat Kendaraan</span>
              </button>
              <button
                onClick={() => setDriverTab('trip')}
                className={`flex items-center space-x-2 text-sm font-bold pb-2 border-b-2 transition-all ${
                  driverTab === 'trip' 
                    ? 'border-indigo-400 text-indigo-400' 
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Navigation className="w-4 h-4" />
                <span>Logbook Perjalanan Operasional</span>
              </button>
            </div>

            {driverTab === 'p2h' && (
              <form onSubmit={handleSubmitP2H} className="space-y-6">
                
                {/* LIVE STATUS BANNER */}
                <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all shadow-xl ${
                  currentResult.status === 'GROUNDED'
                    ? 'bg-rose-950/80 border-rose-600/80 text-rose-200'
                    : currentResult.status === 'WARNING'
                    ? 'bg-amber-950/80 border-amber-500/80 text-amber-200'
                    : 'bg-emerald-950/80 border-emerald-500/80 text-emerald-200'
                }`}>
                  <div className="flex items-center space-x-3">
                    <currentResult.icon className="w-8 h-8 shrink-0" />
                    <div>
                      <div className="text-xs uppercase tracking-widest font-semibold opacity-75">Status Kelayakan Kendaraan</div>
                      <div className="text-lg font-black">{currentResult.label}</div>
                    </div>
                  </div>
                  <div className="text-xs bg-slate-900/60 px-3 py-1.5 rounded-lg border border-white/10 max-w-sm">
                    {currentResult.status === 'GROUNDED' && `🚨 ${currentResult.reason}. Dilarang digunakan untuk operasional!`}
                    {currentResult.status === 'WARNING' && `⚠️ ${currentResult.reason}. Diizinkan jalan dengan perhatian.`}
                    {currentResult.status === 'FIT' && '✅ Dokumen legal lengkap & kendaraan dalam kondisi aman.'}
                  </div>
                </div>

                {/* IDENTITAS OPERASIONAL - DRIVER INPUT */}
                <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-5 space-y-4">
                  <h3 className="text-md font-bold text-indigo-400 flex items-center space-x-2 border-b border-slate-700 pb-2">
                    <UserCheck className="w-5 h-5 text-indigo-400" />
                    <span>Identitas Pengemudi & Pilihan Unit Kendaraan Operasional</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-slate-300 font-medium mb-1">Nama Lengkap Driver *</label>
                      <input 
                        type="text"
                        required
                        placeholder="Masukkan nama pengemudi..."
                        value={formData.driverName}
                        onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-indigo-400 font-semibold mb-1">Pilih Unit Kendaraan *</label>
                      <select 
                        value={formData.vehicleId}
                        onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                        className="w-full bg-slate-900 border border-indigo-500/70 text-white font-bold rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      >
                        {vehicles.map(v => (
                          <option key={v.id} value={v.id}>
                            {v.name} ({v.id}) - [{v.plat}]
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-slate-300 font-medium mb-1">Odometer / KM Awal *</label>
                      <input 
                        type="number"
                        required
                        placeholder="Contoh: 145250"
                        value={formData.odometer}
                        onChange={(e) => setFormData({ ...formData, odometer: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* PENGECEKAN DOKUMEN & LISENSI LEGAL (SIM & STNK SAJA) */}
                <div className="bg-slate-800/60 border border-indigo-500/30 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-indigo-500/30 pb-3">
                    <div>
                      <h3 className="text-md font-bold text-indigo-400 flex items-center space-x-2">
                        <IdCard className="w-5 h-5 text-indigo-400" />
                        <span>Verifikasi Masa Berlaku Surat (SIM & STNK)</span>
                      </h3>
                      <p className="text-xs text-slate-400">Pemeriksaan kelengkapan SIM pengemudi dan pajak STNK kendaraan operasional.</p>
                    </div>
                    <span className="text-xs bg-indigo-950 text-indigo-300 border border-indigo-800 px-2.5 py-1 rounded-full font-mono font-bold">LEGAL COMPLIANCE</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* SIM DRIVER CHECK */}
                    <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-700 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-200 uppercase flex items-center space-x-1">
                          <BadgeCheck className="w-4 h-4 text-indigo-400" />
                          <span>SIM Driver ({formData.driverName})</span>
                        </span>
                        {(() => {
                          const doc = getDocStatus(formData.simExpiry);
                          if (doc.status === 'EXPIRED') return <span className="text-[10px] bg-rose-950 text-rose-400 border border-rose-700 font-bold px-2 py-0.5 rounded">EXPIRED!</span>;
                          if (doc.status === 'WARNING') return <span className="text-[10px] bg-amber-950 text-amber-400 border border-amber-700 font-bold px-2 py-0.5 rounded">AKAN MATI ({doc.days} hr)</span>;
                          return <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-700 font-bold px-2 py-0.5 rounded">VALID</span>;
                        })()}
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="text-slate-400 block mb-1">Golongan SIM</label>
                          <select 
                            value={formData.simType}
                            onChange={(e) => setFormData({ ...formData, simType: e.target.value })}
                            className="w-full bg-slate-800 border border-slate-700 text-white rounded p-1.5 focus:outline-none"
                          >
                            <option value="SIM A">SIM A (Mobil Penumpang)</option>
                            <option value="SIM B1">SIM B1 (Bus / Double Cabin)</option>
                            <option value="SIM B2">SIM B2 (Truck / Heavy Vehicle)</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-slate-400 block mb-1">Masa Berlaku SIM</label>
                          <input 
                            type="date"
                            value={formData.simExpiry}
                            onChange={(e) => setFormData({ ...formData, simExpiry: e.target.value })}
                            className="w-full bg-slate-800 border border-slate-700 text-white rounded p-1.5 font-mono focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* STNK KENDARAAN CHECK */}
                    <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-700 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-200 uppercase flex items-center space-x-1">
                          <FileText className="w-4 h-4 text-indigo-400" />
                          <span>STNK / Pajak Kendaraan ({formData.vehicleId})</span>
                        </span>
                        {(() => {
                          const doc = getDocStatus(formData.stnkExpiry);
                          if (doc.status === 'EXPIRED') return <span className="text-[10px] bg-rose-950 text-rose-400 border border-rose-700 font-bold px-2 py-0.5 rounded">STNK MATI!</span>;
                          if (doc.status === 'WARNING') return <span className="text-[10px] bg-amber-950 text-amber-400 border border-amber-700 font-bold px-2 py-0.5 rounded">AKAN MATI ({doc.days} hr)</span>;
                          return <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-700 font-bold px-2 py-0.5 rounded">VALID</span>;
                        })()}
                      </div>

                      <div className="text-xs">
                        <label className="text-slate-400 block mb-1">Masa Berlaku Pajak STNK</label>
                        <input 
                          type="date"
                          value={formData.stnkExpiry}
                          onChange={(e) => setFormData({ ...formData, stnkExpiry: e.target.value })}
                          className="w-full bg-slate-800 border border-slate-700 text-white rounded p-1.5 font-mono focus:outline-none"
                        />
                      </div>
                    </div>

                  </div>
                </div>

                {/* BAGIAN INSPEKSI FISIK SAFETY CRITICAL & NON CRITICAL */}
                <div className="bg-slate-800/60 border border-rose-500/30 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-rose-500/30 pb-3">
                    <div>
                      <h3 className="text-md font-bold text-rose-400 flex items-center space-x-2">
                        <AlertCircle className="w-5 h-5 text-rose-400" />
                        <span>Kategori Safety Critical Items (Wajib Lulus)</span>
                      </h3>
                      <p className="text-xs text-slate-400">Komponen utama keselamatan berkendara. Jika 1 item rusak, kendaraan **DILARANG BEROPERASI**.</p>
                    </div>
                    <span className="text-xs bg-rose-950 text-rose-300 border border-rose-800 px-2.5 py-1 rounded-full font-mono font-bold">SAFETY MANDATORY</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {SAFETY_CRITICAL_ITEMS.map((item) => (
                      <div key={item.id} className="bg-slate-900/80 p-4 rounded-xl border border-slate-700/80 flex flex-col justify-between space-y-3">
                        <div>
                          <div className="font-semibold text-sm text-slate-200">{item.label}</div>
                          <div className="text-xs text-slate-400 mt-0.5">{item.desc}</div>
                        </div>
                        <div className="flex items-center space-x-2 pt-2 border-t border-slate-800">
                          <button
                            type="button"
                            onClick={() => handleItemChange(item.id, 'OK')}
                            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center space-x-1 border transition-all ${
                              formData.items[item.id] === 'OK'
                                ? 'bg-emerald-600 border-emerald-500 text-white shadow-md'
                                : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>OK / BAIK</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleItemChange(item.id, 'BAD')}
                            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center space-x-1 border transition-all ${
                              formData.items[item.id] === 'BAD'
                                ? 'bg-rose-600 border-rose-500 text-white shadow-md'
                                : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                            }`}
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>RUSAK / BAD</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-800/60 border border-indigo-500/30 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-indigo-500/30 pb-3">
                    <div>
                      <h3 className="text-md font-bold text-indigo-400 flex items-center space-x-2">
                        <SlidersHorizontal className="w-5 h-5 text-indigo-400" />
                        <span>Kategori General Condition (Kondisi Umum)</span>
                      </h3>
                      <p className="text-xs text-slate-400">Kondisi kenyamanan & perawatan rutin kendaraan operasional kantor.</p>
                    </div>
                    <span className="text-xs bg-indigo-950 text-indigo-300 border border-indigo-800 px-2.5 py-1 rounded-full font-mono font-bold">ROUTINE CHECK</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {NON_CRITICAL_ITEMS.map((item) => (
                      <div key={item.id} className="bg-slate-900/80 p-4 rounded-xl border border-slate-700/80 flex flex-col justify-between space-y-3">
                        <div>
                          <div className="font-semibold text-sm text-slate-200">{item.label}</div>
                          <div className="text-xs text-slate-400 mt-0.5">{item.desc}</div>
                        </div>
                        <div className="flex items-center space-x-2 pt-2 border-t border-slate-800">
                          <button
                            type="button"
                            onClick={() => handleItemChange(item.id, 'OK')}
                            className={`flex-1 py-1 px-2 rounded-lg text-xs font-bold flex items-center justify-center space-x-1 border transition-all ${
                              formData.items[item.id] === 'OK'
                                ? 'bg-emerald-600 border-emerald-500 text-white shadow'
                                : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                            }`}
                          >
                            <span>OK</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleItemChange(item.id, 'BAD')}
                            className={`flex-1 py-1 px-2 rounded-lg text-xs font-bold flex items-center justify-center space-x-1 border transition-all ${
                              formData.items[item.id] === 'BAD'
                                ? 'bg-amber-600 border-amber-500 text-white shadow'
                                : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                            }`}
                          >
                            <span>PERLU CEK</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CATATAN & SIGNATURE */}
                <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-5 space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Catatan Tambahan / Temuan Driver</label>
                    <textarea 
                      rows={3}
                      placeholder="Tuliskan catatan kondisi kendaraan jika ada (contoh: AC kurang dingin, STNK perlu diperpanjang)..."
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1">
                        <PenTool className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Tanda Tangan Digital Pengemudi ({formData.driverName}) *</span>
                      </label>
                      <button 
                        type="button" 
                        onClick={clearSignature}
                        className="text-xs text-indigo-400 hover:underline flex items-center space-x-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Reset Tanda Tangan</span>
                      </button>
                    </div>

                    <div className="bg-slate-100 rounded-xl border border-slate-400 overflow-hidden touch-none max-w-md">
                      <canvas 
                        ref={canvasRef}
                        width={400}
                        height={130}
                        className="w-full cursor-crosshair"
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 px-6 rounded-xl shadow-lg shadow-indigo-500/20 text-md tracking-wider uppercase transition-all flex items-center justify-center space-x-2"
                >
                  <ShieldCheck className="w-5 h-5" />
                  <span>Kirim Checksheet & Log Masuk</span>
                </button>

              </form>
            )}

            {driverTab === 'trip' && (
              <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-6 space-y-6">
                <div className="border-b border-slate-700 pb-3">
                  <h3 className="text-lg font-bold text-indigo-400 flex items-center space-x-2">
                    <Navigation className="w-5 h-5" />
                    <span>Catatan Logbook Perjalanan Dinas / Operasional Office</span>
                  </h3>
                </div>

                <form onSubmit={handleSubmitTrip} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Nama Driver *</label>
                      <input 
                        type="text"
                        required
                        placeholder="Nama Pengemudi..."
                        value={tripForm.driverName}
                        onChange={(e) => setTripForm({ ...tripForm, driverName: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Unit Kendaraan *</label>
                      <select 
                        value={tripForm.vehicleId}
                        onChange={(e) => setTripForm({ ...tripForm, vehicleId: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white"
                      >
                        {vehicles.map(v => (
                          <option key={v.id} value={v.id}>{v.name} ({v.id})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Odometer Awal (KM) *</label>
                      <input 
                        type="number"
                        required
                        placeholder="Contoh: 145230"
                        value={tripForm.startKm}
                        onChange={(e) => setTripForm({ ...tripForm, startKm: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Odometer Akhir (KM) *</label>
                      <input 
                        type="number"
                        required
                        placeholder="Contoh: 145310"
                        value={tripForm.endKm}
                        onChange={(e) => setTripForm({ ...tripForm, endKm: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Lokasi Keberangkatan (Asal) *</label>
                      <input 
                        type="text"
                        required
                        placeholder="Contoh: Kantor Pusat HQ"
                        value={tripForm.origin}
                        onChange={(e) => setTripForm({ ...tripForm, origin: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Lokasi Tujuan *</label>
                      <input 
                        type="text"
                        required
                        placeholder="Contoh: Client Meeting / Warehouse Cikarang"
                        value={tripForm.destination}
                        onChange={(e) => setTripForm({ ...tripForm, destination: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Pengisian BBM (Liter)</label>
                      <input 
                        type="number"
                        placeholder="Contoh: 40"
                        value={tripForm.fuelAdded}
                        onChange={(e) => setTripForm({ ...tripForm, fuelAdded: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Tujuan / Keperluan Tugas Dinas</label>
                    <input 
                      type="text"
                      placeholder="Contoh: Perjalanan dinas Direksi & Kunjungan Klien"
                      value={tripForm.purpose}
                      onChange={(e) => setTripForm({ ...tripForm, purpose: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Simpan Log Perjalanan</span>
                  </button>
                </form>

                <div className="pt-6 border-t border-slate-700">
                  <h4 className="text-sm font-bold text-slate-300 mb-3">Histori Logbook Perjalanan Terbaru</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-slate-900 text-slate-400 uppercase font-mono">
                        <tr>
                          <th className="p-3">ID Trip</th>
                          <th className="p-3">Driver</th>
                          <th className="p-3">Unit</th>
                          <th className="p-3">Rute (Asal → Tujuan)</th>
                          <th className="p-3">Odometer</th>
                          <th className="p-3">Jarak</th>
                          <th className="p-3">BBM (L)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {tripLogs.map(log => (
                          <tr key={log.id} className="hover:bg-slate-800/40">
                            <td className="p-3 font-mono text-indigo-400">{log.id}</td>
                            <td className="p-3 font-semibold text-white">{log.driverName}</td>
                            <td className="p-3 font-bold">{log.vehicleId}</td>
                            <td className="p-3">{log.origin} → {log.destination}</td>
                            <td className="p-3 font-mono">{log.startKm} - {log.endKm} KM</td>
                            <td className="p-3 font-bold text-emerald-400">{log.totalKm} KM</td>
                            <td className="p-3 font-mono">{log.fuelAdded ? `${log.fuelAdded} L` : '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODE 2: FLEET MANAGER / SUPERVISOR DASHBOARD                            */}
        {/* ========================================================================= */}
        {role === 'manager' && (
          <div className="space-y-6">

            {/* HEADER ACTIONS */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                  <span>Dashboard Monitoring Armada GA</span>
                  <span className="text-xs bg-emerald-950 text-emerald-400 border border-emerald-700 px-2.5 py-0.5 rounded-full font-mono flex items-center space-x-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>AUTHENTICATED</span>
                  </span>
                </h2>
                <p className="text-xs text-slate-400">Pantau kelayakan fisik & legalitas surat kendaraan perusahaan.</p>
              </div>

              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setShowAddVehicleModal(true)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-3 py-2 rounded-lg flex items-center space-x-1 font-semibold shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Unit Fleet</span>
                </button>
                <button 
                  onClick={() => window.print()}
                  className="bg-slate-700 hover:bg-slate-600 text-white text-xs px-3 py-2 rounded-lg flex items-center space-x-1 font-semibold"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak Laporan</span>
                </button>
                <button 
                  onClick={handleManagerLogout}
                  className="bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 text-xs px-3 py-2 rounded-lg flex items-center space-x-1 font-semibold transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout Manager</span>
                </button>
              </div>
            </div>

            {/* TABLE WITH STNK & SIM DETAILS */}
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl overflow-hidden shadow-xl">
              <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                <h3 className="text-md font-bold text-indigo-400 flex items-center space-x-2">
                  <Activity className="w-5 h-5" />
                  <span>Monitoring Log Inspeksi P2H & Surat Operasional</span>
                </h3>
                <span className="text-xs text-slate-400 font-mono">Total Record: {filteredInspections.length}</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-200">
                  <thead className="bg-slate-950 text-slate-400 uppercase font-mono border-b border-slate-800">
                    <tr>
                      <th className="p-3.5">ID P2H / Waktu</th>
                      <th className="p-3.5">Unit Kendaraan</th>
                      <th className="p-3.5">Driver & SIM</th>
                      <th className="p-3.5">Status STNK</th>
                      <th className="p-3.5">Hasil Status</th>
                      <th className="p-3.5">Temuan / Catatan</th>
                      <th className="p-3.5">Tanda Tangan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredInspections.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-500">
                          Tidak ada data inspeksi yang sesuai dengan filter pencarian.
                        </td>
                      </tr>
                    ) : (
                      filteredInspections.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-800/50 transition-colors">
                          <td className="p-3.5 font-mono">
                            <div className="text-indigo-400 font-bold">{item.id}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">{item.date} • {item.time} ({item.shift})</div>
                          </td>
                          <td className="p-3.5">
                            <div className="font-bold text-white">{item.vehicleId}</div>
                          </td>
                          <td className="p-3.5">
                            <div className="font-semibold text-slate-100">{item.driverName}</div>
                            <div className="text-[10px] text-slate-400 font-mono flex items-center space-x-1 mt-0.5">
                              <span>{item.simType || 'SIM A'}</span>
                              <span>• Exp: {item.simExpiry || '-'}</span>
                            </div>
                          </td>
                          <td className="p-3.5 font-mono">
                            <div className="text-[11px] text-slate-300">STNK: {item.stnkExpiry || '-'}</div>
                          </td>
                          <td className="p-3.5">
                            {item.status === 'FIT' && (
                              <span className="inline-flex items-center space-x-1 bg-emerald-950 text-emerald-400 border border-emerald-700 px-2.5 py-1 rounded-full font-bold text-[11px]">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>FIT TO DRIVE</span>
                              </span>
                            )}
                            {item.status === 'WARNING' && (
                              <span className="inline-flex items-center space-x-1 bg-amber-950 text-amber-400 border border-amber-700 px-2.5 py-1 rounded-full font-bold text-[11px]">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                <span>WARNING</span>
                              </span>
                            )}
                            {item.status === 'GROUNDED' && (
                              <span className="inline-flex items-center space-x-1 bg-rose-950 text-rose-400 border border-rose-700 px-2.5 py-1 rounded-full font-bold text-[11px]">
                                <XCircle className="w-3.5 h-3.5" />
                                <span>STOP OPERASI</span>
                              </span>
                            )}
                          </td>
                          <td className="p-3.5 max-w-xs">
                            <p className="line-clamp-2 text-slate-300 text-[11px] leading-relaxed">
                              {item.notes}
                            </p>
                          </td>
                          <td className="p-3.5">
                            {item.signature && (
                              <div className="bg-slate-100 p-1 rounded border border-slate-400 w-20">
                                <img src={item.signature} alt="Sign" className="h-6 object-contain mx-auto" />
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ARMADA MATRIX STATUS SUMMARY WITH DELETE BUTTON */}
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-5 space-y-4">
              <h3 className="text-md font-bold text-indigo-400 flex items-center space-x-2">
                <Truck className="w-5 h-5" />
                <span>Ringkasan Kondisi Unit Armada & STNK Perusahaan</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {vehicles.map(v => (
                  <div key={v.id} className="bg-slate-900/90 border border-slate-700 p-4 rounded-xl space-y-2 relative group">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-indigo-400 font-mono text-sm">{v.id}</span>
                      <div className="flex items-center space-x-1">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                          v.status === 'FIT' ? 'bg-emerald-900 text-emerald-300' :
                          v.status === 'WARNING' ? 'bg-amber-900 text-amber-300' : 'bg-rose-900 text-rose-300'
                        }`}>
                          {v.status}
                        </span>
                        <button
                          onClick={() => setVehicleToDelete(v)}
                          title="Hapus Unit"
                          className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-950/60 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="text-xs font-semibold text-slate-200">{v.name}</div>
                    <div className="text-[11px] text-slate-400">Plat: {v.plat}</div>
                    <div className="text-[11px] text-slate-400 border-t border-slate-800 pt-2 flex justify-between font-mono">
                      <span>STNK Exp:</span>
                      <span className="text-slate-300">{v.stnkExpiry}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* MODAL CONFIRMATION UNTUK HAPUS UNIT */}
        {vehicleToDelete && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
              <div className="flex items-center space-x-3 text-rose-400">
                <AlertCircle className="w-6 h-6 shrink-0" />
                <h3 className="text-md font-bold">Konfirmasi Hapus Unit</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Apakah Anda yakin ingin menghapus unit <strong className="text-white font-mono">{vehicleToDelete.id}</strong> ({vehicleToDelete.name}) dari armada perusahaan? Data akan terhapus dari cloud database.
              </p>
              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setVehicleToDelete(null)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteVehicle(vehicleToDelete.id)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 text-white hover:bg-rose-500 shadow-md"
                >
                  Ya, Hapus Unit
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL TAMBAH UNIT BARU */}
        {showAddVehicleModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-md w-full space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-md font-bold text-white flex items-center space-x-2">
                  <Truck className="w-5 h-5 text-indigo-400" />
                  <span>Tambah Unit Fleet Baru</span>
                </h3>
                <button 
                  onClick={() => setShowAddVehicleModal(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddNewVehicle} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">ID Kode Unit (Contoh: OP-ZENIX-05) *</label>
                  <input
                    type="text"
                    required
                    placeholder="OP-ZENIX-05"
                    value={newVehicle.id}
                    onChange={(e) => setNewVehicle({ ...newVehicle, id: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded p-2 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Model / Tipe Kendaraan *</label>
                  <select
                    value={newVehicle.name}
                    onChange={(e) => setNewVehicle({ ...newVehicle, name: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded p-2 focus:outline-none"
                  >
                    <option value="Isuzu Panther">Isuzu Panther</option>
                    <option value="Mitsubishi Strada Triton">Mitsubishi Strada Triton</option>
                    <option value="Toyota Innova Reborn">Toyota Innova Reborn</option>
                    <option value="Toyota Innova Zenix">Toyota Innova Zenix</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Nomor Plat Polisi *</label>
                  <input
                    type="text"
                    required
                    placeholder="B 1234 ABC"
                    value={newVehicle.plat}
                    onChange={(e) => setNewVehicle({ ...newVehicle, plat: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded p-2 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Tanggal Expired STNK</label>
                  <input
                    type="date"
                    value={newVehicle.stnkExpiry}
                    onChange={(e) => setNewVehicle({ ...newVehicle, stnkExpiry: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded p-2 focus:outline-none font-mono"
                  />
                </div>

                <div className="flex items-center space-x-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowAddVehicleModal(false)}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 rounded"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded"
                  >
                    Simpan Unit
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL VERIFIKASI SECURITY PIN MANAGER GA */}
        {showPinModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-indigo-500/40 rounded-2xl p-6 max-w-sm w-full space-y-5 shadow-2xl">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-indigo-950 border border-indigo-500/50 rounded-full flex items-center justify-center mx-auto text-indigo-400">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Verifikasi Keamanan GA</h3>
                <p className="text-xs text-slate-400">Masukkan PIN Keamanan Supervisor untuk mengakses halaman Fleet Manager GA.</p>
              </div>

              <form onSubmit={handlePinSubmit} className="space-y-4">
                <div>
                  <input
                    type="password"
                    maxLength={6}
                    autoFocus
                    placeholder="Masukkan PIN (Default: 1234)"
                    value={pinInput}
                    onChange={(e) => {
                      setPinInput(e.target.value);
                      setPinError('');
                    }}
                    className="w-full text-center text-2xl tracking-[0.5em] font-mono bg-slate-950 border border-slate-700 text-indigo-400 rounded-xl p-3 focus:outline-none focus:border-indigo-500 placeholder:text-slate-600 placeholder:tracking-normal placeholder:text-xs"
                  />
                  {pinError && (
                    <p className="text-rose-400 text-xs text-center mt-2 font-medium flex items-center justify-center space-x-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{pinError}</span>
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPinModal(false)}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2.5 rounded-xl text-xs transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl text-xs shadow-lg shadow-indigo-500/20 transition-all"
                  >
                    Masuk Mode GA
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>

      {/* MODAL INTEGRASI GOOGLE DRIVE / GOOGLE SHEETS */}
      {showDriveModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Cloud className="w-5 h-5 text-emerald-400" />
                <h3 className="text-md font-bold text-white">Integrasi Google Drive & Sheets</h3>
              </div>
              <button 
                onClick={() => setShowDriveModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <p className="text-slate-300 leading-relaxed">
                Anda dapat menyambungkan aplikasi ini secara gratis ke **Google Sheets di Google Drive** Anda menggunakan **Google Apps Script Web App**.
              </p>

              <div>
                <label className="block text-slate-200 font-semibold mb-1">URL Web App Google Apps Script:</label>
                <input
                  type="text"
                  value={googleScriptUrl}
                  onChange={(e) => setGoogleScriptUrl(e.target.value)}
                  placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                  className="w-full bg-slate-800 border border-slate-700 text-emerald-400 text-xs rounded-lg p-2.5 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-[11px] text-slate-400">
                <div className="font-bold text-slate-200">Langkah Singkat Pengaturan:</div>
                <ol className="list-decimal pl-4 space-y-1">
                  <li>Buka Google Drive Anda → Buat **Google Sheets** baru.</li>
                  <li>Klik menu **Ekstensi → Apps Script**.</li>
                  <li>Paste kode script pengirim (dikirimkan oleh sistem).</li>
                  <li>Klik **Terapkan (Deploy) → Sebagai Web App**.</li>
                  <li>Setel akses ke: *"Siapa Saja (Anyone)"*.</li>
                  <li>Salin URL Web App dan tempelkan pada kolom di atas!</li>
                </ol>
              </div>

              <button
                type="button"
                onClick={() => {
                  showToast('URL Google Apps Script disimpan!');
                  setShowDriveModal(false);
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-xs transition-all shadow-md"
              >
                Simpan Konfigurasi Google Drive
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL SHARE LINK & CETAK QR CODE KENDARAAN */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <QrCode className="w-5 h-5 text-indigo-400" />
                <h3 className="text-md font-bold text-white">QR Code & Bagikan Aplikasi</h3>
              </div>
              <button 
                onClick={() => setShowShareModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1.5">Pilih QR Unit Kendaraan untuk Ditempel di Dashboard:</label>
                <select
                  value={selectedQrVehicle}
                  onChange={(e) => setSelectedQrVehicle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-lg p-2.5 font-semibold focus:outline-none focus:border-indigo-500"
                >
                  <option value="ALL">QR Umum / Bebas Pilih Unit (Link Utama)</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>Unit {v.name} ({v.id}) - [{v.plat}]</option>
                  ))}
                </select>
              </div>

              {/* TAMPILAN QR CODE SAMPLES */}
              <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 text-center space-y-3">
                <div className="bg-white p-4 rounded-xl inline-block border-4 border-indigo-500 shadow-xl">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(displayAppUrl)}`} 
                    alt="P2H Fleet QR Code" 
                    className="w-40 h-40 mx-auto"
                  />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">
                    {selectedQrVehicle === 'ALL' ? 'SCAN P2H KENDARAAN OPERASIONAL' : `P2H UNIT: ${selectedQrVehicle}`}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">Tempelkan QR Code ini pada dashboard / kaca depan mobil</p>
                </div>
              </div>

              {/* LINK SALIN & CUSTOM URL INPUT */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] text-slate-300 font-semibold">URL Domain Publik Aplikasi Anda:</label>
                  <span className="text-[10px] text-indigo-400 font-mono">*Wajib Diisi Domain Hosting Publik</span>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={customAppUrl}
                    onChange={(e) => setCustomAppUrl(e.target.value)}
                    placeholder="https://p2h.perusahaananda.com"
                    className="w-full bg-slate-800 border border-slate-700 text-indigo-300 text-xs rounded-lg p-2.5 font-mono focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    onClick={() => copyToClipboard(displayAppUrl)}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3 py-2.5 rounded-lg flex items-center space-x-1 shrink-0 transition-all shadow"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Salin</span>
                  </button>
                </div>
                <div className="p-2.5 bg-indigo-950/40 border border-indigo-500/20 rounded-lg text-[10px] text-slate-300 space-y-1">
                  <div className="font-bold text-indigo-300 flex items-center space-x-1">
                    <span>💡 Mengapa Perlu Memasukkan URL Host?</span>
                  </div>
                  <p>
                    Saat aplikasi dipublikasikan ke layanan hosting (seperti <strong>Vercel, Netlify, Github Pages, atau Server Kantor</strong>), masukkan URL website tersebut di kolom ini agar <strong>QR Code yang dicetak</strong> bisa langsung dibuka oleh HP driver dari mana saja.
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold py-2.5 rounded-xl flex items-center justify-center space-x-2 border border-slate-700 transition-all"
                >
                  <Printer className="w-4 h-4 text-indigo-400" />
                  <span>Cetak Stiker QR Code Mobil</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
