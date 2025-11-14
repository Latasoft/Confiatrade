import { RouterProvider } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './shared/api/queryClient';
import { router } from './router';
import { NotificationToast } from './shared/components/NotificationToast';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <NotificationToast />
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

export default App;
