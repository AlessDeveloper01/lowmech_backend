import {
  Injectable,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  async create(dto: CreateUserDto): Promise<Omit<User, 'password'>> {
    const exists = await this.usersRepo.findOne({
      where: [{ username: dto.username }, { email: dto.email }],
    });
    if (exists) {
      throw new ConflictException('El username o email ya existe');
    }

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = this.usersRepo.create({ ...dto, password: hashed });
    const saved = await this.usersRepo.save(user);
    const { password, ...result } = saved;
    return result as Omit<User, 'password'>;
  }

  async findAll(): Promise<Omit<User, 'password'>[]> {
    const users = await this.usersRepo.find();
    return users.map(({ password, ...rest }) => rest as Omit<User, 'password'>);
  }

  async findOne(id: number): Promise<Omit<User, 'password'>> {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    }
    const { password, ...result } = user;
    return result as Omit<User, 'password'>;
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.usersRepo.findOne({ where: { username } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepo.findOne({ where: { email } });
  }

  async setResetToken(id: number, token: string | null, expires: Date | null): Promise<void> {
    await this.usersRepo.update(id, { resetToken: token, resetTokenExpires: expires });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await this.usersRepo.findOne({ where: { resetToken: token } });
    if (!user) {
      throw new NotFoundException('Token inválido');
    }
    if (user.resetTokenExpires && user.resetTokenExpires < new Date()) {
      throw new UnauthorizedException('El token ha expirado');
    }
    const hashed = await bcrypt.hash(newPassword, 10);
    await this.usersRepo.update(user.id, {
      password: hashed,
      resetToken: null,
      resetTokenExpires: null,
    });
  }

  async update(
    id: number,
    dto: UpdateUserDto,
  ): Promise<Omit<User, 'password'>> {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    }

    if (dto.password) {
      dto.password = await bcrypt.hash(dto.password, 10);
    }

    Object.assign(user, dto);
    const saved = await this.usersRepo.save(user);
    const { password, ...result } = saved;
    return result as Omit<User, 'password'>;
  }

  async remove(id: number): Promise<{ message: string }> {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    }
    await this.usersRepo.remove(user);
    return { message: `Usuario con id ${id} eliminado correctamente` };
  }
}
