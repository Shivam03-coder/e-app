import App from './app';
import { gracefulShutdown } from './utils/serevr-shutdown';

const appInstance = new App();

(async () => {
  try {
    await appInstance.listen();
    process.on('SIGTERM', () => gracefulShutdown(appInstance, 'SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown(appInstance, 'SIGINT'));
    process.on('uncaughtException', (err) => {
      console.error('💥 Uncaught Exception:', err);
      gracefulShutdown(appInstance, 'UNCAUGHT_EXCEPTION');
    });
    process.on('unhandledRejection', (reason, promise) => {
      console.error('🚨 Unhandled Rejection at:', promise, 'reason:', reason);
      gracefulShutdown(appInstance, 'UNHANDLED_REJECTION');
    });
  } catch (error) {
    console.error('❌ Server startup failed:', error);
    process.exit(1);
  }
})();
