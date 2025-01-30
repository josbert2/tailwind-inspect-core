import { useEffect, useRef, useState } from 'react';

import tailwindConfig from '../../tailwind.config';



const extendedTheme = {
    ...tailwindConfig.theme?.extend,
};

const LoadTailwindCDN = () => {
  const cdnScriptRef = useRef<HTMLScriptElement | null>(null);
  const [isTailwindLoaded, setIsTailwindLoaded] = useState(false);
  
  useEffect(() => {

    if (!cdnScriptRef.current) {
      const script = document.createElement('script');
      script.src = 'https://cdn.tailwindcss.com';
      script.async = true;

      script.onload = () => {
        setIsTailwindLoaded(true);
      };

      document.head.appendChild(script);
      cdnScriptRef.current = script;
    }
  }, []);



  useEffect(() => {
    if (isTailwindLoaded) {
      const configScript = document.createElement('script');
      configScript.textContent = `
        tailwind.config = {
          theme: {
            
            extend: {
             ${
               Object.entries(extendedTheme).map(([key, value]) => {
                 return `${key}: ${JSON.stringify(value)},`;
               }).join('\n')
             }
            }
          }
        };
      `;
      console.log(configScript);
      document.querySelector('body')?.appendChild(configScript);
    }
  }, [isTailwindLoaded]);

  return null; // No renderiza nada
};

export default LoadTailwindCDN;
