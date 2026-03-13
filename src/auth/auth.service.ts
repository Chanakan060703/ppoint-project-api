import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { UserService } from '../user/user.service'
import { RegisterDto } from '../user/dto/register.dto'
import { LoginDto } from './dto/login'

type AuthUser = {
  id: number
  username: string
  role: string
  name: string
  age: number
  gender: string
  pointTotal: number
  createdAt: Date
  updatedAt: Date
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UserService,
    private readonly jwtService: JwtService,
  ) { }

  async validateUser(username: string, password: string) {
    const user = await this.usersService.findAuthByUsername(username)
    if (!user) {
      throw new UnauthorizedException('Invalid username or password')
    }
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      throw new UnauthorizedException('Invalid username or password')
    }
    return user
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.username, loginDto.password)
    const publicUser = await this.usersService.findById(user.id)
    if (!publicUser) {
      throw new UnauthorizedException('User not found')
    }

    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role,
    }

    return {
      user: user.id,
      access_token: this.jwtService.sign(payload),
    }
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersService.findByUsername(
      registerDto.username,
    )
    if (existingUser) {
      throw new ConflictException('ชื่อผู้ใช้นี้มีอยู่แล้ว')
    }
    
    const user = await this.usersService.create(registerDto)

    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role || 'USER',
    }

    return {
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      }
    }
  }
}