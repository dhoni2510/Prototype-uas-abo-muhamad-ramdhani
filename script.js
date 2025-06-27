// script.js

// --- Data Aplikasi (Simulasi Database) ---
// Data akan dimuat dari localStorage jika ada, jika tidak, data default akan digunakan.
// Perubahan pada data melalui UI Admin akan disimpan kembali ke localStorage.
let users = JSON.parse(localStorage.getItem('users')) || {
    'admin': { password: '123', role: 'admin' }, // Mengubah password dan role
    'dokter': { password: '123', role: 'dokter', doctorId: 'D001', name: 'Dr. Budi' }, // Mengubah password dan role
    'dokter': { password: '123', role: 'dokter', doctorId: 'D002', name: 'Dr. Siti' }, // Mengubah password dan role
    'pasien1': { password: '123', role: 'patient', name: 'Budi Santoso', email: 'budi@example.com' } // Mengubah password dan role
};

let patientsData = JSON.parse(localStorage.getItem('patientsData')) || [
    { id: 'P001', name: 'doni tamara', dob: '2004-09-25', address: 'Jl. h.lebar No. 10' },
    { id: 'P002', name: 'dani aja', dob: '2004-10-25', address: 'Jl. meruya No. 5' }
];

let doctorsData = JSON.parse(localStorage.getItem('doctorsData')) || [
    { id: 'D001', name: 'Dr. Budi', polyclinic: 'Poli Umum' },
    { id: 'D002', name: 'Dr. Siti', polyclinic: 'Poli Gigi' },
    { id: 'D003', name: 'Dr. Anisa', polyclinic: 'Poli Penyakit Dalam' },
    { id: 'D004', name: 'Dr. Citra', polyclinic: 'Poli Kebidanan' }
];

let polyclinicsData = JSON.parse(localStorage.getItem('polyclinicsData')) || [
    { id: 'POLY001', name: 'Poli Umum' },
    { id: 'POLY002', name: 'Poli Gigi' },
    { id: 'POLY003', name: 'Poli Penyakit Dalam' },
    { id: 'POLY004', name: 'Poli Kebidanan' }
];

let doctorScheduleQuotaData = JSON.parse(localStorage.getItem('doctorScheduleQuotaData')) || [
    { doctorId: 'D001', doctorName: 'Dr. Budi', polyclinic: 'Poli Umum', date: '2025-07-10', time: '09:00', quota: 10, booked: 2 },
    { doctorId: 'D001', doctorName: 'Dr. Budi', polyclinic: 'Poli Umum', date: '2025-07-11', time: '10:00', quota: 8, booked: 0 },
    { doctorId: 'D002', doctorName: 'Dr. Siti', polyclinic: 'Poli Gigi', date: '2025-07-10', time: '14:00', quota: 5, booked: 1 },
    { doctorId: 'D003', doctorName: 'Dr. Anisa', polyclinic: 'Poli Penyakit Dalam', date: '2025-07-12', time: '08:30', quota: 7, booked: 3 }
];

let appointmentsData = JSON.parse(localStorage.getItem('appointmentsData')) || [
    { id: 'A001', patientUsername: 'pasien', patientName: 'doni tamara', polyclinic: 'Poli Umum', doctorId: 'D001', doctorName: 'Dr. Budi', date: '2025-07-10', time: '09:00', status: 'Dikonfirmasi', queueNumber: null },
    { id: 'A002', patientUsername: 'pasien', patientName: 'dani aja', polyclinic: 'Poli Gigi', doctorId: 'D002', doctorName: 'Dr. Siti', date: '2025-07-15', time: '14:00', status: 'Pending', queueNumber: null }
];

let currentUser = null; // Menyimpan pengguna yang sedang login

// --- Fungsi Utilitas ---
function showSection(sectionId) {
    document.querySelectorAll('div[id$="-section"], div[id$="-dashboard"], #login-section, #register-section').forEach(section => {
        section.classList.add('hidden');
    });
    document.getElementById(sectionId).classList.remove('hidden');
}

function showMessage(elementId, message, isError = false) {
    const element = document.getElementById(elementId);
    element.textContent = message;
    element.classList.remove('hidden');
    if (isError) {
        element.style.color = 'red';
    } else {
        element.style.color = 'green';
    }
    setTimeout(() => {
        element.classList.add('hidden');
        element.textContent = '';
    }, 5000);
}

function saveData() {
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('patientsData', JSON.stringify(patientsData));
    localStorage.setItem('doctorsData', JSON.stringify(doctorsData));
    localStorage.setItem('polyclinicsData', JSON.stringify(polyclinicsData));
    localStorage.setItem('doctorScheduleQuotaData', JSON.stringify(doctorScheduleQuotaData));
    localStorage.setItem('appointmentsData', JSON.stringify(appointmentsData));
}

function generateId(prefix, dataArray) {
    const lastIdNum = dataArray.length > 0 ? Math.max(...dataArray.map(item => parseInt(item.id.replace(prefix, '')) || 0)) : 0;
    return `${prefix}${(lastIdNum + 1).toString().padStart(3, '0')}`;
}


// --- Login dan Registrasi ---
function handleLogin() {
    const usernameInput = document.getElementById('username').value;
    const passwordInput = document.getElementById('password').value;
    const loginMessage = document.getElementById('login-message');

    if (users[usernameInput] && users[usernameInput].password === passwordInput) {
        currentUser = { username: usernameInput, role: users[usernameInput].role, name: users[usernameInput].name || usernameInput, doctorId: users[usernameInput].doctorId };
        loginMessage.classList.add('hidden'); // Sembunyikan pesan kesalahan
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';

        if (currentUser.role === 'admin') {
            showAdminDashboard();
        } else if (currentUser.role === 'patient') { // Menggunakan 'patient'
            showPatientDashboard();
        } else if (currentUser.role === 'doctor') { // Menggunakan 'doctor'
            showDoctorDashboard();
        }
    } else {
        showMessage('login-message', 'Nama pengguna atau kata sandi salah!', true);
    }
}

