# Transjakarta Fleet Management System

Aplikasi frontend untuk sistem manajemen armada kendaraan Transjakarta yang menggunakan MBTA API.

## 🚀 Fitur Utama

### ✅ Fitur yang Diimplementasikan

1. **Mengambil Data Kendaraan melalui REST API**
   - Fetch data dari MBTA Vehicle API
   - Support pagination dengan parameter `page[limit]` dan `page[offset]`
   - Include data relasi (route, trip, stop) untuk detail lengkap
   - Auto-refresh data berkala (15 detik)

2. **Menampilkan Data Kendaraan dalam Card dengan Pagination**
   - Grid layout responsive untuk menampilkan card kendaraan
   - Setiap card menampilkan:
     - Label kendaraan
     - Status saat ini (IN_TRANSIT_TO, STOPPED_AT, dll)
     - Latitude & Longitude
     - Waktu update terakhir
     - Bearing dan kecepatan (jika tersedia)
   - Pagination lengkap dengan:
     - Informasi rentang data yang ditampilkan (e.g., "Menampilkan 1-10 dari 100+ data")
     - Pilihan jumlah data per halaman (5, 10, 20, 50)
     - Tombol navigasi Previous/Next
     - Responsive design (mobile & desktop)
     - Accessibility compliant dengan ARIA labels

3. **Filter Kendaraan berdasarkan Rute dan Trip**
   - Dropdown multi-select untuk filter Rute dan Trip
   - Infinite scroll / lazy load untuk data rute dan trip
   - Search functionality dalam dropdown
   - Visual indicator untuk selected items
   - Dapat memilih multiple rute dan trip sekaligus
   - Data dari Routes API dan Trips API
   - Kolom Trip otomatis nonaktif jika rute belum dipilih
   - Tombol reset untuk membersihkan filter

4. **Pencarian Global Kendaraan**
   - Search pada seluruh data kendaraan (bukan hanya halaman aktif)
   - Aktif jika minimal 2 karakter
   - Tetap menghormati filter rute/trip
   - Pagination dilakukan di sisi client saat search aktif

5. **Menampilkan Detail Kendaraan**
   - Modal popup dengan informasi lengkap:
     - Label kendaraan
     - Status saat ini dengan color coding
     - Latitude & Longitude
     - Data Rute (nama, warna, deskripsi)
     - Data Trip (headsign, direction)
     - Data Stop/Halte (nama, lokasi)
     - Waktu update terakhir
     - Bearing, speed, dan info lainnya

### ⭐ Fitur Tambahan

- **TypeScript** - Full TypeScript implementation untuk type safety
- **Loading States** - Loading spinner saat fetching data
- **Error Handling** - Error messages yang informatif dengan opsi retry
- **Responsive Design** - Tampilan optimal di desktop, tablet, dan mobile
- **Clean Architecture** - Separation of concerns dengan folder structure yang rapi
- **Custom Hooks** - Logic reusable untuk data fetching
- **Utility Functions** - Helper functions untuk formatting data

## 🛠️ Teknologi yang Digunakan

- **React.js 18** - Library frontend
- **TypeScript** - Type safety dan better developer experience
- **Vite** - Build tool yang cepat
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client untuk API requests
- **Lucide React** - Icon library
- **React Leaflet** - Map library untuk peta armada

## 📁 Struktur Folder

```
transjakarta-fleet/
├── src/
│   ├── api/              # API configuration
│   │   └── axios.ts      # Axios instance dengan base URL
│   ├── components/       # React components
│   │   ├── ErrorMessage.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── MultiSelectDropdown.tsx
│   │   ├── Pagination.tsx
│   │   ├── Sidebar.tsx
│   │   ├── VehicleCard.tsx
│   │   └── VehicleDetailModal.tsx
│   ├── hooks/            # Custom hooks
│   │   ├── useAllVehicles.ts
│   │   ├── useAutoRefresh.ts
│   │   ├── useVehicles.ts
│   │   ├── useRoutes.ts
│   │   └── useTrips.ts
│   ├── contexts/         # Context providers
│   │   └── SidebarContext.tsx
│   ├── types/            # TypeScript type definitions
│   │   └── index.ts
│   ├── utils/            # Utility functions
│   │   ├── cn.ts         # className utility
│   │   └── formatters.ts # Data formatting utilities
│   ├── App.tsx           # Main app component
│   ├── main.tsx          # Entry point
│   └── index.css         # Global styles
│   ├── pages/             # App pages
│   │   ├── Dashboard.tsx
│   │   ├── Fleet.tsx
│   │   └── Map.tsx
├── public/               # Static assets
├── index.html
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
└── vite.config.ts
```

### Penjelasan Arsitektur

**Mengapa struktur folder ini?**

