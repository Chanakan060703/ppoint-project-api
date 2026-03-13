import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

export interface Response<T> {
  status: boolean
  message: string
  data: T[] | boolean
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    const request = context.switchToHttp().getRequest()
    const method = request.method

    return next.handle().pipe(
      map((data) => {
        if (data === null || data === undefined) {
          return {
            status: false,
            message: 'ไม่พบข้อมูล',
            data: false,
          }
        }

        if (Array.isArray(data) && data.length === 0) {
          return {
            status: false,
            message: 'ไม่พบข้อมูล',
            data: false,
          }
        }

        let message = 'ดำเนินการสำเร็จ'
        switch (method) {
          case 'POST':
            message = 'สร้างข้อมูลสำเร็จ'
            break
          case 'GET':
            message = 'ดึงข้อมูลสำเร็จ'
            break
          case 'PUT':
          case 'PATCH':
            message = 'อัปเดตข้อมูลสำเร็จ'
            break
          case 'DELETE':
            message = 'ลบข้อมูลสำเร็จ'
            break
        }

        return {
          status: true,
          message: message,
          data: Array.isArray(data) ? data : [data],
        }
      }),
    )
  }
}
