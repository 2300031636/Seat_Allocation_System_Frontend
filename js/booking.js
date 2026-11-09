const ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const SEATS_PER_ROW = 10;

let allSeats = [];
let allocatedGroupSeats = [];

document.addEventListener('DOMContentLoaded', () => {
    initializeBookingPage();
});

async function initializeBookingPage() {
    bindGroupBookingEvents();
    await refreshDashboard();
}

function bindGroupBookingEvents() {
    const findBtn = document.getElementById('findSeatsBtn');
    const bookGroupBtn = document.getElementById('bookGroupBtn');
    const groupCountInput = document.getElementById('groupCount');

    if (findBtn) {
        findBtn.addEventListener('click', () => {
            const count = parseInt(groupCountInput.value, 10);
            handleFindSeats(count);
        });
    }

    if (bookGroupBtn) {
        bookGroupBtn.addEventListener('click', () => {
            const count = parseInt(groupCountInput.value, 10);
            handleGroupBook(count);
        });
    }
}

async function refreshDashboard() {
    try {
        hideMessage();
        allSeats = await fetchSeats();
        renderSeatGrid(allSeats);
        await updateStatistics();
        highlightAllocatedSeats();
    } catch (error) {
        showMessage(error.message, 'error');
    }
}

function renderSeatGrid(seats) {
    const grid = document.getElementById('seatGrid');
    if (!grid) {
        return;
    }

    grid.innerHTML = '';

    ROWS.forEach(rowName => {
        const rowContainer = document.createElement('div');
        rowContainer.className = 'seat-row';

        const rowLabel = document.createElement('div');
        rowLabel.className = 'row-label';
        rowLabel.textContent = rowName;
        rowContainer.appendChild(rowLabel);

        const seatsContainer = document.createElement('div');
        seatsContainer.className = 'seats-container';

        const rowSeats = seats
            .filter(seat => seat.rowName === rowName)
            .sort((a, b) => a.seatNumber - b.seatNumber);

        rowSeats.forEach(seat => {
            const seatElement = document.createElement('button');
            seatElement.className = `seat ${seat.status.toLowerCase()}`;
            seatElement.textContent = seat.seatLabel;
            seatElement.title = `${seat.seatLabel} - ${seat.status}`;
            seatElement.dataset.seat = seat.seatLabel;
            seatElement.dataset.status = seat.status;

            if (seat.status === 'FREE') {
                seatElement.addEventListener('click', () => handleSingleBooking(seat.seatLabel));
            } else {
                seatElement.disabled = true;
            }

            seatsContainer.appendChild(seatElement);
        });

        rowContainer.appendChild(seatsContainer);
        grid.appendChild(rowContainer);
    });
}

async function handleSingleBooking(seatLabel) {
    try {
        hideMessage();
        const result = await bookSeat(seatLabel);
        showMessage(result.message, 'success');
        allocatedGroupSeats = [];
        clearAllocatedDisplay();
        await refreshDashboard();
        animateBookedSeat(seatLabel);
    } catch (error) {
        showMessage(error.message, 'error');
    }
}

function findContiguousSeats(seats, count) {
    if (count < 1 || count > SEATS_PER_ROW) {
        return [];
    }

    for (let rowIndex = 0; rowIndex < ROWS.length; rowIndex++) {
        const rowName = ROWS[rowIndex];
        const rowSeats = seats
            .filter(seat => seat.rowName === rowName)
            .sort((a, b) => a.seatNumber - b.seatNumber);

        for (let startIndex = 0; startIndex <= rowSeats.length - count; startIndex++) {
            let allFree = true;
            const candidateLabels = [];

            for (let offset = 0; offset < count; offset++) {
                const seat = rowSeats[startIndex + offset];

                if (!seat || seat.seatNumber !== startIndex + offset + 1 || seat.status !== 'FREE') {
                    allFree = false;
                    break;
                }

                candidateLabels.push(seat.seatLabel);
            }

            if (allFree && candidateLabels.length === count) {
                return candidateLabels;
            }
        }
    }

    return [];
}

function handleFindSeats(count) {
    if (Number.isNaN(count) || count < 1 || count > SEATS_PER_ROW) {
        showMessage('Please enter a valid seat count between 1 and 10.', 'error');
        return;
    }

    allocatedGroupSeats = findContiguousSeats(allSeats, count);

    if (allocatedGroupSeats.length === 0) {
        showMessage('Contiguous seats unavailable.', 'error');
        clearAllocatedDisplay();
        highlightAllocatedSeats();
        return;
    }

    showMessage(`Found contiguous seats: ${allocatedGroupSeats.join(', ')}`, 'success');
    renderAllocatedSeats(allocatedGroupSeats);
    highlightAllocatedSeats();
}

async function handleGroupBook(count) {
    if (Number.isNaN(count) || count < 1 || count > SEATS_PER_ROW) {
        showMessage('Please enter a valid seat count between 1 and 10.', 'error');
        return;
    }

    try {
        hideMessage();
        const result = await groupBookSeats(count);
        showMessage(result.message, 'success');
        allocatedGroupSeats = result.seats || [];
        renderAllocatedSeats(allocatedGroupSeats);
        await refreshDashboard();

        allocatedGroupSeats.forEach(seatLabel => animateBookedSeat(seatLabel));
    } catch (error) {
        showMessage(error.message, 'error');
    }
}

function renderAllocatedSeats(seats) {
    const container = document.getElementById('allocatedSeats');
    if (!container) {
        return;
    }

    container.innerHTML = '';

    if (!seats || seats.length === 0) {
        container.innerHTML = '<p class="muted">No seats allocated yet.</p>';
        return;
    }

    seats.forEach(seatLabel => {
        const badge = document.createElement('span');
        badge.className = 'allocated-badge';
        badge.textContent = seatLabel;
        container.appendChild(badge);
    });
}

function clearAllocatedDisplay() {
    renderAllocatedSeats([]);
}

function highlightAllocatedSeats() {
    document.querySelectorAll('.seat').forEach(seatElement => {
        seatElement.classList.remove('highlighted');
    });

    allocatedGroupSeats.forEach(seatLabel => {
        const seatElement = document.querySelector(`.seat[data-seat="${seatLabel}"]`);
        if (seatElement) {
            seatElement.classList.add('highlighted');
        }
    });
}

async function updateStatistics() {
    try {
        const stats = await fetchOccupancy();
        document.getElementById('bookedCount').textContent = stats.booked;
        document.getElementById('availableCount').textContent = stats.available;
        document.getElementById('occupancyPercent').textContent = `${stats.occupancy}%`;
    } catch (error) {
        showMessage(error.message, 'error');
    }
}

function animateBookedSeat(seatLabel) {
    const seatElement = document.querySelector(`.seat[data-seat="${seatLabel}"]`);
    if (seatElement) {
        seatElement.classList.add('booked-animation');
        setTimeout(() => seatElement.classList.remove('booked-animation'), 600);
    }
}

function showMessage(message, type) {
    const messageBox = document.getElementById('messageBox');
    if (!messageBox) {
        return;
    }

    messageBox.textContent = message;
    messageBox.className = `message-box ${type} show`;
}

function hideMessage() {
    const messageBox = document.getElementById('messageBox');
    if (messageBox) {
        messageBox.className = 'message-box';
        messageBox.textContent = '';
    }
}
