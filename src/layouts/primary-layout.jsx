import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";

const PrimaryLayout = () => {
  return (
    <div className="w-full h-full">
      <main className="bg-background w-full h-full">
        <Outlet />
      </main>
    </div>
  );
};

export default PrimaryLayout;
