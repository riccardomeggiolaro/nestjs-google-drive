import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from "@nestjs/common";
import { Response } from 'express';
import { isValidationError } from "../exceptions/validator.exception";

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = this.getStatus(exception);

    const errorResponse = this.buildErrorResponse(exception, status);

    response.status(status).json(errorResponse);
  }

  private getStatus(exception: unknown): number {
    if (exception instanceof HttpException) {
      return exception.getStatus();
    }
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private buildErrorResponse(exception: unknown, status: number) {
    if (isValidationError(exception)) {
      return {
        status: 'KO',
        statusCode: status,
        messages: (exception.getResponse() as any).messages,
        error: 'Validation Error',
      };
    }

    console.log(exception);


    const error = this.getError(exception);
    if (error) {
      return {
        status: 'KO',
        statusCode: status,
        message: this.getErrorMessage(exception),
        error,
      };
    }

    return {
      status: 'KO',
      statusCode: status,
      message: this.getErrorMessage(exception),
    };
  }

  private getErrorMessage(exception: unknown): string {
    if (exception instanceof HttpException) {
      return exception.message;
    }
    return 'Internal server error';
  }

  private getError(exception: unknown): string | object {
    if (isValidationError(exception)) {
      return (exception.getResponse() as any).messages;
    }
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      if (isString(response)) {
        return response;
      }
      return response['error'] || null;
   }
    return 'Internal server error';
  }
}

export const isString = (value: unknown): value is string => typeof value === 'string';