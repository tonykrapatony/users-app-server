import { OnModuleInit } from '@nestjs/common';
import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io'
import { UsersService } from '../users/users.service';
import { User } from 'src/users/schema/users.schema';
import { Model } from 'mongoose';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
 })
export class EventsGateway implements OnModuleInit {
  constructor(private readonly usersService: UsersService) {}

  @WebSocketServer()
  server: Server;

  onModuleInit() {
    this.server.on('connection', (socket) => {
      // console.log(socket.id);
      // console.log('Connected');
    });
  }

  @SubscribeMessage('events')
  handleMessage(@MessageBody() body: any) {
    this.server.emit('onMessage', {
      msg: 'New Message',
      content: body
    })
  }

  @SubscribeMessage('users')
  async handleUsers(client: any, data: any) {
    try {
      const { users } = await this.usersService.getAllUsers();  
      console.log('Fetched users: ', users); // Лог користувачів
      // Явно вказуємо подію і дані для відповіді
      // return { event: 'users', data: users };
      // this.server.emit('getUsers', users)
      let timer = setInterval(() => {
        this.server.emit('getUsers', users)
      }, 3000);

      this.server.on('disconnect', () => {
        clearInterval(timer);
      })

    } catch (error) {
      console.error('Error fetching users:', error);
      return { event: 'users', data: { error: 'Unable to fetch users' } };
    }
  }

}


