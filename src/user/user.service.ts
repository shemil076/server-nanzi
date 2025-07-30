import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  private users = [
    { id: 1, name: 'Leanne Graham', email: 'sincer@april.biz', role: 'INTERN' },
    { id: 2, name: 'Ervin Howell', email: 'howell@april.biz', role: 'ADMIN' },
    { id: 3, name: 'Smith John', email: 'smith@april.biz', role: 'ENGINEER' },
    { id: 4, name: 'Bob cruise', email: 'cruise@april.biz', role: 'ENGINEER' },
    { id: 5, name: 'Tom Hanks', email: 'hanks@april.biz', role: 'INTERN' },
  ];

  findAll(role?: 'INTERN' | 'ENGINEER' | 'ADMIN') {
    if (role) {
      const rolesArray = this.users.filter((user) => user.role === role);

      if (!rolesArray.length)
        throw new NotFoundException('User Role not found');
      return rolesArray;
    }

    return this.users;
  }

  findOne(id: number) {
    const user = this.users.find((user) => user.id === id);

    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  create(createUserDto: CreateUserDto) {
    const userByHighestId = [...this.users].sort((a, b) => b.id - a.id);
    const newUser = {
      id: userByHighestId[0].id + 1,
      ...createUserDto,
    };

    this.users.push(newUser);
    return newUser;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    this.users = this.users.map((user) => {
      if (user.id === id) {
        return { ...user, ...updateUserDto };
      }
      return user;
    });

    return this.findOne(id);
  }

  delete(id: number) {
    const removedUser = this.findOne(id);
    this.users = this.users.filter((user) => user.id !== id);
    return removedUser;
  }
}
