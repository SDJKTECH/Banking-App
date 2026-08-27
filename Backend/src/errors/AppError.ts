

export class AppError extends Error{
    constructor(
        public statusCode:number,
        message:string
    ){
        super(message);
    }
};

// Optional helper subclasses for common HTTP status codes
export class BadRequestError extends AppError {
    constructor(message: string) {
        super(400, message);
    }
}

export class ConflictError extends AppError {
    constructor(message: string) {
        super(409, message);
    }
}

export class NotFoundError extends AppError {
    constructor(message: string) {
        super(404, message);
    }
}

export class UnauthorizedError extends AppError {
    constructor(message: string) {
        super(401, message);
    }
}
// 403 Forbidden (Permission / Role access denied) 👈 ADD THIS
export class ForbiddenError extends AppError {
  constructor(message: string = "Forbidden resource") {
    super(403, message);
  }
}