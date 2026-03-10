import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common'
import { Role } from '@prisma/client'

@Injectable()
export class OwnerOrAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{
      user?: { userId?: number; role?: Role }
      params: { id?: string }
    }>()

    const user = request.user
    const resourceId = Number(request.params.id)

    if (!user?.userId || Number.isNaN(resourceId)) {
      throw new ForbiddenException('ไม่สามารถตรวจสอบสิทธิ์การเข้าถึงข้อมูลได้')
    }

    if (user.role === Role.ADMIN) {
      return true
    }

    if (user.userId !== resourceId) {
      throw new ForbiddenException('คุณไม่มีสิทธิ์เข้าถึงข้อมูลของผู้ใช้อื่น')
    }

    return true
  }
}
