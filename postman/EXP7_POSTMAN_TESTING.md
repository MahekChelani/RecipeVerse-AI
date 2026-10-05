# Experiment 7: Validating RESTful APIs using Postman

## 1. Experiment Title
RecipeVerse AI - Validating RESTful APIs using Postman

## 2. Aim
To validate the existing RecipeVerse AI REST API using Postman and verify that the application works correctly for CRUD operations, authentication, JWT-based access control, validation, and error handling.

## 3. Objective
The objective of this experiment is to test the existing backend APIs created in Experiments 4, 5, and 6 using Postman. The tests should demonstrate the correct behavior of endpoints for GET, POST, PUT, DELETE, protected routes, admin authorization, validation errors, and invalid request handling.

## 4. Tools Used
- Postman
- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JWT
- bcryptjs
- VS Code

## 5. API Base URL
http://localhost:5000

## 6. Postman Collection Structure
The collection is organized into the following folders:
1. Basic API
2. Recipe CRUD
3. Authentication
4. Protected Routes
5. Role-Based Authorization
6. Negative / Error Testing

## 7. API Endpoints Tested
- GET /
- GET /api/recipes
- GET /api/recipes/:id
- POST /api/recipes
- PUT /api/recipes/:id
- DELETE /api/recipes/:id
- POST /api/auth/register
- POST /api/auth/login
- GET /api/users/profile
- GET /api/users/admin
- GET /api/does-not-exist

## 8. HTTP Methods
- GET
- POST
- PUT
- DELETE

## 9. Expected Status Codes
- 200 OK
- 201 Created
- 400 Bad Request
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found

## 10. Positive Test Cases
- API health route responds successfully
- All recipes are fetched successfully
- New recipe is created successfully
- Single recipe is fetched successfully
- Recipe is updated successfully
- Recipe is deleted successfully
- User registration succeeds
- User login succeeds and JWT is returned
- Protected user profile route works with valid JWT
- Admin route works with admin token

## 11. Negative Test Cases
- Missing JWT header on protected route
- Invalid JWT token on protected route
- Missing recipe data while creating recipe
- Invalid servings value
- Invalid MongoDB ObjectId
- Non-existing recipe ID
- Unknown endpoint request
- Normal user tries to access admin route

## 12. JWT Authentication Testing
JWT authentication is tested by:
1. Registering a user
2. Logging in to obtain a JWT token
3. Storing the token in Postman environment variable `accessToken`
4. Sending Authorization: Bearer {{accessToken}} to protected routes
5. Rejecting requests without a token
6. Rejecting malformed or expired tokens

## 13. Role-Based Authorization Testing
Role-based authorization is tested by:
- Registering a user with admin role
- Logging in as admin and saving token in `adminToken`
- Accessing `/api/users/admin` with admin token
- Verifying normal user token gets 403

## 14. Validation Testing
The backend validation is tested against invalid request payloads, such as:
- empty recipe name
- missing category
- missing country
- missing continent
- missing meal
- invalid servings value

The responses return `400 Bad Request` with validation error details.

## 15. Expected Results
The experiment should confirm that:
- API is running correctly
- CRUD endpoints work as expected
- Authentication works with JWT
- Protected routes are secured properly
- Unauthorized and invalid token requests are rejected
- Admin authorization works as designed
- Validation and 404/400 handling behave correctly

## 16. Conclusion
This experiment successfully demonstrates the testing and validation of RecipeVerse AI REST APIs using Postman. It confirms that the backend behaves correctly for normal operation, authentication, authorization, and error handling. The project remains unchanged while the API is validated in a practical, evidence-based manner.

## Test Summary Table

| Test | Method | Endpoint | Expected Status |
|------|--------|----------|-----------------|
| API Health | GET | / | 200 |
| Get Recipes | GET | /api/recipes | 200 |
| Create Recipe | POST | /api/recipes | 201 |
| Get Recipe | GET | /api/recipes/:id | 200 |
| Update Recipe | PUT | /api/recipes/:id | 200 |
| Delete Recipe | DELETE | /api/recipes/:id | 200 |
| Register User | POST | /api/auth/register | 201 |
| Login User | POST | /api/auth/login | 200 |
| Protected Route | GET | /api/users/profile | 200 |
| No Token | GET | /api/users/profile | 401 |
| Invalid Token | GET | /api/users/profile | 401 |
| Admin Route | GET | /api/users/admin | 200 |
| Normal User → Admin | GET | /api/users/admin | 403 |
| Invalid Input | POST | /api/recipes | 400 |
| Invalid ID | GET | /api/recipes/invalid-id | 400 |
| Missing Recipe | GET | /api/recipes/:id | 404 |
| Unknown Endpoint | GET | /api/does-not-exist | 404 |

## Notes
If the admin account is already present in the MongoDB database, use that account instead of creating a new one. Otherwise, register a dedicated admin test user using the `role` field in the registration request.