function showRegister() {
    showSection('register-section');
    document.getElementById('login-message').classList.add('hidden');
}

function showLogin() {
    showSection('login-section');
    document.getElementById('register-message').classList.add('hidden');
}

function handleRegister() {
    const regName = document.getElementById('reg-name').value;
    const regEmail = document.getElementById('reg-email').value;
    const regUsername = document.getElementById('reg-username').value;
    const regPassword = document.getElementById('reg-password').value;
    const registerMessage = document.getElementById('register-message');

    if (!regName || !regEmail || !regUsername || !regPassword) {
        showMessage('register-message', 'Semua field harus diisi!', true);
        return;
    }
    if (users[regUsername]) {
        showMessage('register-message', 'Nama pengguna sudah ada!', true);
        return;
    }

    users[regUsername] = {
        password: regPassword,
        role: 'patient', // Menggunakan 'patient'
        name: regName,
        email: regEmail
    };

    // Tambahkan pasien baru ke patientsData juga
    patientsData.push({
        id: generateId('P', patientsData),
        name: regName,
        dob: '', // Pasien bisa mengisi ini nanti di profil
        address: '', // Pasien bisa mengisi ini nanti di profil
        username: regUsername // Kaitkan dengan username
    });

    saveData();
    showMessage('register-message', 'Pendaftaran berhasil! Silakan masuk.');
    // Kosongkan field
    document.getElementById('reg-name').value = '';
    document.getElementById('reg-email').value = '';
    document.getElementById('reg-username').value = '';
    document.getElementById('reg-password').value = '';
    showSection('login-section');
}

function logout() {
    currentUser = null;
    showSection('login-section');
}


// --- Dashboard Pasien ---
function showPatientDashboard() {
    showSection('patient-dashboard');
}

function showMakeAppointment() {
    showSection('make-appointment-section');
    loadPolyclinicsForAppointment();
    document.getElementById('doctor-select').innerHTML = '<option value="">-- Pilih Dokter --</option>'; // Reset dokter
    document.getElementById('appointment-message').classList.add('hidden'); // Clear previous messages
}

function loadPolyclinicsForAppointment() {
    const poliSelect = document.getElementById('poli-select');
    poliSelect.innerHTML = '<option value="">-- Pilih Poliklinik --</option>';
    polyclinicsData.forEach(poli => {
        const option = document.createElement('option');
        option.value = poli.name;
        option.textContent = poli.name;
        poliSelect.appendChild(option);
    });
}

function loadDoctors() {
    const poliSelect = document.getElementById('poli-select');
    const doctorSelect = document.getElementById('doctor-select');
    const selectedPoli = poliSelect.value;

    doctorSelect.innerHTML = '<option value="">-- Pilih Dokter --</option>'; // Reset
    if (selectedPoli) {
        const filteredDoctors = doctorsData.filter(doctor => doctor.polyclinic === selectedPoli);
        filteredDoctors.forEach(doctor => {
            const option = document.createElement('option');
            option.value = doctor.id;
            option.textContent = doctor.name;
            doctorSelect.appendChild(option);
        });
    }
}

function submitAppointment() {
    const poliName = document.getElementById('poli-select').value;
    const doctorId = document.getElementById('doctor-select').value;
    const appointmentDate = document.getElementById('appointment-date').value;
    const appointmentTime = document.getElementById('appointment-time').value;
    const appointmentMessage = document.getElementById('appointment-message');

    if (!poliName || !doctorId || !appointmentDate || !appointmentTime) {
        showMessage('appointment-message', 'Harap lengkapi semua field!', true);
        return;
    }

    const doctor = doctorsData.find(d => d.id === doctorId);
    if (!doctor) {
        showMessage('appointment-message', 'Dokter tidak ditemukan!', true);
        return;
    }

    // Cek ketersediaan kuota
    const scheduleEntry = doctorScheduleQuotaData.find(
        s => s.doctorId === doctorId && s.date === appointmentDate && s.time === appointmentTime
    );

    if (!scheduleEntry) {
        showMessage('appointment-message', `Jadwal untuk ${doctor.name} pada ${appointmentDate} jam ${appointmentTime} tidak tersedia.`, true);
        return;
    }

    if (scheduleEntry.booked >= scheduleEntry.quota) {
        showMessage('appointment-message', `Kuota untuk ${doctor.name} pada jadwal ini sudah penuh.`, true);
        return;
    }

    // Buat janji
    const newAppointmentId = generateId('A', appointmentsData);
    const newAppointment = {
        id: newAppointmentId,
        patientUsername: currentUser.username,
        patientName: currentUser.name,
        polyclinic: poliName,
        doctorId: doctorId,
        doctorName: doctor.name,
        date: appointmentDate,
        time: appointmentTime,
        status: 'Pending', // Awalnya pending, bisa diubah oleh admin
        queueNumber: null // Nomor antrian diberikan saat konfirmasi atau kedatangan
    };
    appointmentsData.push(newAppointment);

    // Tambah booked count
    scheduleEntry.booked++;

    saveData();
    showMessage('appointment-message', 'Perjanjian berhasil diajukan! Menunggu konfirmasi.');

    // Reset form
    document.getElementById('poli-select').value = '';
    document.getElementById('doctor-select').innerHTML = '<option value="">-- Pilih Dokter --</option>';
    document.getElementById('appointment-date').value = '';
    document.getElementById('appointment-time').value = '';
}

function showPatientScheduleAndQueue() {
    showSection('patient-schedule-queue-section');
    displayPatientAppointments();
}

