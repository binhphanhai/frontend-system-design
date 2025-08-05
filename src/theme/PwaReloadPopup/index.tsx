import React, { useState } from "react";
import { translate } from "@docusaurus/Translate";

interface PwaReloadPopupProps {
  onReload: () => void;
}

export default function PwaReloadPopup({
  onReload,
}: PwaReloadPopupProps): JSX.Element {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        backgroundColor: "#25c2a0",
        color: "white",
        padding: "16px",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
        zIndex: 9999,
        maxWidth: "350px",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <div style={{ marginBottom: "12px", fontWeight: "bold" }}>
        {translate({
          id: "theme.PwaReloadPopup.info",
          message: "New version available!",
          description: "The info message to ask the user to reload the page",
        })}
      </div>
      <div style={{ marginBottom: "16px", fontSize: "14px", opacity: 0.9 }}>
        {translate({
          id: "theme.PwaReloadPopup.info.detail",
          message: "A new version of this app is available.",
          description:
            "The detailed info message to ask the user to reload the page",
        })}
      </div>
      <div style={{ display: "flex", gap: "8px" }}>
        <button
          type="button"
          onClick={() => {
            onReload();
            setIsVisible(false);
          }}
          style={{
            backgroundColor: "white",
            color: "#25c2a0",
            border: "none",
            padding: "8px 16px",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "14px",
          }}
        >
          {translate({
            id: "theme.PwaReloadPopup.refreshButtonText",
            message: "Refresh",
            description: "The text for the refresh button of the reload popup",
          })}
        </button>
        <button
          type="button"
          onClick={() => setIsVisible(false)}
          style={{
            backgroundColor: "transparent",
            color: "white",
            border: "1px solid white",
            padding: "8px 16px",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          {translate({
            id: "theme.PwaReloadPopup.closeButtonText",
            message: "Close",
            description: "The text for the close button of the reload popup",
          })}
        </button>
      </div>
    </div>
  );
}
