import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { UserModule } from './user/user.module';
import { TransactionModule } from './transaction/transaction.module';
import { BillModule } from './bill/bill.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [UserModule, TransactionModule, BillModule, AuthModule],
  controllers: [AppController],
})
export class AppModule { }
