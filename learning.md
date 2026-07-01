INSTALL ALL DEPENDENCIES

1. Database (TypeORM + PostgreSQL)
npm install @nestjs/typeorm typeorm pg
2. Authentication (JWT + Passport)
npm install @nestjs/jwt @nestjs/passport passport passport-jwt
3. Password Security (bcrypt)
npm install bcrypt
npm install -D @types/bcrypt
4. Input Validation (DTO validation)
npm install class-validator class-transformer
5. API Documentation (Swagger)
npm install @nestjs/swagger swagger-ui-express
6. Environment Config (.env support)
npm install @nestjs/config
Recommended Install Order (Important)

Run in this order for clean setup:

npm install @nestjs/typeorm typeorm pg
npm install @nestjs/jwt @nestjs/passport passport passport-jwt
npm install bcrypt
npm install class-validator class-transformer
npm install @nestjs/swagger swagger-ui-express
npm install @nestjs/config