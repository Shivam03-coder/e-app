import App from './app';

const appInstance = new App();

(async () => {
  try {
    await appInstance.listen();
  } catch (error) {
    console.error('❌ Server startup failed:', error);
    process.exit(1);
  }
})();
