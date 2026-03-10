import { Injectable, UnauthorizedException } from '@nestjs/common'
import { UserService } from '../user/user.service'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'

@Injectable()
export class AuthService {

  constructor(
    private usersService: UserService,
    private jwtService: JwtService
  ) { }

  async validateUser(username: string, password: string) {
    const user = await this.usersService.findByUsername(username)
    if (!user) {
      throw new UnauthorizedException('Invalid username')
    }
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      throw new UnauthorizedException('Invalid password')
    }

    return user
  }

  async login(username: string, password: string) {

    const user = await this.validateUser(username, password)
    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role
    }

    return {
      access_token: this.jwtService.sign(payload)
    }
  }

}