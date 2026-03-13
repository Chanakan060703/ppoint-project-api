import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter'
import { ResponseInterceptor } from './common/interceptors/response.interceptor'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  )

  app.useGlobalFilters(new PrismaExceptionFilter())
  app.useGlobalInterceptors(new ResponseInterceptor())

  await app.listen(process.env.PORT ?? 3001)
}
bootstrap()
