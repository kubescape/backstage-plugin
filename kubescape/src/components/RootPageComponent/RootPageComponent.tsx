import { Navigate, Route, Routes } from 'react-router-dom';
import React from 'react';
import { LandingPageComponent } from '../LandingPageComponent';
import { ClusterPageComponent } from '../ClusterPageComponent';

export function RootPageComponent() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="landing" />} />
      <Route path="/landing" element={<LandingPageComponent />} />
      <Route path="/cluster" element={<ClusterPageComponent />} />
      <Route path="/vulnerability" />
    </Routes>
  );
}