function displayPatientAppointments() {
    const patientAppointmentsList = document.getElementById('patient-appointments-list');
    patientAppointmentsList.innerHTML = '';

    const patientAppointments = appointmentsData.filter(app => app.patientUsername === currentUser.username);

    if (patientAppointments.length === 0) {
        patientAppointmentsList.innerHTML = '<li>Tidak ada perjanjian yang terjadwal.</li>';
        return;
    }

    patientAppointments.sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateA - dateB;
    });

    patientAppointments.forEach(app => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `<strong>${app.date}, ${app.time}:</strong> ${app.doctorName} (${app.polyclinic}) - Status: ${app.status}`;
        if (app.status === 'Dikonfirmasi' && app.queueNumber) {
            listItem.innerHTML += `, No. Antrian: ${app.queueNumber}`;
        }
        patientAppointmentsList.appendChild(listItem);
    });

    // Simulasi status antrian
    const queueStatusParagraph = document.querySelector('#patient-schedule-queue-section p:nth-of-type(2)');
    const today = new Date().toISOString().split('T')[0];
    const todayAppointments = patientAppointments.filter(app => app.date === today && app.status === 'Dikonfirmasi');

    if (todayAppointments.length > 0) {
        let statusText = 'Nomor antrian perkiraan Anda untuk perjanjian hari ini:';
        todayAppointments.forEach(app => {
            // Simulasi nomor antrian dan waktu tunggu
            const simulatedQueueNumber = app.id.replace('A', ''); // Contoh sederhana
            const simulatedWaitTime = '15-30 menit'; // Contoh
            statusText += `<br>Untuk ${app.doctorName} (${app.polyclinic}), perkiraan waktu tunggu: <strong>${simulatedWaitTime}</strong>, No. Antrian Anda: <strong>${simulatedQueueNumber}</strong>.`;
        });
        queueStatusParagraph.innerHTML = statusText;
    } else {
        queueStatusParagraph.innerHTML = 'Nomor antrian perkiraan Anda untuk perjanjian hari ini (jika ada): <strong>Tidak Berlaku</strong> (Tidak ada perjanjian hari ini atau tanggal kunjungan di masa depan)';
    }
}

function showDoctorSchedulePerPolyclinic() {
    showSection('doctor-schedule-per-polyclinic-section');
    loadPolyclinicsForScheduleView();
    document.getElementById('doctor-schedules-display').innerHTML = '<p>Pilih poliklinik untuk melihat jadwal dokter.</p>';
}

function loadPolyclinicsForScheduleView() {
    const poliSelect = document.getElementById('poli-schedule-select');
    poliSelect.innerHTML = '<option value="">-- Pilih Poliklinik --</option>';
    polyclinicsData.forEach(poli => {
        const option = document.createElement('option');
        option.value = poli.name;
        option.textContent = poli.name;
        poliSelect.appendChild(option);
    });
}

function displayDoctorSchedules() {
    const selectedPoli = document.getElementById('poli-schedule-select').value;
    const displayDiv = document.getElementById('doctor-schedules-display');
    displayDiv.innerHTML = '';

    if (!selectedPoli) {
        displayDiv.innerHTML = '<p>Pilih poliklinik untuk melihat jadwal dokter.</p>';
        return;
    }

    const filteredSchedules = doctorScheduleQuotaData.filter(
        schedule => schedule.polyclinic === selectedPoli
    );

    if (filteredSchedules.length === 0) {
        displayDiv.innerHTML = `<p>Tidak ada jadwal dokter tersedia untuk ${selectedPoli}.</p>`;
        return;
    }

    const table = document.createElement('table');
    table.innerHTML = `
        <thead>
            <tr>
                <th>Dokter</th>
                <th>Tanggal</th>
                <th>Waktu</th>
                <th>Kuota Tersedia</th>
            </tr>
        </thead>
        <tbody>
        </tbody>
    `;
    const tbody = table.querySelector('tbody');

    filteredSchedules.sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateA - dateB;
    });

    filteredSchedules.forEach(schedule => {
        const row = tbody.insertRow();
        row.insertCell().textContent = schedule.doctorName;
        row.insertCell().textContent = schedule.date;
        row.insertCell().textContent = schedule.time;
        row.insertCell().textContent = `${schedule.quota - schedule.booked} / ${schedule.quota}`;
    });

    displayDiv.appendChild(table);
}

// --- Dashboard Dokter ---
function showDoctorDashboard() {
    showSection('doctor-dashboard');
}

function showDoctorWeeklySchedule() {
    showSection('doctor-weekly-schedule-section');
    displayDoctorWeeklySchedule();
}

function displayDoctorWeeklySchedule() {
    const weeklyScheduleTableBody = document.querySelector('#weekly-schedule-table tbody');
    weeklyScheduleTableBody.innerHTML = '';

    const doctorId = currentUser.doctorId;
    if (!doctorId) {
        weeklyScheduleTableBody.innerHTML = '<tr><td colspan="3">Data dokter tidak ditemukan untuk akun ini.</td></tr>';
        return;
    }

    const doctorSchedules = doctorScheduleQuotaData.filter(schedule => schedule.doctorId === doctorId);

    if (doctorSchedules.length === 0) {
        weeklyScheduleTableBody.innerHTML = '<tr><td colspan="3">Tidak ada jadwal praktik yang terdaftar untuk Anda.</td></tr>';
        return;
    }

    // Group schedules by day for a more readable weekly view
    const schedulesByDay = {};
    doctorSchedules.forEach(schedule => {
        const dateObj = new Date(schedule.date);
        const dayOfWeek = dateObj.toLocaleDateString('id-ID', { weekday: 'long' });
        if (!schedulesByDay[dayOfWeek]) {
            schedulesByDay[dayOfWeek] = [];
        }
        schedulesByDay[dayOfWeek].push(schedule);
    });

    const daysOrder = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

    daysOrder.forEach(day => {
        if (schedulesByDay[day]) {
            schedulesByDay[day].sort((a, b) => a.time.localeCompare(b.time)); // Sort by time
            schedulesByDay[day].forEach((schedule, index) => {
                const row = weeklyScheduleTableBody.insertRow();
                if (index === 0) { // Only put day once for multiple entries
                    row.insertCell().textContent = day;
                } else {
                    row.insertCell().textContent = '';
                }
                row.insertCell().textContent = `${schedule.time}`; // Display only time for now
                row.insertCell().textContent = schedule.polyclinic;
            });
        } else {
            const row = weeklyScheduleTableBody.insertRow();
            row.insertCell().textContent = day;
            row.insertCell().textContent = 'Libur';
            row.insertCell().textContent = '-';
        }
    });
}


