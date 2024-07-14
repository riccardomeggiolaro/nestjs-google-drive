import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from "@nestjs/common";
import { Response } from 'express';
import { isValidationError } from "../exceptions/validator.exception";

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;


    if (isValidationError(exception)) {
        const validationMessages = (exception.getResponse() as any).messages;
        const errorResponse = {
            status: 'KO',
            statusCode: status,
            messages: validationMessages,
            error: 'Validation Error',
        };
        return response.status(status).json(errorResponse);
    }

    const errorResponse = {
      status: 'KO',
      statusCode: status,
      message: this.getErrorMessage(exception),
      error: this.getError(exception),
    };

    response.status(status).json(errorResponse);
  }

  private getErrorMessage(exception: unknown): string {
    if (exception instanceof HttpException) {
      return exception.message;
    }
    return 'Internal server error';
  }

  private getError(exception: HttpException): string | object {
    if (isValidationError(exception)) {
      return (exception.getResponse() as any).messages;
    }
    if (exception instanceof HttpException) {
      return (exception.getResponse() as any).error || null;
    }
    return 'Internal server error';
  }
}
