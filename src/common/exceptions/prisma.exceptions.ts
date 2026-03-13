import { Prisma } from '@prisma/client'
import { ConflictException, BadRequestException, UnauthorizedException, NotFoundException, ForbiddenException } from '@nestjs/common'
import { AbstractException, AbstractExceptionMetadata } from './abstract.exception'

export interface PrismaExceptionMetadata extends AbstractExceptionMetadata {
  prismaCode?: string
  target?: string | string[]
  modelName?: string
  field?: string
  [key: string]: unknown
}

export class PrismaKnownRequestException extends AbstractException {
  constructor(prismaError: Prisma.PrismaClientKnownRequestError) {
    const metadata: PrismaExceptionMetadata = {
      prismaCode: prismaError.code,
      target: prismaError.meta?.target as string | string[],
      modelName: prismaError.meta?.modelName as string,
      originalError: prismaError,
    }

    const message = PrismaExceptionHandler.getMessage(prismaError)
    const code = PrismaExceptionHandler.getErrorCode(prismaError)

    super(message, code, metadata)
  }
}

export class PrismaValidationException extends AbstractException {
  constructor(prismaError: Prisma.PrismaClientValidationError) {
    const metadata: PrismaExceptionMetadata = {
      originalError: prismaError,
    }

    super('การตรวจสอบข้อมูลผิดพลาด', 'PRISMA_VALIDATION_ERROR', metadata)
  }
}

export class PrismaUnknownException extends AbstractException {
  constructor(prismaError: Error) {
    const metadata: PrismaExceptionMetadata = {
      originalError: prismaError,
    }

    super('การดำเนินการฐานข้อมูลผิดพลาด', 'PRISMA_UNKNOWN_ERROR', metadata)
  }
}

export class NestConflictException extends AbstractException {
  constructor(conflictException: ConflictException) {
    const metadata: PrismaExceptionMetadata = {
      originalError: conflictException,
    }

    super(conflictException.message, 'RECORD_ALREADY_EXISTS', metadata)
  }
}

export class NestBadRequestException extends AbstractException {
  constructor(badRequestException: BadRequestException) {
    const metadata: PrismaExceptionMetadata = {
      originalError: badRequestException,
    }

    super(badRequestException.message, 'VALIDATION_ERROR', metadata)
  }
}

export class NestUnauthorizedException extends AbstractException {
  constructor(unauthorizedException: UnauthorizedException) {
    const metadata: PrismaExceptionMetadata = {
      originalError: unauthorizedException,
    }

    super(unauthorizedException.message, 'UNAUTHORIZED', metadata)
  }
}

export class NestNotFoundException extends AbstractException {
  constructor(notFoundException: NotFoundException) {
    const metadata: PrismaExceptionMetadata = {
      originalError: notFoundException,
    }

    super(notFoundException.message, 'RECORD_NOT_FOUND', metadata)
  }
}

export class NestForbiddenException extends AbstractException {
  constructor(forbiddenException: ForbiddenException) {
    const metadata: PrismaExceptionMetadata = {
      originalError: forbiddenException,
    }

    super(forbiddenException.message, 'FORBIDDEN', metadata)
  }
}

