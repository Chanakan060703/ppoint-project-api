import {
  ArgumentsHost,
  Catch,
  ConflictException,
  ExceptionFilter,
  HttpStatus,
  Logger,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common'
import { Request, Response } from 'express'
import { Prisma } from '@prisma/client'
import { AbstractException } from '../exceptions/abstract.exception'
import {
  PrismaKnownRequestException,
  PrismaUnknownException,
  PrismaValidationException,
  NestConflictException,
  NestBadRequestException,
  NestUnauthorizedException,
  NestNotFoundException,
  NestForbiddenException,
} from '../exceptions/prisma.exceptions'

@Catch(Prisma.PrismaClientKnownRequestError, Prisma.PrismaClientValidationError, Error, ConflictException, BadRequestException, UnauthorizedException, NotFoundException, ForbiddenException)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name)

  catch(exception: Error, host: ArgumentsHost): void {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    let customException: AbstractException
    let status: HttpStatus

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      customException = new PrismaKnownRequestException(exception)
      status = this.getHttpStatusFromPrismaError(exception)
    } else if (exception instanceof Prisma.PrismaClientValidationError) {
      customException = new PrismaValidationException(exception)
      status = HttpStatus.BAD_REQUEST
    } else if (exception instanceof ConflictException) {
      customException = new NestConflictException(exception)
      status = HttpStatus.CONFLICT
    } else if (exception instanceof BadRequestException) {
      customException = new NestBadRequestException(exception)
      status = HttpStatus.BAD_REQUEST
    } else if (exception instanceof UnauthorizedException) {
      customException = new NestUnauthorizedException(exception)
      status = HttpStatus.UNAUTHORIZED
    } else if (exception instanceof NotFoundException) {
      customException = new NestNotFoundException(exception)
      status = HttpStatus.NOT_FOUND
    } else if (exception instanceof ForbiddenException) {
      customException = new NestForbiddenException(exception)
      status = HttpStatus.FORBIDDEN
    } else if (exception instanceof AbstractException) {
      customException = exception
      status = this.getHttpStatusFromErrorCode(exception.code)
    } else {
      customException = new PrismaUnknownException(exception)
      status = HttpStatus.INTERNAL_SERVER_ERROR
    }

    this.logError(customException, request)

    const errorResponse = {
      status: false,
      message: customException.message,
      data: [],
    }

    response.status(status).json(errorResponse)
  }

  private getHttpStatusFromPrismaError(error: Prisma.PrismaClientKnownRequestError): HttpStatus {
    switch (error.code) {
      case 'P2002':
        return HttpStatus.CONFLICT
      case 'P2025':
      case 'P2001':
      case 'P2015':
      case 'P2018':
        return HttpStatus.NOT_FOUND
      case 'P2003':
        return HttpStatus.BAD_REQUEST
      case 'P2014':
        return HttpStatus.CONFLICT
      case 'P2021':
      case 'P2022':
        return HttpStatus.INTERNAL_SERVER_ERROR
      case 'P2000':
      case 'P2020':
        return HttpStatus.BAD_REQUEST
      case 'P2004':
      case 'P2011':
      case 'P2012':
      case 'P2013':
        return HttpStatus.BAD_REQUEST
      case 'P2005':
      case 'P2006':
      case 'P2007':
        return HttpStatus.BAD_REQUEST
      case 'P2008':
      case 'P2009':
      case 'P2016':
        return HttpStatus.BAD_REQUEST
      case 'P2010':
        return HttpStatus.INTERNAL_SERVER_ERROR
      case 'P2017':
        return HttpStatus.NOT_FOUND
      case 'P2019':
        return HttpStatus.BAD_REQUEST
      case 'P2023':
        return HttpStatus.INTERNAL_SERVER_ERROR
      case 'P2024':
        return HttpStatus.SERVICE_UNAVAILABLE
      default:
        return HttpStatus.INTERNAL_SERVER_ERROR
    }
  }

  private getHttpStatusFromErrorCode(code: string): HttpStatus {
    if (code.includes('NOT_FOUND')) {
      return HttpStatus.NOT_FOUND
    } else if (code.includes('ALREADY_EXISTS') || code.includes('CONFLICT')) {
      return HttpStatus.CONFLICT
    } else if (code.includes('VALIDATION') || code.includes('INVALID')) {
      return HttpStatus.BAD_REQUEST
    } else if (code.includes('UNAUTHORIZED')) {
      return HttpStatus.UNAUTHORIZED
    } else if (code.includes('FORBIDDEN')) {
      return HttpStatus.FORBIDDEN
    } else {
      return HttpStatus.INTERNAL_SERVER_ERROR
    }
  }

  private logError(exception: AbstractException, request: Request): void {
    const logData = {
      message: exception.message,
      code: exception.code,
      metadata: exception.metadata,
      request: {
        method: request.method,
        url: request.url,
        headers: request.headers,
        body: request.body,
        query: request.query,
        params: request.params,
      },
    }

    if (this.isClientError(exception.code)) {
      this.logger.warn(logData, 'Client error occurred')
    } else {
      this.logger.error(logData, 'Server error occurred')
    }
  }

  private isClientError(code: string): boolean {
    const clientErrorCodes = [
      'RECORD_ALREADY_EXISTS',
      'RECORD_NOT_FOUND',
      'VALIDATION_ERROR',
      'INVALID_INPUT',
      'MISSING_REQUIRED_FIELD',
    ]
    return clientErrorCodes.some(clientCode => code.includes(clientCode))
  }
}
