// ZonePopupContent.tsx
import React from 'react';
import { Zone } from '../../utils/types';

interface ZonePopupContentProps {
  zone: Zone;
}

const ZonePopupContent: React.FC<ZonePopupContentProps> = ({ zone }) => {
  return (
    <div>
      <h4>{zone.name}</h4>
      <p>Type: {zone.type}</p>
      <p>{zone.description}</p>
      <button>Edit</button>
      <button>Delete</button>
    </div>
  );
};

export default ZonePopupContent;