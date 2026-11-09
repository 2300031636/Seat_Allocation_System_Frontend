const API_BASE_URL = 'http://localhost:8080/api/seats';

async function fetchSeats() {
    const response = await fetch(`${API_BASE_URL}`);
    if (!response.ok) {
        throw new Error('Failed to fetch seats');
    }
    return response.json();
}

async function bookSeat(seatLabel) {
    const response = await fetch(`${API_BASE_URL}/book`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ seat: seatLabel })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Booking failed');
    }

    return data;
}

async function groupBookSeats(count) {
    const response = await fetch(`${API_BASE_URL}/group-book`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ count: count })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Group booking failed');
    }

    return data;
}

async function fetchOccupancy() {
    const response = await fetch(`${API_BASE_URL}/occupancy`);
    if (!response.ok) {
        throw new Error('Failed to fetch occupancy');
    }
    return response.json();
}

async function resetSeats() {
    const response = await fetch(`${API_BASE_URL}/reset`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Reset failed');
    }

    return data;
}