function showDoctorPatientList() {
    showSection('doctor-patient-list-section');
    document.getElementById('schedule-date-select').value = ''; // Reset date input
    document.getElementById('patient-list-display').innerHTML = '<p>Pilih tanggal untuk melihat daftar pasien.</p>';
}

function displayPatientList() {
    const selectedDate = document.getElementById('schedule-date-select').value;
    const patientListDisplay = document.getElementById('patient-list-display');
    patientListDisplay.innerHTML = '';

    const doctorId = currentUser.doctorId;
    if (!doctorId) {
        patientListDisplay.innerHTML = '<p>Data dokter tidak ditemukan untuk akun ini.</p>';
        return;
    }

    if (!selectedDate) {
        patientListDisplay.innerHTML = '<p>Pilih tanggal untuk melihat daftar pasien.</p>';
        return;
    }

    const patientsForDoctorOnDate = appointmentsData.filter(app =>
        app.doctorId === doctorId && app.date === selectedDate && app.status === 'Dikonfirmasi' // Only confirmed appointments
    );

    if (patientsForDoctorOnDate.length === 0) {
        patientListDisplay.innerHTML = `<p>Tidak ada pasien terjadwal untuk Anda pada tanggal ${selectedDate}.</p>`;
        return;
    }

    const table = document.createElement('table');
    table.innerHTML = `
        <thead>
            <tr>
                <th>Waktu</th>
                <th>Nama Pasien</th>
                <th>Poliklinik</th>
                <th>Status</th>
                <th>No. Antrian</th>
            </tr>
        </thead>
        <tbody>
        </tbody>
    `;
    const tbody = table.querySelector('tbody');

    patientsForDoctorOnDate.sort((a, b) => a.time.localeCompare(b.time));

    patientsForDoctorOnDate.forEach((patient, index) => {
        const row = tbody.insertRow();
        row.insertCell().textContent = patient.time;
        row.insertCell().textContent = patient.patientName;
        row.insertCell().textContent = patient.polyclinic;
        row.insertCell().textContent = patient.status;
        row.insertCell().textContent = patient.queueNumber || (index + 1); // Assign simple queue number if not set
    });

    patientListDisplay.appendChild(table);
}


// --- Dashboard Admin RS ---
function showAdminDashboard() {
    showSection('admin-dashboard');
}

// Admin - Kelola Data Pasien
function showAdminManagePatientData() {
    showSection('admin-manage-patient-data-section');
    displayPatients();
    document.getElementById('admin-patient-message').classList.add('hidden');
    document.getElementById('edit-patient-form').classList.add('hidden');
    document.getElementById('edit-patient-title').classList.add('hidden');

    // Clear add form
    document.getElementById('new-patient-id').value = '';
    document.getElementById('new-patient-name').value = '';
    document.getElementById('new-patient-dob').value = '';
    document.getElementById('new-patient-address').value = '';
}

function displayPatients() {
    const patientListTableBody = document.querySelector('#patient-list-table tbody');
    patientListTableBody.innerHTML = '';
    patientsData.forEach(patient => {
        const row = patientListTableBody.insertRow();
        row.insertCell().textContent = patient.id;
        row.insertCell().textContent = patient.name;
        row.insertCell().textContent = patient.dob;
        row.insertCell().textContent = patient.address;
        const actionCell = row.insertCell();
        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.onclick = () => showEditPatientForm(patient.id);
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Hapus';
        deleteButton.onclick = () => deletePatient(patient.id);
        actionCell.appendChild(editButton);
        actionCell.appendChild(deleteButton);
    });
}

function addPatient() {
    const id = document.getElementById('new-patient-id').value.trim();
    const name = document.getElementById('new-patient-name').value.trim();
    const dob = document.getElementById('new-patient-dob').value;
    const address = document.getElementById('new-patient-address').value.trim();

    if (!id || !name || !dob || !address) {
        showMessage('admin-patient-message', 'Semua field harus diisi!', true);
        return;
    }
    if (patientsData.some(p => p.id === id)) {
        showMessage('admin-patient-message', 'ID Pasien sudah ada!', true);
        return;
    }

    patientsData.push({ id, name, dob, address });
    saveData();
    displayPatients();
    showMessage('admin-patient-message', 'Pasien berhasil ditambahkan!');

    // Clear form
    document.getElementById('new-patient-id').value = '';
    document.getElementById('new-patient-name').value = '';
    document.getElementById('new-patient-dob').value = '';
    document.getElementById('new-patient-address').value = '';
}

function showEditPatientForm(patientId) {
    const patient = patientsData.find(p => p.id === patientId);
    if (patient) {
        document.getElementById('edit-patient-title').classList.remove('hidden');
        document.getElementById('edit-patient-form').classList.remove('hidden');
        document.getElementById('edit-patient-original-id').value = patient.id;
        document.getElementById('edit-patient-id').value = patient.id;
        document.getElementById('edit-patient-name').value = patient.name;
        document.getElementById('edit-patient-dob').value = patient.dob;
        document.getElementById('edit-patient-address').value = patient.address;
    }
}

function updatePatient() {
    const originalId = document.getElementById('edit-patient-original-id').value;
    const newId = document.getElementById('edit-patient-id').value.trim();
    const newName = document.getElementById('edit-patient-name').value.trim();
    const newDob = document.getElementById('edit-patient-dob').value;
    const newAddress = document.getElementById('edit-patient-address').value.trim();

    if (!newId || !newName || !newDob || !newAddress) {
        showMessage('admin-patient-message', 'Semua field harus diisi!', true);
        return;
    }
    if (newId !== originalId && patientsData.some(p => p.id === newId)) {
        showMessage('admin-patient-message', 'ID Pasien baru sudah ada!', true);
        return;
    }

    const patientIndex = patientsData.findIndex(p => p.id === originalId);
    if (patientIndex > -1) {
        patientsData[patientIndex] = { id: newId, name: newName, dob: newDob, address: newAddress };
        saveData();
        displayPatients();
        showMessage('admin-patient-message', 'Data pasien berhasil diperbarui!');
        cancelEditPatient();
    } else {
        showMessage('admin-patient-message', 'Pasien tidak ditemukan!', true);
    }
}

