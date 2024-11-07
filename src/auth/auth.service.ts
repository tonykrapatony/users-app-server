import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { UserDocument } from 'src/users/schema/users.schema';
import { FriendsService } from 'src/friends/friends.service';
import { FriendDocument } from 'src/friends/schema/friends.schema';
import { MailerService } from '@nestjs-modules/mailer';


@Injectable()
export class AuthService {

  constructor (private userService: UsersService, private friendsServise: FriendsService,
    private jwtService: JwtService,
    private readonly mailService: MailerService) {}


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

  async forgot(userDto: CreateUserDto) {
    const user: UserDocument = await this.userService.getUserByEmail(userDto.email);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const password = await this.passwordGenerator();

    user.password = await bcrypt.hash(password, 5);
    user.save();

    const isSent = await this.sendMail(userDto.email, password);

    if (!isSent) {
      throw new HttpException('Error', HttpStatus.BAD_REQUEST);
    }

    return {
      status: HttpStatus.OK,
      message: "The letter has been sent",
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

  private async sendMail(email: string, password: string) {
    const message = `Here is your new password: ${password}\nYou can change it in your account settings`;

    try {
      await this.mailService.sendMail({
        from: 'Users app',
        to: email,
        subject: `Reset password`,
        text: message,
      });
      return true
    } catch (error) {
      return false
    }
  }

  private async passwordGenerator() {
    const lowerChars = "abcdefghijklmnopqrstuvwxyz";
    const upperChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const specialChars = "0123456789";
  
    let password = upperChars[Math.floor(Math.random() * upperChars.length)] +
                   specialChars[Math.floor(Math.random() * specialChars.length)];
  
    for (let i = password.length; i < 8; i++) {
      password += lowerChars[Math.floor(Math.random() * lowerChars.length)];
    }
  
    password = password.split('').sort(() => Math.random() - 0.5).join('');
    
    return password;
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