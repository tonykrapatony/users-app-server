import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cors from 'cors'

async function start() {
  const PORT = process.env.PORT || 5000

  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1')
  app.enableCors();
  app.use(cors());
  await app.listen(PORT, () => {console.log(app.getUrl)});
}
start();