function cancelEditPatient() {
    document.getElementById('edit-patient-form').classList.add('hidden');
    document.getElementById('edit-patient-title').classList.add('hidden');
    document.getElementById('admin-patient-message').classList.add('hidden');
}

function deletePatient(patientId) {
    if (confirm('Apakah Anda yakin ingin menghapus pasien ini?')) {
        patientsData = patientsData.filter(p => p.id !== patientId);
        // Juga hapus appointment yang terkait dengan pasien ini
        appointmentsData = appointmentsData.filter(app => app.patientUsername !== patientId); // Asumsi patientId sama dengan patientUsername di appointments
        saveData();
        displayPatients();
        showMessage('admin-patient-message', 'Pasien berhasil dihapus!');
    }
}


// Admin - Kelola Data Dokter
function showAdminManageDoctorData() {
    showSection('admin-manage-doctor-data-section');
    displayDoctors();
    document.getElementById('admin-doctor-message').classList.add('hidden');
    document.getElementById('edit-doctor-form').classList.add('hidden');
    document.getElementById('edit-doctor-title').classList.add('hidden');

    // Clear add form
    document.getElementById('new-doctor-id').value = '';
    document.getElementById('new-doctor-name').value = '';
    document.getElementById('new-doctor-polyclinic').value = '';
}

function displayDoctors() {
    const doctorListTableBody = document.querySelector('#doctor-list-table tbody');
    doctorListTableBody.innerHTML = '';
    doctorsData.forEach(doctor => {
        const row = doctorListTableBody.insertRow();
        row.insertCell().textContent = doctor.id;
        row.insertCell().textContent = doctor.name;
        row.insertCell().textContent = doctor.polyclinic;
        const actionCell = row.insertCell();
        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.onclick = () => showEditDoctorForm(doctor.id);
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Hapus';
        deleteButton.onclick = () => deleteDoctor(doctor.id);
        actionCell.appendChild(editButton);
        actionCell.appendChild(deleteButton);
    });
}

function addDoctor() {
    const id = document.getElementById('new-doctor-id').value.trim();
    const name = document.getElementById('new-doctor-name').value.trim();
    const polyclinic = document.getElementById('new-doctor-polyclinic').value;

    if (!id || !name || !polyclinic) {
        showMessage('admin-doctor-message', 'Semua field harus diisi!', true);
        return;
    }
    if (doctorsData.some(d => d.id === id)) {
        showMessage('admin-doctor-message', 'ID Dokter sudah ada!', true);
        return;
    }

    doctorsData.push({ id, name, polyclinic });
    // Tambahkan juga sebagai user dokter (opsional, tergantung kebutuhan sistem otentikasi)
    // Gunakan id dokter sebagai bagian dari username untuk keunikan
    if (!users[`doctor_${id.toLowerCase()}`]) {
        users[`doctor_${id.toLowerCase()}`] = { password: 'pass', role: 'doctor', doctorId: id, name: name };
    }

    saveData();
    displayDoctors();
    showMessage('admin-doctor-message', 'Dokter berhasil ditambahkan!');

    // Clear form
    document.getElementById('new-doctor-id').value = '';
    document.getElementById('new-doctor-name').value = '';
    document.getElementById('new-doctor-polyclinic').value = '';
}

function showEditDoctorForm(doctorId) {
    const doctor = doctorsData.find(d => d.id === doctorId);
    if (doctor) {
        document.getElementById('edit-doctor-title').classList.remove('hidden');
        document.getElementById('edit-doctor-form').classList.remove('hidden');
        document.getElementById('edit-doctor-original-id').value = doctor.id;
        document.getElementById('edit-doctor-id').value = doctor.id;
        document.getElementById('edit-doctor-name').value = doctor.name;
        document.getElementById('edit-doctor-polyclinic').value = doctor.polyclinic;
    }
}

function updateDoctor() {
    const originalId = document.getElementById('edit-doctor-original-id').value;
    const newId = document.getElementById('edit-doctor-id').value.trim();
    const newName = document.getElementById('edit-doctor-name').value.trim();
    const newPolyclinic = document.getElementById('edit-doctor-polyclinic').value;

    if (!newId || !newName || !newPolyclinic) {
        showMessage('admin-doctor-message', 'Semua field harus diisi!', true);
        return;
    }
    if (newId !== originalId && doctorsData.some(d => d.id === newId)) {
        showMessage('admin-doctor-message', 'ID Dokter baru sudah ada!', true);
        return;
    }

    const doctorIndex = doctorsData.findIndex(d => d.id === originalId);
    if (doctorIndex > -1) {
        doctorsData[doctorIndex] = { id: newId, name: newName, polyclinic: newPolyclinic };

        // Update associated user data if doctor ID changes
        for (const username in users) {
            if (users[username].role === 'doctor' && users[username].doctorId === originalId) {
                users[username].doctorId = newId;
                users[username].name = newName; // Update name in user object
            }
        }

        // Update doctorName in doctorScheduleQuotaData
        doctorScheduleQuotaData.forEach(schedule => {
            if (schedule.doctorId === originalId) {
                schedule.doctorId = newId;
                schedule.doctorName = newName;
            }
        });

        // Update doctorName and doctorId in appointmentsData
        appointmentsData.forEach(appointment => {
            if (appointment.doctorId === originalId) {
                appointment.doctorId = newId;
                appointment.doctorName = newName;
            }
        });


        saveData();
        displayDoctors();
        showMessage('admin-doctor-message', 'Data dokter berhasil diperbarui!');
        cancelEditDoctor();
    } else {
        showMessage('admin-doctor-message', 'Dokter tidak ditemukan!', true);
    }
}

