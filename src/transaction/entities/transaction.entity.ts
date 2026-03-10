import { TransactionStatus } from "@prisma/client"
import { Timestamp } from "rxjs"

export class Transaction {
    id: number
    userId: number
    billId: number
    point: number
    status: TransactionStatus
}
