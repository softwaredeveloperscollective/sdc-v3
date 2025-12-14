import React from "react";
import type { CSSProperties } from "react";
import { CircleLoader } from "react-spinners";

const override: CSSProperties = {
  display: "block",
  margin: "auto",
  borderColor: "red",
};

export default function StyledCircleLoader({
  isLoading,
}: {
  isLoading: boolean;
}) {
  return (
    <div className="loader-overlay">
      <CircleLoader
        color={"#6B7280"}
        loading={isLoading}
        cssOverride={override}
        size={80}
        aria-label="Loading Spinner"
        data-testid="loader"
      />
    </div>
  );
}