function cancelEditDoctor() {
    document.getElementById('edit-doctor-form').classList.add('hidden');
    document.getElementById('edit-doctor-title').classList.add('hidden');
    document.getElementById('admin-doctor-message').classList.add('hidden');
}

function deleteDoctor(doctorId) {
    if (confirm('Apakah Anda yakin ingin menghapus dokter ini? Menghapus dokter juga akan menghapus jadwal dan membatalkan perjanjian terkait.')) {
        // Hapus dokter dari doctorsData
        doctorsData = doctorsData.filter(d => d.id !== doctorId);
        // Hapus jadwal dokter terkait
        doctorScheduleQuotaData = doctorScheduleQuotaData.filter(s => s.doctorId !== doctorId);
        // Batalkan appointment terkait dokter ini
        appointmentsData = appointmentsData.map(app => {
            if (app.doctorId === doctorId) {
                return { ...app, status: 'Dibatalkan (Dokter Dihapus)' };
            }
            return app;
        });

        // Hapus juga dari user (jika ada user dokter dengan ID ini)
        for (const username in users) {
            if (users[username].role === 'doctor' && users[username].doctorId === doctorId) {
                delete users[username];
            }
        }

        saveData();
        displayDoctors();
        showMessage('admin-doctor-message', 'Dokter berhasil dihapus!');
    }
}

// Admin - Kelola Data Poliklinik
function showAdminManagePolyclinicData() {
    showSection('admin-manage-polyclinic-data-section');
    displayPolyclinics();
    document.getElementById('admin-polyclinic-message').classList.add('hidden');
    document.getElementById('edit-polyclinic-form').classList.add('hidden');
    document.getElementById('edit-polyclinic-title').classList.add('hidden');

    // Clear add form
    document.getElementById('new-polyclinic-id').value = '';
    document.getElementById('new-polyclinic-name').value = '';
}

function displayPolyclinics() {
    const polyclinicListTableBody = document.querySelector('#polyclinic-list-table tbody');
    polyclinicListTableBody.innerHTML = '';
    polyclinicsData.forEach(polyclinic => {
        const row = polyclinicListTableBody.insertRow();
        row.insertCell().textContent = polyclinic.id;
        row.insertCell().textContent = polyclinic.name;
        const actionCell = row.insertCell();
        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.onclick = () => showEditPolyclinicForm(polyclinic.id);
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Hapus';
        deleteButton.onclick = () => deletePolyclinic(polyclinic.id);
        actionCell.appendChild(editButton);
        actionCell.appendChild(deleteButton);
    });
}

function addPolyclinic() {
    const id = document.getElementById('new-polyclinic-id').value.trim();
    const name = document.getElementById('new-polyclinic-name').value.trim();

    if (!id || !name) {
        showMessage('admin-polyclinic-message', 'Semua field harus diisi!', true);
        return;
    }
    if (polyclinicsData.some(p => p.id === id)) {
        showMessage('admin-polyclinic-message', 'ID Poliklinik sudah ada!', true);
        return;
    }

    polyclinicsData.push({ id, name });
    saveData();
    displayPolyclinics();
    showMessage('admin-polyclinic-message', 'Poliklinik berhasil ditambahkan!');

    // Clear form
    document.getElementById('new-polyclinic-id').value = '';
    document.getElementById('new-polyclinic-name').value = '';
}

function showEditPolyclinicForm(polyclinicId) {
    const polyclinic = polyclinicsData.find(p => p.id === polyclinicId);
    if (polyclinic) {
        document.getElementById('edit-polyclinic-title').classList.remove('hidden');
        document.getElementById('edit-polyclinic-form').classList.remove('hidden');
        document.getElementById('edit-polyclinic-original-id').value = polyclinic.id;
        document.getElementById('edit-polyclinic-id').value = polyclinic.id;
        document.getElementById('edit-polyclinic-name').value = polyclinic.name;
    }
}

function updatePolyclinic() {
    const originalId = document.getElementById('edit-polyclinic-original-id').value;
    const newId = document.getElementById('edit-polyclinic-id').value.trim();
    const newName = document.getElementById('edit-polyclinic-name').value.trim();

    if (!newId || !newName) {
        showMessage('admin-polyclinic-message', 'Semua field harus diisi!', true);
        return;
    }
    if (newId !== originalId && polyclinicsData.some(p => p.id === newId)) {
        showMessage('admin-polyclinic-message', 'ID Poliklinik baru sudah ada!', true);
        return;
    }

    const polyclinicIndex = polyclinicsData.findIndex(p => p.id === originalId);
    if (polyclinicIndex > -1) {
        const oldPolyclinicName = polyclinicsData[polyclinicIndex].name;
        polyclinicsData[polyclinicIndex] = { id: newId, name: newName };

        // Update doctors associated with this polyclinic
        doctorsData.forEach(doctor => {
            if (doctor.polyclinic === oldPolyclinicName) {
                doctor.polyclinic = newName;
            }
        });

        // Update doctor schedules associated with this polyclinic
        doctorScheduleQuotaData.forEach(schedule => {
            if (schedule.polyclinic === oldPolyclinicName) {
                schedule.polyclinic = newName;
            }
        });

        // Update appointments associated with this polyclinic
        appointmentsData.forEach(appointment => {
            if (appointment.polyclinic === oldPolyclinicName) {
                appointment.polyclinic = newName;
            }
        });

        saveData();
        displayPolyclinics();
        showMessage('admin-polyclinic-message', 'Data poliklinik berhasil diperbarui!');
        cancelEditPolyclinic();
    } else {
        showMessage('admin-polyclinic-message', 'Poliklinik tidak ditemukan!', true);
    }
}

