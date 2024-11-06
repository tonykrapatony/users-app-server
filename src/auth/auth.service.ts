import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from 'src/users/schema/users.schema';
import { FriendsService } from 'src/friends/friends.service';
import { FriendDocument } from 'src/friends/schema/friends.schema';


@Injectable()
export class AuthService {

  constructor (private userService: UsersService, private friendsServise: FriendsService,
    private jwtService: JwtService) {}


  async login(userDto: CreateUserDto) {
    const requiredFields = ['email', 'password'];
    const missingFields = requiredFields.filter(field => !userDto[field]);

    if (missingFields.length > 0) {
      throw new HttpException(`Missing fields: ${missingFields.join(', ')}`, HttpStatus.BAD_REQUEST);
    }
    const user: UserDocument = await this.validateUser(userDto);
    const {token, refreshToken} = await this.generateTokens(user);
    return {
      status: HttpStatus.OK,
      userId: user._id,
      token: token,
      refreshToken: refreshToken
    };
  }

  async registration(userDto: CreateUserDto) {
    const requiredFields = ['email', 'password', 'firstName', 'lastName'];
    const missingFields = requiredFields.filter(field => !userDto[field]);

    if (missingFields.length > 0) {
      throw new HttpException(`Missing fields: ${missingFields.join(', ')}`, HttpStatus.BAD_REQUEST);
    }
    
    const candidate = await this.userService.getUserByEmail(userDto.email);
    if (candidate) {
      throw new HttpException('This user already exists', HttpStatus.BAD_REQUEST);
    }
    const hashPassword = await bcrypt.hash(userDto.password, 5);
    
    const user: UserDocument = await this.userService.createUser({
      ...userDto,
      password: hashPassword,
    });

    const friendsItem: FriendDocument = await this.friendsServise.createItem({
      userId: user._id.toString(),
      acceptedFriends: [],
      requestedFriends: []
    })

    if (friendsItem) {
      // console.log(friendsItem._id);
      await this.userService.updateUser(user._id.toString(), {
        friends: friendsItem._id.toString()
      })
    }

    const {token, refreshToken} = await this.generateTokens(user);

    return {
      status: HttpStatus.CREATED,
      userId: user._id,
      token: token,
      refreshToken: refreshToken
    };
  }

  async refreshToken(refreshToken: string) {
    if (!refreshToken) {
      throw new HttpException('Refresh token is missing', HttpStatus.BAD_REQUEST);
    }

    try {
      const userData = this.jwtService.verify(refreshToken);
      const user: UserDocument = await this.userService.getUserByEmail(userData.email);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const { token, refreshToken: newRefreshToken } = await this.generateTokens(user);

      return {
        status: HttpStatus.OK,
        userId: user._id,
        token: token,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private async generateTokens(user: UserDocument) {
    const payload = {
      email: user.email,
      id: user._id.toString()
    }
    const token = this.jwtService.sign(payload, { expiresIn: '1d' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '30d' });

    return { token, refreshToken };
  }

  private async validateUser(userDto: CreateUserDto) {
    const user = await this.userService.getUserByEmail(userDto.email);
    if (!user ) {
      throw new UnauthorizedException({
        status: HttpStatus.UNAUTHORIZED,
        message: 'Incorrect email'
      })
    }
    const passwordEquals = await bcrypt.compare(userDto.password, user.password);
    if (!passwordEquals ) {
      throw new UnauthorizedException({
        status: HttpStatus.UNAUTHORIZED,
        message: 'Incorrect password'
      })
    }
    return user as UserDocument;
  }
}