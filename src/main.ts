import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: [process.env.CORS_ORIGIN],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  });

  const port = process.env.PORT || 8000;
  await app.listen(port);
  console.log(`Application is running on port ${port}`);
}

void bootstrap().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});