function cancelEditPolyclinic() {
    document.getElementById('edit-polyclinic-form').classList.add('hidden');
    document.getElementById('edit-polyclinic-title').classList.add('hidden');
    document.getElementById('admin-polyclinic-message').classList.add('hidden');
}

function deletePolyclinic(polyclinicId) {
    if (confirm('Apakah Anda yakin ingin menghapus poliklinik ini? Menghapus poliklinik juga akan menghapus dokter dan jadwal terkait, serta membatalkan perjanjian.')) {
        const polyclinicToDelete = polyclinicsData.find(p => p.id === polyclinicId);
        if (!polyclinicToDelete) {
            showMessage('admin-polyclinic-message', 'Poliklinik tidak ditemukan!', true);
            return;
        }
        const polyclinicName = polyclinicToDelete.name;

        polyclinicsData = polyclinicsData.filter(p => p.id !== polyclinicId);

        // Hapus dokter yang terdaftar di poliklinik ini
        const doctorsToDeleteIds = doctorsData.filter(d => d.polyclinic === polyclinicName).map(d => d.id);
        doctorsData = doctorsData.filter(d => d.polyclinic !== polyclinicName);

        // Hapus jadwal dokter yang terdaftar di poliklinik ini
        doctorScheduleQuotaData = doctorScheduleQuotaData.filter(s => s.polyclinic !== polyclinicName);

        // Batalkan appointment terkait poliklinik ini
        appointmentsData = appointmentsData.map(app => {
            if (app.polyclinic === polyclinicName) {
                return { ...app, status: 'Dibatalkan (Poliklinik Dihapus)' };
            }
            return app;
        });

        // Hapus user dokter yang polikliniknya ikut terhapus
        for (const username in users) {
            if (users[username].role === 'doctor' && doctorsToDeleteIds.includes(users[username].doctorId)) {
                delete users[username];
            }
        }

        saveData();
        displayPolyclinics();
        showMessage('admin-polyclinic-message', 'Poliklinik berhasil dihapus!');
    }
}


// Admin - Kelola Jadwal & Kuota Dokter
function showAdminManageDoctorScheduleQuota() {
    showSection('admin-manage-schedule-quota-section');
    displayDoctorSchedulesAndQuota();
    loadDoctorsAndPolyclinicsForScheduleForms();
    document.getElementById('admin-schedule-quota-message').classList.add('hidden');
    document.getElementById('edit-schedule-form').classList.add('hidden');
    document.getElementById('edit-schedule-title').classList.add('hidden');

    // Clear add form
    document.getElementById('new-schedule-doctor').value = '';
    document.getElementById('new-schedule-polyclinic').value = '';
    document.getElementById('new-schedule-date').value = '';
    document.getElementById('new-schedule-time').value = '';
    document.getElementById('new-schedule-quota').value = 10;
}

function loadDoctorsAndPolyclinicsForScheduleForms() {
    const newDoctorSelect = document.getElementById('new-schedule-doctor');
    const newPolyclinicSelect = document.getElementById('new-schedule-polyclinic');
    const editDoctorSelect = document.getElementById('edit-schedule-doctor');
    const editPolyclinicSelect = document.getElementById('edit-schedule-polyclinic');

    [newDoctorSelect, editDoctorSelect].forEach(select => {
        select.innerHTML = '<option value="">-- Pilih Dokter --</option>';
        doctorsData.forEach(doctor => {
            const option = document.createElement('option');
            option.value = doctor.id; // Use doctor ID as value
            option.textContent = doctor.name; // Display doctor name
            select.appendChild(option);
        });
    });

    [newPolyclinicSelect, editPolyclinicSelect].forEach(select => {
        select.innerHTML = '<option value="">-- Pilih Poliklinik --</option>';
        polyclinicsData.forEach(poli => {
            const option = document.createElement('option');
            option.value = poli.name; // Use polyclinic name as value
            option.textContent = poli.name; // Display polyclinic name
            select.appendChild(option);
        });
    });
}

function displayDoctorSchedulesAndQuota() {
    const scheduleTableBody = document.querySelector('#doctor-schedule-quota-table tbody');
    scheduleTableBody.innerHTML = '';
    doctorScheduleQuotaData.forEach((schedule, index) => {
        const row = scheduleTableBody.insertRow();
        row.insertCell().textContent = schedule.doctorName;
        row.insertCell().textContent = schedule.polyclinic;
        row.insertCell().textContent = schedule.date;
        row.insertCell().textContent = schedule.time;
        row.insertCell().textContent = `${schedule.booked} / ${schedule.quota}`;
        const actionCell = row.insertCell();
        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.onclick = () => showEditDoctorScheduleForm(index);
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Hapus';
        deleteButton.onclick = () => deleteDoctorSchedule(index);
        actionCell.appendChild(editButton);
        actionCell.appendChild(deleteButton);
    });
}

function addDoctorSchedule() {
    const doctorId = document.getElementById('new-schedule-doctor').value;
    const polyclinicName = document.getElementById('new-schedule-polyclinic').value;
    const date = document.getElementById('new-schedule-date').value;
    const time = document.getElementById('new-schedule-time').value;
    const quota = parseInt(document.getElementById('new-schedule-quota').value);

    if (!doctorId || !polyclinicName || !date || !time || isNaN(quota) || quota <= 0) {
        showMessage('admin-schedule-quota-message', 'Semua field harus diisi dengan benar!', true);
        return;
    }

    const doctor = doctorsData.find(d => d.id === doctorId);
    if (!doctor) {
        showMessage('admin-schedule-quota-message', 'Dokter tidak ditemukan!', true);
        return;
    }

    // Cek duplikasi jadwal
    if (doctorScheduleQuotaData.some(s => s.doctorId === doctorId && s.date === date && s.time === time)) {
        showMessage('admin-schedule-quota-message', 'Jadwal untuk dokter dan waktu yang sama sudah ada!', true);
        return;
    }

    doctorScheduleQuotaData.push({
        doctorId: doctorId,
        doctorName: doctor.name, // Simpan nama dokter juga
        polyclinic: polyclinicName,
        date: date,
        time: time,
        quota: quota,
        booked: 0
    });
    saveData();
    displayDoctorSchedulesAndQuota();
    showMessage('admin-schedule-quota-message', 'Jadwal dokter berhasil ditambahkan!');

    // Clear form
    document.getElementById('new-schedule-doctor').value = '';
    document.getElementById('new-schedule-polyclinic').value = '';
    document.getElementById('new-schedule-date').value = '';
    document.getElementById('new-schedule-time').value = '';
    document.getElementById('new-schedule-quota').value = 10;
}

