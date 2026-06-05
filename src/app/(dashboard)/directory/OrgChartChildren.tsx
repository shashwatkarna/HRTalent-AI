"use client";

import React from 'react';
import OrgChartNode from './OrgChartNode';

export default function OrgChartChildren({ childrenNodes, currentUserEmail }: { childrenNodes: any[], currentUserEmail?: string }) {
  return (
    <ul>
      {childrenNodes.map((child: any) => (
        <OrgChartNode key={child.id} node={child} currentUserEmail={currentUserEmail} />
      ))}
    </ul>
  );
}
