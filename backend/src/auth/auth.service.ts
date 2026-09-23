import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { compare, hash } from 'bcryptjs';
import { Repository } from 'typeorm';
import { UserEntity } from './user.entity.js';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>,
    private readonly jwtService: JwtService,
  ) {}

  async register(username: string, password: string) {
    const normalizedUsername = username.trim().toLowerCase();
    this.validateCredentials(normalizedUsername, password);
    const existingUser = await this.userRepository.findOne({ where: { username: normalizedUsername } });
    if (existingUser) throw new ConflictException('Username is already in use');
    const user = await this.userRepository.save(this.userRepository.create({
      username: normalizedUsername,
      passwordHash: await hash(password, 12),
    }));
    return this.createSession(user);
  }

  async login(username: string, password: string) {
    const user = await this.userRepository.findOne({ where: { username: username.trim().toLowerCase() } });
    if (!user || !(await compare(password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid username or password');
    }
    return this.createSession(user);
  }

  private createSession(user: UserEntity) {
    return {
      token: this.jwtService.sign({ sub: user.id, username: user.username }),
      user: { id: user.id, username: user.username },
    };
  }

  private validateCredentials(username: string, password: string) {
    if (!/^[a-zA-Z0-9_.-]{3,100}$/.test(username)) {
      throw new UnauthorizedException('Username must be 3-100 characters and use letters, numbers, _, ., or -');
    }
    if (password.length < 8) throw new UnauthorizedException('Password must be at least 8 characters');
  }
}