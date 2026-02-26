/**
 * CRACO Configuration for FormuLAW
 * Enables @ path alias for cleaner imports
 * 
 * Usage: import { Button } from '@/components/ui/button'
 */

const path = require("path");

module.exports = {
  webpack: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
};
