import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto'
import { User, UserDocument } from './schema/users.schema';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangeUserPasswordDto } from './dto/change-user-password.dto';
import * as bcrypt from 'bcrypt';
import { v2 as cloudinary } from 'cloudinary'

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async createUser(createUserDto: CreateUserDto): Promise<UserDocument> {
    const createdUser = await this.userModel.create(createUserDto);
    return createdUser;
  }

  async getAllUsers(): Promise<{ status: number; users: User[] }> {
    const usersList = await this.userModel.find().exec();
    if (usersList.length === 0) {
      throw new HttpException('Users not found', HttpStatus.BAD_REQUEST);
    }

    const users = usersList.map(user => {
      const userObject = user.toObject();
      delete userObject.password;
      return userObject;
    });

    return {
      status: HttpStatus.OK,
      users
    }
  }

  async getUserById(id: string): Promise<{ status: number; user: Partial<UserDocument> }> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new HttpException('Invalid ID format', HttpStatus.BAD_REQUEST);
    }
    const findUser: UserDocument = await this.userModel.findOne({ _id: id }).exec();
    if (!findUser) {
      throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
    }
    
    const user = findUser.toObject();
    delete user.password;

    return {
      status: HttpStatus.OK,
      user
    };
  }

  async getUserByEmail(email: string): Promise<UserDocument | null> {
    const user: UserDocument = await this.userModel.findOne({ email: email }).exec();
    return user
  }

  async updateUser(id: string, updateUserDto: Partial<UpdateUserDto>): Promise<{ status: number; message: string }> {
    const {firstName, lastName, email, phone, photo} = updateUserDto;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new HttpException('Invalid ID format', HttpStatus.BAD_REQUEST);
    }

    const findUser = await this.userModel.findOne({ _id: id });

    if (!findUser) {
      throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
    }
    if (Object.keys(updateUserDto).length === 0) {
      throw new HttpException('Enter your data', HttpStatus.BAD_REQUEST);
    }
    if (photo) {
      const uploadPhoto = await this.fileUpload(photo);
      if (uploadPhoto) {
        updateUserDto.photo = uploadPhoto;
      }
    }

    await this.userModel.findByIdAndUpdate(id, updateUserDto, {
      new: true,
    });

    return {
      status: HttpStatus.OK,
      message: 'Information has been successfully updated',
    };
  }

  async changeUserPassword(id: string, changeUserPasswordDto: ChangeUserPasswordDto): Promise<{ status: number; message: string }> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new HttpException('Invalid ID format', HttpStatus.BAD_REQUEST);
    }

    const user = await this.userModel.findOne({ _id: id });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
    }

    const passwordEquals = await bcrypt.compare(changeUserPasswordDto.password, user.password);
    if (!passwordEquals ) {
      throw new UnauthorizedException({
        status: HttpStatus.UNAUTHORIZED,
        message: 'Incorrect old password'
      })
    }

    if (changeUserPasswordDto.password === changeUserPasswordDto.new_password) {
      throw new HttpException('Old and new passwords are the same', HttpStatus.BAD_REQUEST);
    }

    const newPassword = await bcrypt.hash(changeUserPasswordDto.new_password, 5);

    const chnagePassword = await this.userModel.findByIdAndUpdate(id, {password: newPassword}, {
      new: true,
    });

    if (!chnagePassword) {
      throw new HttpException('Error when changing password', HttpStatus.BAD_REQUEST);
    }
    return {
      status: HttpStatus.OK,
      message: 'Password successfully changed',
    };
  }

  async delete(id: string): Promise<{ status: number; message: string }> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new HttpException('Invalid ID format', HttpStatus.BAD_REQUEST);
    }
    const result = await this.userModel.findByIdAndDelete({ _id: id }).exec();
    if (!result) {
      throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
    }
    return {
      status: HttpStatus.OK,
      message: 'User successfully deleted'
    }
  }


  private async fileUpload(file: string) {
    cloudinary.config({ 
      cloud_name: process.env.CLOUDINARY_NAME, 
      api_key: process.env.CLOUDINARY_KEY,
      api_secret: process.env.CLOUDINARY_SECRET, 
    });
    try {
      const result = await cloudinary.uploader.upload(file, { folder: 'users-app' });
  
      if (!result) {
        throw new HttpException('File not found', HttpStatus.NOT_FOUND);
      }
  
      return result.secure_url;
    } catch (error) {
      throw new HttpException('File upload failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

}
