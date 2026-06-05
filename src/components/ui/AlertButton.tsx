"use client";

import React from "react";

interface Props {
  children: React.ReactNode;
  message: string;
  className?: string;
}

export default function AlertButton({ children, message, className }: Props) {
  return (
    <button 
      className={className} 
      onClick={() => alert(message)}
    >
      {children}
    </button>
  );
}
