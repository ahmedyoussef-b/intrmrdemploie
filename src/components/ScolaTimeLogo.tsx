
import type React from 'react';

const ScolaTimeLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 100 100"
    fill="none"
    stroke="currentColor"
    strokeWidth="5"
    {...props}
    aria-label="Logo ScolaTime"
  >
    <title>Logo ScolaTime</title>
    {/* Carré extérieur représentant la structure/l'horaire */}
    <rect x="10" y="10" width="80" height="80" rx="10" className="stroke-primary" />

    {/* Forme abstraite 'S' */}
    <path
      d="M65 25 C50 25, 50 40, 35 40 C20 40, 20 60, 35 60 C50 60, 50 75, 65 75"
      className="stroke-accent"
      strokeWidth="6"
      strokeLinecap="round"
    />
    
    {/* Élément d'aiguille d'horloge - plus court représentant l'heure */}
    <line x1="50" y1="50" x2="50" y2="30" className="stroke-primary" strokeWidth="4" strokeLinecap="round"/>
    {/* Élément d'aiguille d'horloge - plus long représentant la minute */}
    <line x1="50" y1="50" x2="65" y2="58" className="stroke-accent" strokeWidth="4" strokeLinecap="round"/>
    
    {/* Petit cercle au centre */}
    <circle cx="50" cy="50" r="4" className="fill-primary stroke-none" />
  </svg>
);

export default ScolaTimeLogo;
