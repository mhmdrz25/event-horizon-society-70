
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const UnauthorizedPage: React.FC = () => {
  return (
    <div className="container flex flex-col items-center justify-center min-h-[80vh] py-8 px-4 text-center">
      <h1 className="text-4xl font-bold mb-4">Access Denied</h1>
      <p className="text-xl mb-8 max-w-md">
        You don't have permission to access this page. Please contact an administrator if you believe this is an error.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Button asChild>
          <Link to="/">Go to Home</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/profile">View Your Profile</Link>
        </Button>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