class PrismaExceptionHandler {
  static getMessage(error: Prisma.PrismaClientKnownRequestError): string {
    switch (error.code) {
      case 'P2002':
        return 'ข้อมูลนี้มีอยู่แล้วในระบบ'
      case 'P2025':
        return 'ไม่พบข้อมูลที่ค้นหา'
      case 'P2003':
        return 'ข้อมูลอ้างอิงไม่ถูกต้อง'
      case 'P2014':
        return 'ไม่สามารถสร้างความสัมพันธ์ข้อมูลได้'
      case 'P2021':
        return 'ตารางข้อมูลไม่พบในระบบ'
      case 'P2022':
        return 'คอลัมน์ข้อมูลไม่พบในระบบ'
      case 'P2000':
        return 'ข้อมูลมีความยาวเกินกำหนด'
      case 'P2001':
        return 'ไม่พบข้อมูลที่ต้องการค้นหา'
      case 'P2004':
        return 'เงื่อนไขข้อมูลไม่ถูกต้อง'
      case 'P2005':
        return 'ค่าข้อมูลในฐานข้อมูลไม่ถูกต้อง'
      case 'P2006':
        return 'ค่าสำหรับฟิลด์แบบ enum ไม่ถูกต้อง'
      case 'P2007':
        return 'การตรวจสอบข้อมูลผิดพลาด'
      case 'P2008':
        return 'การอ่านคำสั่งผิดพลาด'
      case 'P2009':
        return 'การตรวจสอบคำสั่งผิดพลาด'
      case 'P2010':
        return 'คำสั่ง SQL ผิดพลาด'
      case 'P2011':
        return 'ข้อมูลไม่สามารถเป็นค่าว่างได้'
      case 'P2012':
        return 'ต้องระบุค่าสำหรับฟิลด์นี้'
      case 'P2013':
        return 'ไม่พบค่าที่ต้องการสำหรับฟิลด์'
      case 'P2015':
        return 'ไม่พบข้อมูลที่เกี่ยวข้อง'
      case 'P2016':
        return 'การตีความคำสั่งผิดพลาด'
      case 'P2017':
        return 'ไม่พบข้อมูลใดๆ'
      case 'P2018':
        return 'ไม่พบข้อมูลที่เชื่อมโยง'
      case 'P2019':
        return 'ข้อมูลนำเข้าผิดพลาด'
      case 'P2020':
        return 'ค่าข้อมูลอยู่นอกช่วงที่กำหนด'
      case 'P2023':
        return 'ข้อมูลในคอลัมน์ไม่สอดคล้องกัน'
      case 'P2024':
        return 'การเชื่อมต่อฐานข้อมูลหมดเวลา'
      default:
        return 'การดำเนินการฐานข้อมูลผิดพลาด'
    }
  }

  static getErrorCode(error: Prisma.PrismaClientKnownRequestError): string {
    switch (error.code) {
      case 'P2002':
        return 'RECORD_ALREADY_EXISTS'
      case 'P2025':
        return 'RECORD_NOT_FOUND'
      case 'P2003':
        return 'FOREIGN_KEY_CONSTRAINT_FAILED'
      case 'P2014':
        return 'RELATION_CREATION_FAILED'
      case 'P2021':
        return 'TABLE_NOT_FOUND'
      case 'P2022':
        return 'COLUMN_NOT_FOUND'
      case 'P2000':
        return 'VALUE_TOO_LONG'
      case 'P2001':
        return 'RECORD_DOES_NOT_EXIST'
      case 'P2004':
        return 'CONSTRAINT_FAILED'
      case 'P2005':
        return 'INVALID_DATABASE_VALUE'
      case 'P2006':
        return 'INVALID_ENUM_VALUE'
      case 'P2007':
        return 'DATA_VALIDATION_ERROR'
      case 'P2008':
        return 'QUERY_PARSE_ERROR'
      case 'P2009':
        return 'QUERY_VALIDATION_ERROR'
      case 'P2010':
        return 'RAW_QUERY_ERROR'
      case 'P2011':
        return 'NULL_CONSTRAINT_VIOLATION'
      case 'P2012':
        return 'REQUIRED_FIELD_MISSING'
      case 'P2013':
        return 'REQUIRED_ARGUMENT_MISSING'
      case 'P2015':
        return 'RELATED_RECORD_NOT_FOUND'
      case 'P2016':
        return 'QUERY_INTERPRETATION_ERROR'
      case 'P2017':
        return 'NO_RECORDS_FOUND'
      case 'P2018':
        return 'CONNECTED_RECORDS_NOT_FOUND'
      case 'P2019':
        return 'INPUT_ERROR'
      case 'P2020':
        return 'VALUE_OUT_OF_BOUNDS'
      case 'P2023':
        return 'INCONSISTENT_COLUMN_DATA'
      case 'P2024':
        return 'DATABASE_CONNECTION_TIMEOUT'
      default:
        return 'PRISMA_DATABASE_ERROR'
    }
  }
}
