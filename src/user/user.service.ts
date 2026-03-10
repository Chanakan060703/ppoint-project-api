import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { Prisma } from '@prisma/client'
import * as bcrypt from 'bcrypt'

@Injectable()
export class UserService {

  constructor(private prisma: PrismaService) { }

  async findById(id: number) {
    return this.prisma.user.findUnique({
      where: { id }
    })
  }

  async findByUsername(username: string) {
    return this.prisma.user.findUnique({
      where: { username }
    })
  }

  async findAll() {
    return this.prisma.user.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })
  }

  async create(data: Prisma.UserCreateInput) {
    const hashPassword = await bcrypt.hash(data.password, 10)
    return this.prisma.user.create({
      data: {
        ...data,
        password: hashPassword
      }
    })
  }

  async update(id: number, data: Prisma.UserUpdateInput) {
    return this.prisma.user.update({
      where: { id },
      data
    })
  }

  async remove(id: number) {
    return this.prisma.user.delete({
      where: { id }
    })
  }

}