import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js'; // Keep the .js extension intact

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Dynamic CORS configuration to allow your deployed Vite frontend to connect
  app.enableCors({
    origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // CRITICAL: Read Cloud Run's dynamic port, falling back to 3000 for local dev
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on port: ${port}`);
}
bootstrap();
