export const APP_ERROR = 'APP_ERROR';
export const APP_LOADING_DONE = 'APP_LOADING_DONE';

export const appError = (message) => ({
  type: APP_ERROR,
  error: { message }
});

export const appDoneLoading = () => ({
  type: APP_LOADING_DONE
});
