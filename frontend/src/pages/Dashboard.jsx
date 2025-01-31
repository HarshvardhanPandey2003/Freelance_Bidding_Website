import { useAuth } from '../hooks/useAuth';
import { ClientDashboard } from './ClientDashboard';
import { FreelancerDashboard } from './FreelancerDashboard';
import { CircularProgress, Box } from '@mui/material';
export const Dashboard = () => {
  const { user, loading } = useAuth();

  return (
    <>
      
      <main>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : user?.role === 'client' ? (<ClientDashboard />) : ( <FreelancerDashboard /> )}
      </main>
    </>
  );
};