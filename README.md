# Seat Allocation Management System

A full-stack **Cinema / Airline Seat Allocation** application for managing in-memory seat availability, individual booking, contiguous group booking, and occupancy tracking.

## Prerequisites

- **Java 21**
- **Maven 3.9+**
- **MySQL 8.x**
- A modern web browser (Chrome, Edge, Firefox)

## Project Structure

```
SeatAllocationSystem/
├── backend/
│   ├── src/main/java/com/seatallocation/
│   │   ├── SeatAllocationApplication.java
│   │   ├── controller/SeatController.java
│   │   ├── service/SeatService.java
│   │   ├── repository/SeatRepository.java
│   │   ├── entity/Seat.java, SeatStatus.java
│   │   ├── dto/BookingRequest.java, BookingResponse.java, ...
│   │   ├── config/CorsConfig.java, DataInitializer.java
│   │   └── exception/GlobalExceptionHandler.java
│   ├── src/main/resources/application.properties
│   ├── sql/init.sql
│   ├── pom.xml
│   ├── mvnw
│   └── mvnw.cmd
└── frontend/
    ├── index.html
    ├── booking.html
    ├── admin.html
    ├── css/style.css
    ├── js/api.js, booking.js, admin.js
    ├── images/
    └── README.md
```

## Install MySQL

1. Install MySQL Server 8.x from [https://dev.mysql.com/downloads/mysql/](https://dev.mysql.com/downloads/mysql/)
2. Start the MySQL service
3. Ensure credentials match `application.properties` (default: `root` / `root`)

## Create Database

### Option A: Run SQL Script (Recommended)

```bash
mysql -u root -p < backend/sql/init.sql
```

### Option B: Manual Setup

```sql
CREATE DATABASE seat_allocation_db;
```

Then start the backend — it will auto-create the table and seed 80 seats if the database is empty.

## Run Backend

```bash
cd backend
./mvnw spring-boot:run
```

On Windows:

```bash
cd backend
mvnw.cmd spring-boot:run
```

Backend starts at: **http://localhost:8080**

## Open Frontend

Open `frontend/index.html` directly in your browser, or use a simple static server:

```bash
cd frontend
npx serve .
```

Navigate to:
- **Home:** `index.html`
- **Booking:** `booking.html`
- **Admin:** `admin.html`

> Ensure the Spring Boot backend is running before using the frontend.

## API Documentation

Base URL: `http://localhost:8080/api/seats`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/seats` | Returns the full seat grid |
| POST | `/api/seats/book` | Book a single seat |
| POST | `/api/seats/group-book` | Book contiguous seats in the same row |
| GET | `/api/seats/occupancy` | Get booked, available, and occupancy % |
| POST | `/api/seats/reset` | Reset all seats to FREE |

### GET /api/seats

**Response:**
```json
[
  {
    "id": 1,
    "rowName": "A",
    "seatNumber": 1,
    "seatLabel": "A1",
    "status": "FREE"
  }
]
```

### POST /api/seats/book

**Request:**
```json
{
  "seat": "A5"
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Seat A5 booked successfully.",
  "seat": "A5"
}
```

**Error Response (409):**
```json
{
  "success": false,
  "message": "Seat already booked."
}
```

### POST /api/seats/group-book

**Request:**
```json
{
  "count": 4
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Group booking successful for 4 seats.",
  "seats": ["A2", "A3", "A4", "A5"]
}
```

**Error Response (409):**
```json
{
  "success": false,
  "message": "Contiguous seats unavailable."
}
```

### GET /api/seats/occupancy

**Response:**
```json
{
  "booked": 25,
  "available": 55,
  "occupancy": 31.25
}
```

### POST /api/seats/reset

**Response:**
```json
{
  "success": true,
  "message": "All seats have been reset to FREE."
}
```

## Seat Layout

- **8 rows:** A, B, C, D, E, F, G, H
- **10 seats per row:** 1–10
- **Total:** 80 seats
- **Status values:** FREE, BOOKED, BLOCKED

## Features

- Live seat grid with color coding (Green = FREE, Red = BOOKED, Gray = BLOCKED)
- Click-to-book individual seats
- Group booking with contiguous seat search (same row only)
- Atomic group booking — all or none
- Live occupancy statistics
- Admin reset and refresh controls
- CORS enabled for browser-based frontend

## Screenshots

![Dashboard Screenshot Placeholder](images/dashboard-placeholder.png)
![Booking Page Screenshot Placeholder](images/booking-placeholder.png)
![Admin Panel Screenshot Placeholder](images/admin-placeholder.png)

> Replace placeholder images in the `images/` folder with actual screenshots after running the application.

## Technology Stack

**Backend:** Java 21, Spring Boot 3.x, Spring Web, Spring Data JPA, MySQL, Maven, Lombok, Validation

**Frontend:** HTML5, CSS3, Vanilla JavaScript

**Database:** MySQL

## License

This project is created for educational and interview demonstration purposes.