function showEditDoctorScheduleForm(index) {
    const schedule = doctorScheduleQuotaData[index];
    if (schedule) {
        document.getElementById('edit-schedule-title').classList.remove('hidden');
        document.getElementById('edit-schedule-form').classList.remove('hidden');
        document.getElementById('edit-schedule-original-index').value = index;
        document.getElementById('edit-schedule-doctor').value = schedule.doctorId;
        document.getElementById('edit-schedule-polyclinic').value = schedule.polyclinic;
        document.getElementById('edit-schedule-date').value = schedule.date;
        document.getElementById('edit-schedule-time').value = schedule.time;
        document.getElementById('edit-schedule-quota').value = schedule.quota;
    }
}

function updateDoctorSchedule() {
    const originalIndex = parseInt(document.getElementById('edit-schedule-original-index').value);
    const doctorId = document.getElementById('edit-schedule-doctor').value;
    const polyclinicName = document.getElementById('edit-schedule-polyclinic').value;
    const date = document.getElementById('edit-schedule-date').value;
    const time = document.getElementById('edit-schedule-time').value;
    const quota = parseInt(document.getElementById('edit-schedule-quota').value);

    if (!doctorId || !polyclinicName || !date || !time || isNaN(quota) || quota <= 0) {
        showMessage('admin-schedule-quota-message', 'Semua field harus diisi dengan benar!', true);
        return;
    }

    const doctor = doctorsData.find(d => d.id === doctorId);
    if (!doctor) {
        showMessage('admin-schedule-quota-message', 'Dokter tidak ditemukan!', true);
        return;
    }

    // Cek duplikasi jadwal, kecuali untuk jadwal yang sedang diedit
    if (doctorScheduleQuotaData.some((s, i) => i !== originalIndex && s.doctorId === doctorId && s.date === date && s.time === time)) {
        showMessage('admin-schedule-quota-message', 'Jadwal untuk dokter dan waktu yang sama sudah ada!', true);
        return;
    }

    if (originalIndex > -1 && originalIndex < doctorScheduleQuotaData.length) {
        const currentBooked = doctorScheduleQuotaData[originalIndex].booked;
        if (quota < currentBooked) {
            showMessage('admin-schedule-quota-message', `Kuota baru (${quota}) tidak boleh lebih kecil dari jumlah yang sudah dipesan (${currentBooked}).`, true);
            return;
        }

        doctorScheduleQuotaData[originalIndex] = {
            doctorId: doctorId,
            doctorName: doctor.name,
            polyclinic: polyclinicName,
            date: date,
            time: time,
            quota: quota,
            booked: currentBooked // Pertahankan jumlah yang sudah dipesan
        };
        saveData();
        displayDoctorSchedulesAndQuota();
        showMessage('admin-schedule-quota-message', 'Jadwal berhasil diperbarui!');
        cancelEditDoctorSchedule();
    } else {
        showMessage('admin-schedule-quota-message', 'Jadwal tidak ditemukan!', true);
    }
}

function cancelEditDoctorSchedule() {
    document.getElementById('edit-schedule-form').classList.add('hidden');
    document.getElementById('edit-schedule-title').classList.add('hidden');
    document.getElementById('admin-schedule-quota-message').classList.add('hidden');
}

function deleteDoctorSchedule(index) {
    if (confirm('Apakah Anda yakin ingin menghapus jadwal ini?')) {
        if (index > -1 && index < doctorScheduleQuotaData.length) {
            const scheduleToDelete = doctorScheduleQuotaData[index];
            if (scheduleToDelete.booked > 0) {
                // Jika ada pasien yang sudah booked, tanyakan konfirmasi lanjutan
                if (!confirm(`Ada ${scheduleToDelete.booked} pasien yang sudah terdaftar pada jadwal ini. Menghapus jadwal ini akan membatalkan perjanjian mereka. Lanjutkan?`)) {
                    return; // Batalkan penghapusan jika tidak dikonfirmasi
                }
                // Batalkan appointment yang terkait dengan jadwal ini
                appointmentsData = appointmentsData.map(app => {
                    if (app.doctorId === scheduleToDelete.doctorId && app.date === scheduleToDelete.date && app.time === scheduleToDelete.time) {
                        return { ...app, status: 'Dibatalkan oleh Admin' }; // Ubah status menjadi dibatalkan
                    }
                    return app;
                });
            }
            doctorScheduleQuotaData.splice(index, 1);
            saveData();
            displayDoctorSchedulesAndQuota();
            showMessage('admin-schedule-quota-message', 'Jadwal dokter berhasil dihapus!');
        } else {
            showMessage('admin-schedule-quota-message', 'Jadwal tidak ditemukan!', true);
        }
    }
}


// Admin - Rekapitulasi Layanan Kunjungan
function showAdminRekapLayanan() {
    showSection('admin-rekap-layanan-section');
    // Fungsi untuk menampilkan rekapitulasi bisa ditambahkan di sini,
    // yang akan memproses data dari `appointmentsData`
}


// --- Inisialisasi ---
document.addEventListener('DOMContentLoaded', () => {
    // Tampilkan bagian login saat halaman dimuat
    showSection('login-section');
    // Jika ada current user dari sesi sebelumnya (misal refresh halaman), arahkan ke dashboard yang sesuai
    // (Dalam implementasi sederhana ini, kita hanya akan membiarkan login terpicu ulang)
});