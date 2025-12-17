import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Car, ChevronLeft, ChevronRight, Star, Link } from 'lucide-react';
import { apiService } from '../../services/apiService';

const ServiceScheduling = () => {
    const [serviceCenters, setServiceCenters] = useState(null);
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCenter, setSelectedCenter] = useState(null);
    const [currentWeekStart, setCurrentWeekStart] = useState(getMonday(new Date()));
    const [appointments, setAppointments] = useState([]);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [bookingVehicle, setBookingVehicle] = useState('');
    const [bookingService, setBookingService] = useState('');

    // Mock appointments data
    const mockAppointments = [
        { id: 1, vehicleId: 'VEH001', service: 'Oil Change & Filter', date: '2025-01-20', time: '09:00', duration: 2, center: 'Center_A', color: 'bg-yellow-600' },
        { id: 2, vehicleId: 'VEH004', service: 'Brake Pad Replacement', date: '2025-01-20', time: '11:00', duration: 2, center: 'Center_A', color: 'bg-yellow-700' },
        { id: 3, vehicleId: 'VEH007', service: 'Full Service', date: '2025-01-21', time: '10:00', duration: 3, center: 'Center_B', color: 'bg-teal-600' },
        { id: 4, vehicleId: 'VEH003', service: 'Engine Diagnostics', date: '2025-01-22', time: '09:00', duration: 1, center: 'Center_A', color: 'bg-blue-600' },
        { id: 5, vehicleId: 'VEH002', service: 'AC Service', date: '2025-01-23', time: '14:00', duration: 2, center: 'Center_B', color: 'bg-purple-600' },
    ];

    // Service center enhanced data
    const centerDetails = {
        'Center_A': {
            name: 'AutoCare Mumbai - Andheri',
            address: 'Andheri West, Mumbai',
            rating: 4.8,
            capacity: { current: 7, total: 12 },
            hours: '8:00 AM - 8:00 PM',
            specialists: ['Engine', 'Transmission', 'Electrical']
        },
        'Center_B': {
            name: 'AutoCare Delhi - Gurgaon',
            address: 'Sector 29, Gurgaon',
            rating: 4.6,
            capacity: { current: 13, total: 15 },
            hours: '8:00 AM - 9:00 PM',
            specialists: ['Engine', 'Body Work', 'AC Service']
        }
    };

    function getMonday(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(d.setDate(diff));
    }

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [centers, vehicleList] = await Promise.all([
                apiService.getServiceCenters(),
                apiService.getVehicles()
            ]);
            setServiceCenters(centers);
            setVehicles(vehicleList);
            setAppointments(mockAppointments);
            if (centers.centers) {
                setSelectedCenter(Object.keys(centers.centers)[0]);
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
            // Use mock data if API fails
            setAppointments(mockAppointments);
        } finally {
            setLoading(false);
        }
    };

    const getWeekDays = () => {
        const days = [];
        const start = new Date(currentWeekStart);
        for (let i = 0; i < 7; i++) {
            const day = new Date(start);
            day.setDate(start.getDate() + i);
            days.push(day);
        }
        return days;
    };

    const formatDateKey = (date) => {
        return date.toISOString().split('T')[0];
    };

    const navigateWeek = (direction) => {
        const newStart = new Date(currentWeekStart);
        newStart.setDate(newStart.getDate() + (direction * 7));
        setCurrentWeekStart(newStart);
    };

    const goToToday = () => {
        setCurrentWeekStart(getMonday(new Date()));
    };

    const getAppointmentsForSlot = (date, hour) => {
        const dateStr = formatDateKey(date);
        const timeStr = hour.toString().padStart(2, '0') + ':00';
        return appointments.filter(apt => 
            apt.date === dateStr && 
            apt.time === timeStr &&
            (!selectedCenter || apt.center === selectedCenter)
        );
    };

    const isToday = (date) => {
        const today = new Date();
        return formatDateKey(date) === formatDateKey(today);
    };

    const handleSlotClick = (date, hour) => {
        setSelectedSlot({ date: formatDateKey(date), time: `${hour.toString().padStart(2, '0')}:00` });
        setShowBookingModal(true);
    };

    const handleBookAppointment = async () => {
        if (!bookingVehicle || !selectedSlot) return;

        const newAppointment = {
            id: appointments.length + 1,
            vehicleId: bookingVehicle,
            service: bookingService || 'General Service',
            date: selectedSlot.date,
            time: selectedSlot.time,
            duration: 1,
            center: selectedCenter,
            color: 'bg-green-600'
        };

        try {
            await apiService.scheduleService(bookingVehicle);
        } catch (error) {
            console.error('API call failed, using local state');
        }

        setAppointments([...appointments, newAppointment]);
        setShowBookingModal(false);
        setBookingVehicle('');
        setBookingService('');
        setSelectedSlot(null);
    };

    const timeSlots = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
    const weekDays = getWeekDays();
    const currentMonth = weekDays[3].toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    if (loading) {
        return (
            <div className="flex-1 p-8 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading scheduling data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 p-6 overflow-y-auto">
            {/* Service Centers Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {Object.entries(centerDetails).map(([key, center]) => (
                    <div
                        key={key}
                        onClick={() => setSelectedCenter(key)}
                        className={`glass-panel p-5 cursor-pointer transition-all ${
                            selectedCenter === key
                                ? 'border-2 border-primary shadow-[0_0_20px_rgba(0,240,255,0.2)]'
                                : 'border-2 border-transparent hover:border-white/20'
                        }`}
                    >
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h3 className="text-lg font-semibold text-white">{center.name}</h3>
                                <div className="flex items-center gap-1 text-gray-400 text-sm mt-1">
                                    <MapPin size={14} />
                                    {center.address}
                                </div>
                            </div>
                            <div className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 rounded-lg">
                                <Star size={14} className="text-yellow-500 fill-yellow-500" />
                                <span className="text-yellow-500 font-medium">{center.rating}</span>
                            </div>
                        </div>

                        {/* Capacity Bar */}
                        <div className="mb-3">
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-400">Capacity</span>
                                <span className="text-white">{center.capacity.current}/{center.capacity.total}</span>
                            </div>
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all ${
                                        center.capacity.current / center.capacity.total > 0.8 
                                            ? 'bg-red-500' 
                                            : center.capacity.current / center.capacity.total > 0.5 
                                            ? 'bg-yellow-500' 
                                            : 'bg-green-500'
                                    }`}
                                    style={{ width: `${(center.capacity.current / center.capacity.total) * 100}%` }}
                                />
                            </div>
                        </div>

                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-gray-500 text-xs">Hours</p>
                                <p className="text-white text-sm">{center.hours}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 text-xs mb-1">Specialists</p>
                                <div className="flex gap-1 flex-wrap">
                                    {center.specialists.map((spec, idx) => (
                                        <span
                                            key={idx}
                                            className="px-2 py-0.5 bg-primary/20 text-primary text-xs rounded border border-primary/30"
                                        >
                                            {spec}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Calendar Header */}
            <div className="glass-panel p-4 mb-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Calendar size={24} className="text-primary" />
                        <h2 className="text-xl font-semibold text-white">{currentMonth}</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => navigateWeek(-1)}
                            className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                        >
                            <ChevronLeft size={20} className="text-gray-400" />
                        </button>
                        <button
                            onClick={goToToday}
                            className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/80 transition-colors"
                        >
                            Today
                        </button>
                        <button
                            onClick={() => navigateWeek(1)}
                            className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                        >
                            <ChevronRight size={20} className="text-gray-400" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="glass-panel overflow-hidden">
                {/* Day Headers */}
                <div className="grid grid-cols-8 border-b border-white/10">
                    <div className="p-3 text-center text-gray-500 text-sm border-r border-white/10">
                        Time
                    </div>
                    {weekDays.map((day, idx) => (
                        <div
                            key={idx}
                            className={`p-3 text-center border-r border-white/10 last:border-r-0 ${
                                isToday(day) ? 'bg-primary/10' : ''
                            }`}
                        >
                            <p className={`text-sm ${isToday(day) ? 'text-primary' : 'text-gray-400'}`}>
                                {day.toLocaleDateString('en-US', { weekday: 'short' })}
                            </p>
                            <p className={`text-xl font-bold ${isToday(day) ? 'text-primary' : 'text-white'}`}>
                                {day.getDate()}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Time Slots */}
                <div className="max-h-[500px] overflow-y-auto">
                    {timeSlots.map((hour) => (
                        <div key={hour} className="grid grid-cols-8 border-b border-white/5 last:border-b-0">
                            {/* Time Label */}
                            <div className="p-3 text-gray-500 text-sm border-r border-white/10 flex items-start justify-center">
                                {hour.toString().padStart(2, '0')}:00
                            </div>

                            {/* Day Cells */}
                            {weekDays.map((day, dayIdx) => {
                                const dayAppointments = getAppointmentsForSlot(day, hour);
                                
                                return (
                                    <div
                                        key={dayIdx}
                                        onClick={() => handleSlotClick(day, hour)}
                                        className={`min-h-[60px] p-1 border-r border-white/5 last:border-r-0 cursor-pointer hover:bg-white/5 transition-colors ${
                                            isToday(day) ? 'bg-primary/5' : ''
                                        }`}
                                    >
                                        {dayAppointments.map((apt) => (
                                            <div
                                                key={apt.id}
                                                className={`${apt.color} rounded-lg p-2 mb-1 cursor-pointer hover:opacity-80 transition-opacity`}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <div className="flex items-center gap-1 text-white text-xs font-medium">
                                                    <Link size={10} />
                                                    {apt.vehicleId}
                                                </div>
                                                <p className="text-white/80 text-xs truncate">
                                                    {apt.service}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

            {/* Booking Modal */}
            {showBookingModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div className="glass-panel p-6 max-w-md w-full mx-4">
                        <h3 className="text-xl font-semibold text-white mb-4">Book Appointment</h3>
                        
                        <div className="mb-4">
                            <p className="text-gray-400 text-sm mb-1">Selected Slot</p>
                            <p className="text-white font-medium">
                                {selectedSlot && new Date(selectedSlot.date).toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    month: 'long',
                                    day: 'numeric'
                                })} at {selectedSlot?.time}
                            </p>
                        </div>

                        <div className="mb-4">
                            <label className="text-gray-400 text-sm mb-2 block">Select Vehicle</label>
                            <select
                                value={bookingVehicle}
                                onChange={(e) => setBookingVehicle(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary"
                            >
                                <option value="" className="bg-gray-900">Choose vehicle...</option>
                                {vehicles.map((v) => (
                                    <option key={v.id} value={v.id} className="bg-gray-900">
                                        {v.id} - {v.model} ({v.owner})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-6">
                            <label className="text-gray-400 text-sm mb-2 block">Service Type</label>
                            <select
                                value={bookingService}
                                onChange={(e) => setBookingService(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary"
                            >
                                <option value="" className="bg-gray-900">Select service...</option>
                                <option value="Oil Change & Filter" className="bg-gray-900">Oil Change & Filter</option>
                                <option value="Brake Pad Replacement" className="bg-gray-900">Brake Pad Replacement</option>
                                <option value="Full Service" className="bg-gray-900">Full Service</option>
                                <option value="Engine Diagnostics" className="bg-gray-900">Engine Diagnostics</option>
                                <option value="AC Service" className="bg-gray-900">AC Service</option>
                                <option value="Battery Check" className="bg-gray-900">Battery Check</option>
                                <option value="Tire Service" className="bg-gray-900">Tire Service</option>
                            </select>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowBookingModal(false);
                                    setSelectedSlot(null);
                                    setBookingVehicle('');
                                    setBookingService('');
                                }}
                                className="flex-1 py-3 bg-white/10 border border-white/20 rounded-lg text-gray-300 hover:bg-white/20 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleBookAppointment}
                                disabled={!bookingVehicle}
                                className="flex-1 py-3 bg-gradient-to-r from-primary to-blue-600 text-white rounded-lg font-medium hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Book Appointment
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ServiceScheduling;
