import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js'; // Keep the .js extension intact

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS so your React application can communicate safely
  // app.enableCors({
  //   origin: 'http://localhost:5173', 
  //   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  // });
  app.enableCors({
    origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
    credentials: true,
  });

  await app.listen(3000);
}
bootstrap();
// import { NestFactory } from '@nestjs/core';
// import { AppModule, ObserveInstrument } from './app.module.js';

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule, {
//     instrument: ObserveInstrument,
//   });
//   await app.listen(process.env.PORT ?? 3000);
// }
// await bootstrap();
