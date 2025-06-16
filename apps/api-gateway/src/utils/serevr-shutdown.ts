import App from '../app';

export const gracefulShutdown = async (
  app: App,
  signal: string
): Promise<void> => {
  console.log(`\n⚠️  Received ${signal}. Shutting down gracefully...`);

  try {
    await app.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Graceful shutdown failed:', error);
    process.exit(1);
  } finally {
    setTimeout(() => {
      console.log('⏰ Shutdown timeout reached, forcing exit');
      process.exit(1);
    }, 10000).unref();
  }
};
