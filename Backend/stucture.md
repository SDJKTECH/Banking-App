BACKEND/
│
├── prisma/
│   ├── migrations/
│   └── schema.prisma
│
├── src/
│   │
│   ├── config/
│   │   └── env.ts
│   │
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── customer.controller.ts
│   │   └── account.controller.ts
│   │
│   ├── errors/
│   │   └── AppError.ts
│   │
│   ├── lib/
│   │   ├── db.ts
│   │   ├── jwt.ts
│   │   └── logger.ts
│   │
│   ├── middleware/
│   │   ├── auth.ts
│   │   ├── errorHandler.ts
│   │   ├── notFound.ts
│   │   └── validate.ts
│   │
│   ├── repositories/
│   │   ├── user.repository.ts
│   │   ├── customer.repository.ts
│   │   └── account.repository.ts
│   │
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── customer.routes.ts
│   │   └── account.routes.ts
│   │
│   ├── scripts/
│   │   └── seed.ts
│   │
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── customer.service.ts
│   │   └── account.service.ts
│   │
│   ├── types/
│   │   ├── auth.types.ts
│   │   ├── customer.types.ts
│   │   ├── account.types.ts
│   │   └── express.d.ts
│   │
│   └── utils/
│       ├── password.ts
│       └── response.ts
│
├── .env
├── .gitignore
├── app.ts
├── server.ts
├── package.json
└── tsconfig.json









{
  "Password": "SecurePassword123!",
  "FirstName": "John",
  "LastName": "Doe",
  "Address1": "123 Main St",
  "Address2": "Apt 4B",
  "City": "New York",
  "State": "NY",
  "Country": "USA",
  "ZIPCode": "10001",
  "EmailId": "john.doe@example.com",
  "Mobile": "+1234567890",
  "DOB": "1995-05-15",
  "MaritalStatus": "Single",
  "AccountType": "SAVING"
}







