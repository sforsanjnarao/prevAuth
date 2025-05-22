
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Placeholder cat image (publicly available from Unsplash)
const catImage = 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';

function NotFound() {
  const navigate = useNavigate();

  // Animation variants for the cat
  const catVariants = {
    initial: { y: 0, scale: 1 },
    animate: {
      y: [-10, 10, -10], // Bounce up and down
      x: [0, 20, 0], // Slight horizontal movement
      scale: [1, 1.05, 1], // Slight scaling for liveliness
      transition: {
        y: { repeat: Infinity, duration: 2, ease: 'easeInOut' },
        x: { repeat: Infinity, duration: 4, ease: 'easeInOut' },
        scale: { repeat: Infinity, duration: 3, ease: 'easeInOut' },
      },
    },
  };

  return (
    <div className="absolute top-0 left-0 w-full h-full bg-[#0a192f] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        <Card className="bg-[#112240] border-gray-900/50 shadow-lg">
          <CardHeader className="space-y-4 text-center">
            <CardTitle className="text-3xl font-bold text-gray-100">
              404 - Page Not Found
            </CardTitle>
            <CardDescription className="text-gray-300">
              Oops! This page seems to have wandered off like a curious cat.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            < img
              src={catImage}
              alt="Curious cat indicating 404 error"
              variants={catVariants}
              initial="initial"
              animate="animate"
              className="max-w-full h-auto rounded-lg shadow-md"
              style={{ maxHeight: '200px', objectFit: 'contain' }}
            />
          </CardContent>
          <CardFooter className="justify-center">
            <Button
              onClick={() => navigate('/')}
              className="bg-blue-600 hover:bg-blue-700 text-gray-100"
              aria-label="Return to home page"
            >
              <Home className="h-5 w-5 mr-2 text-gray-400" aria-hidden="true" />
              Return to Home
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}

export default NotFound;