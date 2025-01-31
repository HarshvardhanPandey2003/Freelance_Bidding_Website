import { Container, Typography, Box } from '@mui/material';
import { useAuth } from '../hooks/useAuth';

export const FreelancerDashboard = () => {
  const { user } = useAuth();

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box textAlign="center">
        <Typography variant="h4" gutterBottom>
          Welcome, {user?.username}
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Freelancer dashboard coming soon!
        </Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          Check back later to browse projects and submit bids.
        </Typography>
      </Box>
    </Container>
  );
};