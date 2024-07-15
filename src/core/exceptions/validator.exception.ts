import { BadRequestException, HttpException, HttpStatus } from "@nestjs/common";

export class ValidationException extends BadRequestException {
    constructor(public validationError: {property: string, constraints: { [type: string]: string; }}[]) {
        super({
            status: 'KO',
            messages: validationError.map(error => error.constraints[Object.keys(error.constraints)[0]]),
            error: 'Validation Error',
            statusCode: HttpStatus.BAD_REQUEST
        });
    }
}

export const isValidationError = (error: unknown): error is ValidationException => {
    return error instanceof ValidationException;
};