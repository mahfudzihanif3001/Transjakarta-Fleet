# API Documentation - MBTA API Integration

## Base Configuration

```typescript
Base URL: https://api-v3.mbta.com
Accept: application/vnd.api+json
```

## Endpoints

### 1. Vehicles Endpoint

**Endpoint**: `GET /vehicles`

**Purpose**: Fetch vehicle data for display in cards and map

**Query Parameters**:
| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `page[limit]` | number | Items per page | `10` |
| `page[offset]` | number | Skip N items | `(page-1) * limit` |
| `include` | string | Include related data | `route,trip,stop` |
| `filter[route]` | string | Filter by route ID(s) | `Red,Blue` |
| `filter[trip]` | string | Filter by trip ID(s) | `trip123,trip456` |

**Example Request**:
```
GET /vehicles?page[limit]=10&page[offset]=0&include=route,trip,stop&filter[route]=Red
```

**Response Structure**:
```json
{
  "data": [
    {
      "id": "y1685",
      "type": "vehicle",
      "attributes": {
        "label": "1685",
        "current_status": "IN_TRANSIT_TO",
        "latitude": 42.3421,
        "longitude": -71.0852,
        "updated_at": "2024-02-09T10:00:00-05:00",
        "bearing": 260,
        "speed": 15.5,
        "direction_id": 0
      },
      "relationships": {
        "route": {
          "data": { "id": "Red", "type": "route" }
        },
        "trip": {
          "data": { "id": "Trip123", "type": "trip" }
        }
      }
    }
  ],
  "included": [
    {
      "id": "Red",
      "type": "route",
      "attributes": {
        "long_name": "Red Line",
        "color": "DA291C",
        "description": "Rapid Transit",
        "short_name": ""
      }
    },
    {
      "id": "Trip123",
      "type": "trip",
      "attributes": {
        "headsign": "Alewife",
        "direction_id": 0,
        "name": "Trip 123"
      }
    }
  ]
}
```

### 2. Routes Endpoint

**Endpoint**: `GET /routes`

**Purpose**: Get list of routes for filter dropdown

**Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `page[limit]` | number | Items per page (default: 100) |
| `page[offset]` | number | Skip N items |
| `filter[route]` | string | Filter by route ID(s) | `Red,Blue` |

**Example Request**:
```
GET /routes?page[limit]=20&page[offset]=0
```

**Response Structure**:
```json
{
  "data": [
    {
      "id": "Red",
      "type": "route",
      "attributes": {
        "color": "DA291C",
        "description": "Rapid Transit",
        "long_name": "Red Line",
        "short_name": "",
        "type": 1
      }
    }
  ]
}
```

**Data Used in App**:
- `id`: For filter value
- `attributes.long_name`: For dropdown label

### 3. Trips Endpoint

**Endpoint**: `GET /trips`

**Purpose**: Get list of trips for filter dropdown

**Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `page[limit]` | number | Items per page (default: 20) |
| `page[offset]` | number | Skip N items |

**Example Request**:
```
GET /trips?page[limit]=100&page[offset]=0&filter[route]=Red
```

**Response Structure**:
```json
{
  "data": [
    {
      "id": "Trip123",
      "type": "trip",
      "attributes": {
        "bikes_allowed": 1,
        "direction_id": 0,
        "headsign": "Alewife",
        "name": "Trip 123",
        "wheelchair_accessible": 1
      }
    }
  ]
}
```

**Data Used in App**:
- `id`: For filter value
- `attributes.headsign`: For dropdown label

## Implementation Notes

### Pagination Logic

```typescript
const offset = (currentPage - 1) * itemsPerPage;

// Example: Page 2 with 10 items per page
// offset = (2 - 1) * 10 = 10
// This will skip the first 10 items and return items 11-20
```

### Multiple Filters

When filtering by multiple routes or trips, join them with commas:

```typescript
// Filter by multiple routes
filter[route]=Red,Blue,Orange

// Filter by multiple trips
filter[trip]=Trip1,Trip2,Trip3
```

### Include Parameter

The `include` parameter is crucial for getting related data:

```typescript
include=route,trip,stop
// This will populate the "included" array in the response
// with full route, trip, and stop objects
```

### Relationship Resolution

To get route/trip data for a vehicle:

1. Find the route/trip ID from `vehicle.relationships.route.data.id`
2. Look up the full object in the `included` array
3. Match by `id` and `type`

```typescript
const routeId = vehicle.relationships.route.data.id;
const route = includedData.find(
  item => item.type === 'route' && item.id === routeId
);
```

## Error Handling

### Common Errors

1. **429 Too Many Requests**: Rate limit exceeded
   - Solution: Implement request throttling
   - Current implementation: Shows error message to user

2. **404 Not Found**: Invalid endpoint or ID
   - Solution: Validate input before making request
   - Current implementation: Shows "Data tidak ditemukan"

3. **500 Internal Server Error**: API server error
   - Solution: Retry with exponential backoff
   - Current implementation: Shows error message with retry button

### Error Response Structure

```json
{
  "errors": [
    {
      "status": "400",
      "source": { "parameter": "filter[route]" },
      "title": "Invalid filter",
      "detail": "Route not found"
    }
  ]
}
```

## Rate Limiting

MBTA API may have rate limits. Best practices:

1. **Cache responses** when possible
2. **Debounce** user input for search
3. **Lazy load** dropdown data
4. **Show loading states** to prevent duplicate requests

## Data Freshness

- Vehicle positions update frequently (every few seconds)
- Route/trip data is relatively static
- Consider implementing periodic refresh for vehicle data
- Cache route/trip data to reduce API calls

## Testing Queries

### Get all vehicles
```
GET /vehicles?page[limit]=10&include=route,trip
```

### Get vehicles on Red Line
```
GET /vehicles?filter[route]=Red&include=route,trip
```

### Get vehicles for specific trip
```
GET /vehicles?filter[trip]=60393850&include=route,trip
```

### Get multiple routes with pagination
```
GET /routes?page[limit]=20&page[offset]=0
```

## API Response Times

Typical response times observed:
- `/vehicles`: 200-500ms
- `/routes`: 100-300ms
- `/trips`: 300-800ms (large dataset)

These times may vary based on:
- Filter complexity
- Number of includes
- API server load
- Network conditions
