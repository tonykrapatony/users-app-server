import { Controller, Get, HttpCode, HttpStatus, Options, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';

@Controller()
export class AppController {
  constructor() {}
  
  @Options()
  options(@Req() req: Request, @Res() res: Response) {
    console.log('req: ', req);
    console.log('res: ', res);

    res.set('Access-Control-Allow-Origin', 'http://localhost:5173');
    res.set('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.set('Access-Control-Allow-Credentials', 'true');
    res.status(204).send();
  }

  @Get()
  getHello(): any {
    console.log('hello');
    return {
      code: HttpStatus.OK,
      data: "Hello"
    };
  }
}