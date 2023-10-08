const daysContainer = document.querySelector('.days');
const appointmentDateInput = document.getElementById('appointmentDate');
const appointmentTextInput = document.getElementById('appointmentText');
const appointmentList = document.getElementById('appointmentList');
const addAppointmentButton = document.getElementById('addAppointment');
const prevMonthButton = document.getElementById('prevMonth');
const nextMonthButton = document.getElementById('nextMonth');
const monthYearDisplay = document.querySelector('.header h1');

const appointments = [];
const monthNames = [
  'January', 'February', 'March', 'April',
  'May', 'June', 'July', 'August',
  'September', 'October', 'November', 'December'
];

//index db stuff start
let db;

const request = indexedDB.open('filesDB', 1);

request.onerror = function(event) {
    console.error("Database error:", event.target.error);
};

request.onsuccess = function(event) {
    db = event.target.result;
};

request.onupgradeneeded = function(event) {
    const db = event.target.result;
    if (!db.objectStoreNames.contains('files')) {
        db.createObjectStore('files', { keyPath: 'name' });
    }
};
//index db end

let currentDate = new Date();

// Function to render the calendar for the current month
function renderCalendar() {
  // Clear the existing calendar
  daysContainer.innerHTML = '';

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Update the header to display the current month and year
  monthYearDisplay.textContent = `${monthNames[currentMonth]} ${currentYear}`;

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();

  // Add day headers
  const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  dayHeaders.forEach((day) => {
    const dayHeader = document.createElement('div');
    dayHeader.textContent = day;
    daysContainer.appendChild(dayHeader);
  });

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfMonth.getDay(); i++) {
    const emptyCell = document.createElement('div');
    emptyCell.classList.add('day', 'empty');
    daysContainer.appendChild(emptyCell);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dayElement = document.createElement('div');
    dayElement.classList.add('day');
    dayElement.textContent = day;
    daysContainer.appendChild(dayElement);

    // Check if there is an appointment for this day and display it
    const appointmentForDay = appointments.find((appointment) => {
      return (
        appointment.date.getFullYear() === currentYear &&
        appointment.date.getMonth() === currentMonth &&
        appointment.date.getDate() === day
      );
    });

    if (appointmentForDay) {
      const appointmentDiv = document.createElement('div');
      appointmentDiv.classList.add('appointment');
      appointmentDiv.textContent = appointmentForDay.text;
      dayElement.appendChild(appointmentDiv);
    }
  }
}


// Function to add a new appointment
// Function to add a new appointment
// Function to add a new appointment
function addAppointment() {
  const dateInput = new Date(appointmentDateInput.value);
  const offset = dateInput.getTimezoneOffset();
  const date = new Date(dateInput.getTime() + offset * 60 * 1000); // Adjust for timezone offset
  const text = appointmentTextInput.value;

  if (!date || !text) {
    alert('Please enter both a date and appointment details.');
    return;
  }

  // Check if there is already an appointment for the selected date
  const existingAppointmentIndex = appointments.findIndex((appointment) => {
    return (
      appointment.date.toDateString() === date.toDateString()
    );
  });

  if (existingAppointmentIndex !== -1) {
    // If an appointment already exists for this date, update it
    appointments[existingAppointmentIndex].text = text;
  } else {
    // Otherwise, add a new appointment
    appointments.push({ date, text });
  }

  renderCalendar();
  renderAppointments();
  clearForm();
}

// Function to render the list of appointments
// Function to render the list of appointments
// Function to render the list of appointments
function renderAppointments() {
  appointmentList.innerHTML = ''; // Clear the existing list of appointments

  if (appointments.length === 0) {
    return;
  }

  appointments.forEach((appointment, index) => {
    const li = document.createElement('li');
    li.textContent = `${appointment.date.toDateString()}: ${appointment.text}`;

    // Create a delete button for each appointment
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', () => deleteAppointment(index));

    li.appendChild(deleteButton);
    appointmentList.appendChild(li);
  });
}

// Function to delete an appointment
function deleteAppointment(index) {
  if (index >= 0 && index < appointments.length) {
    appointments.splice(index, 1);
    renderCalendar();
    renderAppointments();
  }
}

// Function to clear the appointment form
function clearForm() {
  appointmentDateInput.value = '';
  appointmentTextInput.value = '';
}

// Function to navigate to the previous month
function goToPrevMonth() {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
}

// Function to navigate to the next month
function goToNextMonth() {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
}


// Add event listeners
addAppointmentButton.addEventListener('click', addAppointment);
prevMonthButton.addEventListener('click', goToPrevMonth);
nextMonthButton.addEventListener('click', goToNextMonth);

// Initial rendering
renderCalendar();
renderAppointments();


function getDocumentFromFile() {
    document.getElementById("placeholderimg").style.display = 'none'
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    if (!file) return;

    const output = document.getElementById('output');
   
    storeFileInDB(output);
    // Clear previous output
    output.innerHTML = '';

    if (file.type === "application/pdf") {
        // Handle PDF using pdf.js
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const content = e.target.result;

            // Load the PDF using pdf.js
            const loadingTask = pdfjsLib.getDocument({data: content});
            loadingTask.promise.then(function(pdf) {
                // Render the first page of the PDF
                pdf.getPage(1).then(function(page) {
                    const scale = 1.5;
                    const viewport = page.getViewport({ scale: scale });

                    // Prepare canvas using PDF page dimensions
                    const canvas = document.createElement("canvas");
                    const context = canvas.getContext('2d');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;

                    // Render PDF page into the canvas context
                    const renderContext = {
                        canvasContext: context,
                        viewport: viewport
                    };
                    const renderTask = page.render(renderContext);
                    renderTask.promise.then(function() {
                        output.appendChild(canvas);
                    });
                });
            });
        };

        reader.onerror = function(e) {
            console.error("Error reading file:", e);
        };

        reader.readAsArrayBuffer(file);  // Read the file as ArrayBuffer for pdf.js
    } else if (file.type.startsWith("image/")) {
        // Handle image
        const img = new Image();
        img.onload = function() {
            output.appendChild(img);
        }
        img.onerror = function() {
            console.error("Error loading image");
        }
        img.src = URL.createObjectURL(file);
    } else {
        console.error("Unsupported file type");
    }
}


function storeFileInDB(file) {
    if (!file || (file.type !== "application/pdf" && !file.type.startsWith("image/"))) {
        console.error("Invalid file type");
        return;
    }

    const transaction = db.transaction(['files'], 'readwrite');
    const store = transaction.objectStore('files');

    const fileRecord = {
        name: file.name,
        type: file.type,
        data: file
    };

    store.add(fileRecord);

    transaction.oncomplete = function() {
        console.log("File stored successfully!");
    };

    transaction.onerror = function(event) {
        console.error("Transaction error:", event.target.error);
    };
}


