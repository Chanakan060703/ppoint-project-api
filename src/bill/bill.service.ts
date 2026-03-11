import { Prisma, TransactionStatus, TransactionType } from '@prisma/client'
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateBillDto } from './dto/create-bill.dto'
import { UpdateBillDto } from './dto/update-bill.dto'

const billSelect = {
  id: true,
  userId: true,
  name: true,
  price: true,
  discount: true,
  amount: true,
  point: true,
  createdAt: true,
  updatedAt: true,
  user: {
    select: {
      id: true,
      username: true,
      name: true,
      role: true,
      pointTotal: true,
    },
  },
  transactions: {
    select: {
      id: true,
      userId: true,
      point: true,
      status: true,
      type: true,
      createdAt: true,
    },
  },
} satisfies Prisma.BillSelect

@Injectable()
export class BillService {
  constructor(private readonly prisma: PrismaService) { }

  async create(createBillDto: CreateBillDto) {
    const redeemPoint = createBillDto.redeemPoint ?? 0

    if (redeemPoint > 0 && createBillDto.discount <= 0) {
      throw new BadRequestException(
        'หากมีการใช้แต้ม ส่วนลดต้องมากกว่า 0',
      )
    }

    if (createBillDto.amount < 0) {
      throw new BadRequestException('ยอดสุทธิห้ามน้อยกว่า 0')
    }

    return this.prisma.$transaction(
      async (tx) => {
        const user = await tx.user.findUnique({
          where: { id: createBillDto.userId },
          select: {
            id: true,
            pointTotal: true,
          },
        })

        if (!user) {
          throw new NotFoundException(
            `ไม่พบผู้ใช้รหัส ${createBillDto.userId}`,
          )
        }

        if (redeemPoint > user.pointTotal) {
          throw new BadRequestException('คะแนนสะสมของลูกค้าไม่เพียงพอ')
        }

        const bill = await tx.bill.create({
          data: {
            user: { connect: { id: createBillDto.userId } },
            name: createBillDto.name,
            price: createBillDto.price,
            discount: createBillDto.discount,
            amount: createBillDto.amount,
            point: createBillDto.point,
          },
          select: {
            id: true,
          },
        })

        if (redeemPoint > 0) {
          const updatedUser = await tx.user.updateMany({
            where: {
              id: createBillDto.userId,
              pointTotal: {
                gte: redeemPoint,
              },
            },
            data: {
              pointTotal: {
                decrement: redeemPoint,
              },
            },
          })

          if (updatedUser.count === 0) {
            throw new BadRequestException(
              'ไม่สามารถตัดคะแนนได้ เพราะคะแนนคงเหลือไม่พอ',
            )
          }

          await tx.transaction.create({
            data: {
              user: { connect: { id: createBillDto.userId } },
              bill: { connect: { id: bill.id } },
              point: redeemPoint,
              status: TransactionStatus.SUCCESS,
              type: TransactionType.REDEEM,
            },
          })
        }

        if (createBillDto.point > 0) {
          await tx.user.update({
            where: { id: createBillDto.userId },
            data: {
              pointTotal: {
                increment: createBillDto.point,
              },
            },
          })

          await tx.transaction.create({
            data: {
              user: { connect: { id: createBillDto.userId } },
              bill: { connect: { id: bill.id } },
              point: createBillDto.point,
              status: TransactionStatus.SUCCESS,
              type: TransactionType.EARN,
            },
          })
        }

        return tx.bill.findUnique({
          where: { id: bill.id },
          select: billSelect,
        })
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    )
  }

  async findAll() {
    return this.prisma.bill.findMany({
      select: billSelect,
      orderBy: {
        createdAt: 'desc',
      },
    })
  }

  async findOne(id: number) {
    const bill = await this.prisma.bill.findUnique({
      where: { id },
      select: billSelect,
    })

    if (!bill) {
      throw new NotFoundException(`ไม่พบบิลรหัส ${id}`)
    }

    return bill
  }

  async update(id: number, updateBillDto: UpdateBillDto) {
    await this.findOne(id)

    if (updateBillDto.userId !== undefined) {
      await this.ensureUserExists(updateBillDto.userId)
    }

    const data: Prisma.BillUpdateInput = {}

    if (updateBillDto.userId !== undefined) {
      data.user = { connect: { id: updateBillDto.userId } }
    }

    if (updateBillDto.name !== undefined) {
      data.name = updateBillDto.name
    }

    if (updateBillDto.price !== undefined) {
      data.price = updateBillDto.price
    }

    if (updateBillDto.discount !== undefined) {
      data.discount = updateBillDto.discount
    }

    if (updateBillDto.amount !== undefined) {
      data.amount = updateBillDto.amount
    }

    if (updateBillDto.point !== undefined) {
      data.point = updateBillDto.point
    }

    return this.prisma.bill.update({
      where: { id },
      data,
      select: billSelect,
    })
  }

  async remove(id: number) {
    await this.findOne(id)

    return this.prisma.bill.delete({
      where: { id },
      select: billSelect,
    })
  }

  private async ensureUserExists(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    })

    if (!user) {
      throw new NotFoundException(`ไม่พบผู้ใช้รหัส ${userId}`)
    }
  }
}