1. **Separation of Concerns**: Setiap folder memiliki tanggung jawab yang jelas
2. **Scalability**: Mudah untuk menambahkan fitur baru
3. **Maintainability**: Mudah mencari dan mengupdate code
4. **Reusability**: Components dan hooks dapat digunakan kembali
5. **Type Safety**: Types terpusat di satu folder

**Custom Hooks Pattern**:
- `useVehicles`: Handle fetching vehicles dengan pagination dan filtering
- `useRoutes`: Handle fetching routes dengan infinite scroll
- `useTrips`: Handle fetching trips dengan infinite scroll

Ini memisahkan logic dari UI component, membuat code lebih clean dan testable.

## 🚀 Cara Menjalankan Project

### Prerequisites

- Node.js (v18 atau lebih tinggi)
- npm atau yarn

### Installation

1. Clone atau download project ini

2. Install dependencies:
```bash
npm install
```

3. Jalankan development server:
```bash
npm run dev
```

4. Buka browser dan akses:
```
http://localhost:5173
```

### Build untuk Production

```bash
npm run build
```

File hasil build akan ada di folder `dist/`

## 📚 API Documentation

### Base URL
```
https://api-v3.mbta.com
```

### Endpoints yang Digunakan

1. **GET /vehicles**
   - Mengambil daftar kendaraan
   - Query params:
     - `page[limit]`: Jumlah data per halaman
     - `page[offset]`: Skip data (offset)
     - `include`: Relasi data (route,trip,stop)
     - `filter[route]`: Filter by Route ID
     - `filter[trip]`: Filter by Trip ID

2. **GET /routes**
   - Mengambil daftar rute
   - Query params:
     - `page[limit]`: Jumlah data per halaman
     - `page[offset]`: Skip data (offset)

3. **GET /trips**
   - Mengambil daftar trip
   - Query params:
     - `page[limit]`: Jumlah data per halaman
     - `page[offset]`: Skip data (offset)

## 🎯 Fitur-Fitur Teknis

### 1. Pagination
- Pagination untuk data kendaraan dari API
- Adjustable items per page (5, 10, 20, 50)
- Navigation buttons (Previous/Next)
- Range display (Showing 1-10 of 50 data)

### 2. Infinite Scroll Dropdown
- Lazy loading data saat scroll ke bawah
- Efficient API calls - hanya load data saat dibutuhkan
- Search/filter functionality
- Visual loading indicator

### 3. Multi-Select Filter
- Multiple selection untuk routes dan trips
- Visual chips untuk selected items
- Easy removal dengan click pada X button
-- Automatic data refresh saat filter berubah

### 4. Loading & Error States
- Loading spinner dengan text indicator
- Error messages yang user-friendly
- Retry functionality
- Empty state handling

### 5. TypeScript Integration
- Full type coverage
- Interface definitions untuk semua data structures
- Type-safe API responses
- Better IDE support dan autocomplete

## 🎨 Design Decisions

### Mengapa Tailwind CSS?
- Utility-first approach = faster development
- Consistent design system
- Small bundle size (unused classes di-purge)
- Easy customization

### Mengapa Custom Hooks?
- Reusable logic
- Easier testing
- Cleaner components
- Better separation of concerns

### Mengapa TypeScript?
- Type safety
- Better developer experience
- Catch errors early
- Self-documenting code

## 🐛 Troubleshooting

### CORS Error
Jika terjadi CORS error, pastikan API endpoint mendukung CORS atau gunakan proxy.

### Data Tidak Muncul
- Check browser console untuk error messages
- Pastikan koneksi internet stabil
- Verify API endpoint masih aktif

### Infinite Scroll Tidak Bekerja
- Check apakah `hasMore` state di-update dengan benar
- Verify scroll event listener terpasang
- Check API response untuk available data

## 📝 Notes untuk Reviewer

### Implementasi yang Menonjol

1. **Clean Code Architecture**
   - Folder structure yang terorganisir
   - Reusable components dan hooks
   - Type-safe dengan TypeScript

2. **User Experience**
   - Loading states di setiap fetch operation
   - Error handling dengan retry option
   - Smooth transitions dan hover effects
   - Responsive design

3. **Performance**
   - Lazy loading untuk dropdowns
   - Efficient re-renders dengan proper React hooks
   - Memoization where needed

4. **Best Practices**
   - Consistent code style
   - Proper error boundaries
   - Accessible UI components

### Potential Improvements

1. Implementasi peta dengan Leaflet untuk bonus feature
2. Unit testing dengan Jest/Vitest
3. E2E testing dengan Playwright/Cypress
4. State management dengan Zustand/Redux (jika app berkembang)
5. API response caching
6. Virtualization untuk large lists

## 👤 Author

Technical Test - Transjakarta Fleet Management System

## 📄 License

This project is created for technical assessment purposes.
