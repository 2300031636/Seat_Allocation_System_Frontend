document.addEventListener('DOMContentLoaded', () => {
    initializeAdminPage();
});

async function initializeAdminPage() {
    bindAdminEvents();
    await loadAdminOccupancy();
    await loadAdminSeatPreview();
}

function bindAdminEvents() {
    const resetBtn = document.getElementById('resetBtn');
    const refreshBtn = document.getElementById('refreshBtn');
    const occupancyBtn = document.getElementById('occupancyBtn');

    if (resetBtn) {
        resetBtn.addEventListener('click', handleReset);
    }

    if (refreshBtn) {
        refreshBtn.addEventListener('click', async () => {
            await loadAdminOccupancy();
            await loadAdminSeatPreview();
            showAdminMessage('Dashboard refreshed successfully.', 'success');
        });
    }

    if (occupancyBtn) {
        occupancyBtn.addEventListener('click', loadAdminOccupancy);
    }
}

async function handleReset() {
    const confirmed = window.confirm('Are you sure you want to reset all seats to FREE?');
    if (!confirmed) {
        return;
    }

    try {
        hideAdminMessage();
        const result = await resetSeats();
        showAdminMessage(result.message, 'success');
        await loadAdminOccupancy();
        await loadAdminSeatPreview();
    } catch (error) {
        showAdminMessage(error.message, 'error');
    }
}

async function loadAdminOccupancy() {
    try {
        hideAdminMessage();
        const stats = await fetchOccupancy();

        document.getElementById('adminBookedCount').textContent = stats.booked;
        document.getElementById('adminAvailableCount').textContent = stats.available;
        document.getElementById('adminOccupancyPercent').textContent = `${stats.occupancy}%`;
        document.getElementById('adminTotalSeats').textContent = stats.booked + stats.available;

        const progressBar = document.getElementById('occupancyBar');
        if (progressBar) {
            progressBar.style.width = `${stats.occupancy}%`;
        }
    } catch (error) {
        showAdminMessage(error.message, 'error');
    }
}

async function loadAdminSeatPreview() {
    const previewGrid = document.getElementById('adminSeatPreview');
    if (!previewGrid) {
        return;
    }

    try {
        const seats = await fetchSeats();
        previewGrid.innerHTML = '';

        seats.forEach(seat => {
            const dot = document.createElement('div');
            dot.className = `preview-seat ${seat.status.toLowerCase()}`;
            dot.title = `${seat.seatLabel} - ${seat.status}`;
            dot.textContent = seat.seatLabel;
            previewGrid.appendChild(dot);
        });
    } catch (error) {
        showAdminMessage(error.message, 'error');
    }
}

function showAdminMessage(message, type) {
    const messageBox = document.getElementById('adminMessageBox');
    if (!messageBox) {
        return;
    }

    messageBox.textContent = message;
    messageBox.className = `message-box ${type} show`;
}

function hideAdminMessage() {
    const messageBox = document.getElementById('adminMessageBox');
    if (messageBox) {
        messageBox.className = 'message-box';
        messageBox.textContent = '';
    }
}
