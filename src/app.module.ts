import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { TransactionModule } from './transaction/transaction.module';
import { BillModule } from './bill/bill.module';
import { UsertokenModule } from './usertoken/usertoken.module';

@Module({
  imports: [UserModule, TransactionModule, BillModule, UsertokenModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
