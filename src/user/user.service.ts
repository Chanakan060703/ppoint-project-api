import { Prisma } from '@prisma/client'
import { Injectable, NotFoundException } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { PrismaService } from '../prisma/prisma.service'
import { RegisterDto } from './dto/register.dto'
import { UpdateUserDto } from './dto/update-user.dto'

const userPublicSelect = {
  id: true,
  username: true,
  name: true,
  age: true,
  gender: true,
  role: true,
  pointTotal: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      select: userPublicSelect,
    })
  }

  async findByUsername(username: string) {
    return this.prisma.user.findUnique({
      where: { username },
      select: userPublicSelect,
    })
  }

  async findAuthByUsername(username: string) {
    return this.prisma.user.findUnique({
      where: { username },
    })
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: userPublicSelect,
      orderBy: {
        createdAt: 'desc',
      },
    })
  }

  async getCurrentPoints(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        name: true,
        pointTotal: true,
      },
    })

    if (!user) {
      throw new NotFoundException(`ไม่พบผู้ใช้รหัส ${id}`)
    }

    return {
      userId: user.id,
      username: user.username,
      name: user.name,
      pointTotal: user.pointTotal,
    }
  }

  async create(data: RegisterDto) {
    const hashPassword = await bcrypt.hash(data.password, 10)
    return this.prisma.user.create({
      data: {
        username: data.username,
        password: hashPassword,
        name: data.name,
        age: data.age,
        gender: data.gender,
      },
      select: userPublicSelect,
    })
  }

  async update(id: number, data: UpdateUserDto) {
    const nextData: Prisma.UserUpdateInput = {}

    if (data.username !== undefined) {
      nextData.username = data.username
    }
    if (data.password !== undefined) {
      nextData.password = await bcrypt.hash(data.password, 10)
    }
    if (data.name !== undefined) {
      nextData.name = data.name
    }
    if (data.age !== undefined) {
      nextData.age = data.age
    }
    if (data.gender !== undefined) {
      nextData.gender = data.gender
    }

    return this.prisma.user.update({
      where: { id },
      data: nextData,
      select: userPublicSelect,
    })
  }

  async remove(id: number) {
    return this.prisma.user.delete({
      where: { id },
      select: userPublicSelect,
    })
  }
}
