import { NotFoundException } from '@nestjs/common'
import { Prisma, TransactionStatus, TransactionType } from '@prisma/client'
import { Test, TestingModule } from '@nestjs/testing'
import { PrismaService } from '../prisma/prisma.service'
import { BillService } from './bill.service'

describe('BillService', () => {
  let service: BillService

  const prisma = {
    $transaction: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile()

    service = module.get<BillService>(BillService)
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('creates a bill that only earns points when the user has no points', async () => {
    const tx = createTxMock({
      user: { id: 1, pointTotal: 0 },
      bill: { id: 11, amount: new Prisma.Decimal(500), discount: new Prisma.Decimal(0), point: 50 },
    })

    prisma.$transaction.mockImplementation(async (callback: (tx: unknown) => unknown) => callback(tx))

    const result = await service.create({ userId: 1, name: 'Coffee Beans', price: 500 })

    expect(tx.bill.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 1,
        name: 'Coffee Beans',
        price: 500,
        discount: expect.any(Prisma.Decimal),
        amount: expect.any(Prisma.Decimal),
        point: 50,
      }),
      select: { id: true },
    })
    expect(tx.transaction.create).toHaveBeenCalledTimes(1)
    expect(tx.transaction.create).toHaveBeenCalledWith({
      data: {
        userId: 1,
        billId: 11,
        point: 50,
        status: TransactionStatus.SUCCESS,
        type: TransactionType.EARN,
      },
    })
    expect(tx.user.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { pointTotal: { increment: 50 } },
    })
    expect(result).toEqual(tx.billRecord)
  })

  it('creates redeem and earn transactions and applies net positive points', async () => {
    const tx = createTxMock({
      user: { id: 2, pointTotal: 10 },
      bill: { id: 22, amount: new Prisma.Decimal(490), discount: new Prisma.Decimal(10), point: 50 },
    })

    prisma.$transaction.mockImplementation(async (callback: (tx: unknown) => unknown) => callback(tx))

    await service.create({ userId: 2, name: 'Protein', price: 500 })

    expect(tx.transaction.create).toHaveBeenNthCalledWith(1, {
      data: {
        userId: 2,
        billId: 22,
        point: 10,
        status: TransactionStatus.SUCCESS,
        type: TransactionType.REDEEM,
      },
    })
    expect(tx.transaction.create).toHaveBeenNthCalledWith(2, {
      data: {
        userId: 2,
        billId: 22,
        point: 50,
        status: TransactionStatus.SUCCESS,
        type: TransactionType.EARN,
      },
    })
    expect(tx.user.update).toHaveBeenCalledWith({
      where: { id: 2 },
      data: { pointTotal: { increment: 40 } },
    })
  })

  it('caps redeemed points by price and applies a net point decrease', async () => {
    const tx = createTxMock({
      user: { id: 3, pointTotal: 1000 },
      bill: { id: 33, amount: new Prisma.Decimal(0), discount: new Prisma.Decimal(500), point: 50 },
    })

    prisma.$transaction.mockImplementation(async (callback: (tx: unknown) => unknown) => callback(tx))

    await service.create({ userId: 3, name: 'Speaker', price: 500 })

    const billCreateArg = tx.bill.create.mock.calls[0][0]
    expect(billCreateArg.data.discount.toNumber()).toBe(500)
    expect(billCreateArg.data.amount.toNumber()).toBe(0)
    expect(tx.user.update).toHaveBeenCalledWith({
      where: { id: 3 },
      data: { pointTotal: { decrement: 450 } },
    })
  })

  it('throws when the user does not exist', async () => {
    const tx = createTxMock({ user: null })

    prisma.$transaction.mockImplementation(async (callback: (tx: unknown) => unknown) => callback(tx))

    await expect(
      service.create({ userId: 404, name: 'Missing', price: 500 })
    ).rejects.toBeInstanceOf(NotFoundException)
  })
})

function createTxMock({
  user,
  bill,
}: {
  user: { id: number; pointTotal: number } | null
  bill?: { id: number; amount: Prisma.Decimal; discount: Prisma.Decimal; point: number }
}) {
  const billRecord = bill
    ? {
        id: bill.id,
        userId: user?.id ?? 0,
        name: 'mock-bill',
        price: new Prisma.Decimal(500),
        discount: bill.discount,
        amount: bill.amount,
        point: bill.point,
        createdAt: new Date(),
        updatedAt: new Date(),
        user: {
          id: user?.id ?? 0,
          username: 'mock-user',
          name: 'Mock User',
          role: 'USER',
          pointTotal: user?.pointTotal ?? 0,
        },
        transactions: [],
      }
    : null

  return {
    billRecord,
    user: {
      findUnique: jest.fn().mockResolvedValue(user),
      update: jest.fn().mockResolvedValue(null),
    },
    bill: {
      create: jest.fn().mockResolvedValue({ id: bill?.id ?? 1 }),
      findUnique: jest.fn().mockResolvedValue(billRecord),
    },
    transaction: {
      create: jest.fn().mockResolvedValue(null),
    },
  }
}
