# Verdure AI - API Documentation

## Authentication API

### Register User
- **Endpoint**: `/api/auth/register`
- **Method**: POST
- **Body**: 
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "User Name"
}
```
- **Response**: User object with success flag

### Login User
- **Endpoint**: `/api/auth/login`
- **Method**: POST
- **Body**: 
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
- **Response**: User object with success flag

### Reset Password
- **Endpoint**: `/api/auth/reset-password`
- **Method**: POST
- **Body**: 
```json
{
  "email": "user@example.com"
}
```
- **Response**: Success message

## Chat API

### Send Message with Image
- **Endpoint**: `/api/chat/chat`
- **Method**: POST
- **Body**: FormData with `message`, `image` (file), and `idToken`
- **Response**: AI response with optional image URL

### Add Plant to Collection
- **Endpoint**: `/api/chat/add-plant`
- **Method**: POST
- **Body**: FormData with `aiResponse` (JSON), `idToken`, and optional `image`
- **Response**: Plant details with success flag

### Get Last Chat
- **Endpoint**: `/api/chat/get-last-chat`
- **Method**: GET
- **Query**: `userId`
- **Response**: Last AI response

## Plant API

### Get Plant from Perenual API
- **Endpoint**: `/plants/perenual/:plantId`
- **Method**: GET
- **Response**: Plant details from Perenual API

### Get User Plants
- **Endpoint**: `/plants/users/:userId/plants`
- **Method**: GET
- **Response**: Array of user plants

### Add New Plant
- **Endpoint**: `/plants/users/:userId/plants`
- **Method**: POST
- **Body**:
```json
{
  "name": "Plant Name",
  "type": "Plant Type",
  "wateringSchedule": "Every 7 days",
  "lastWatered": "2025-04-01",
  "healthStatus": "Healthy"
}
```
- **Response**: Success flag with plant ID
