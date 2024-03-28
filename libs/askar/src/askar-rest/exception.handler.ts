import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  BadRequestException,
} from "@nestjs/common";
import {
  CredoError,
  RecordNotFoundError,
} from "@credo-ts/core";
import { EntityNotFoundError } from "@ocm-engine/dtos";

@Catch()
export class AllExceptionsHandler implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message: string | string[] = "Internal server error";

    if (exception instanceof Error) {
      message = exception.message;
    }

    if (exception instanceof BadRequestException) {
      message = exception.getResponse() as string[];

      response.status(status).json(message);
      return;
    }

    if (
      exception instanceof EntityNotFoundError ||
      exception instanceof RecordNotFoundError
    ) {
      response.status(HttpStatus.NOT_FOUND).json({
        statusCode: HttpStatus.NOT_FOUND,
        message: exception.message,
      });
      return;
    }

    if (exception instanceof CredoError) {
      response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: exception.message,
      });
      return;
    }

    response.status(status).json({
      statusCode: status,
      message,
    });
  }
}
