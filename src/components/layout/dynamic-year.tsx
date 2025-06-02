"use client";

import { useState, useEffect } from 'react';

export default function DynamicYear() {
  const [year, setYear] = useState<number | string>("..."); // Placeholder during SSR and initial client render

  useEffect(() => {
    // This effect runs only on the client, after the component has mounted
    setYear(new Date().getFullYear());
  }, []); // Empty dependency array ensures this runs once on mount

  return <>{year}</>;
}
