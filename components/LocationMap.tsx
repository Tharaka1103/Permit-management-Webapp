'use client';

import React from 'react';
import { MapPinIcon, ExternalLinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LocationMapProps {
  latitude: number;
  longitude: number;
  zoom?: number;
  height?: string;
  showOpenInMaps?: boolean;
}

const LocationMap: React.FC<LocationMapProps> = ({ 
  latitude, 
  longitude, 
  zoom = 15, 
  height = '300px',
  showOpenInMaps = true 
}) => {
  const openInGoogleMaps = () => {
    const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
    window.open(url, '_blank');
  };

  const openInAppleMaps = () => {
    const url = `http://maps.apple.com/?q=${latitude},${longitude}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-3">
      <div 
        className="relative rounded-lg overflow-hidden border border-gray-200 bg-gray-100"
        style={{ height }}
      >
        {/* Using OpenStreetMap tiles with Leaflet-style display */}
        <iframe
          width="100%"
          height="100%"
          style={{ border: 0 }}
          src={`https://www.openstreetmap.org/export/embed.html?bbox=${longitude-0.01},${latitude-0.01},${longitude+0.01},${latitude+0.01}&layer=mapnik&marker=${latitude},${longitude}`}
          title="Location Map"
        />
        
      </div>

      {showOpenInMaps && (
        <div className="flex space-x-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={openInGoogleMaps}
            className="flex-1"
          >
            <ExternalLinkIcon className="mr-1 h-4 w-4" />
            Open in Google Maps
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={openInAppleMaps}
            className="flex-1"
          >
            <ExternalLinkIcon className="mr-1 h-4 w-4" />
            Open in Apple Maps
          </Button>
        </div>
      )}
    </div>
  );
};

export default LocationMap;
