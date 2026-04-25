"use client";
import React from "react";
import { Avatar } from "primereact/avatar";

interface NodeDatum {
  name: string;
  attributes?: {
    title?: string;
    image?: string;
    department?: string;
    id?: string;
    hasChildren?: boolean;
    childrenCount?: number;
  };
  children?: NodeDatum[];
}

interface OrgChartNodeProps {
  nodeDatum: NodeDatum;
  expandedNodes: Set<string>;
  failedImages: Set<string>;
  onToggleExpand: (nodeId: string) => void;
  onImageError: (imageUrl: string) => void;
}

/**
 * Renders a single node in the organization chart tree.
 * Displays employee avatar, name, title, and expand/collapse controls.
 */
export default function OrgChartNode({
  nodeDatum,
  expandedNodes,
  failedImages,
  onToggleExpand,
  onImageError,
}: OrgChartNodeProps) {
  const nodeId = nodeDatum.attributes?.id || "";
  const isExpanded = expandedNodes.has(nodeId);
  const hasChildren = nodeDatum.attributes?.hasChildren || false;
  const childrenCount = nodeDatum.attributes?.childrenCount || 0;

  return (
    <g>
      {/* Background card */}
      <rect
        width="200"
        height="120"
        x="-100"
        y="-60"
        rx="10"
        fill="white"
        stroke="#e2e8f0"
        strokeWidth="2"
        filter="url(#drop-shadow)"
        style={{ cursor: hasChildren ? "pointer" : "default" }}
        onClick={() => hasChildren && onToggleExpand(nodeId)}
      />

      {/* Expand/Collapse indicator */}
      {hasChildren && (
        <g>
          <circle
            cx="85"
            cy="-45"
            r="12"
            fill={isExpanded ? "#ef4444" : "#10b981"}
            stroke="white"
            strokeWidth="2"
            style={{ cursor: "pointer" }}
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand(nodeId);
            }}
          />
          <text
            x="85"
            y="-40"
            textAnchor="middle"
            fontSize="14"
            fill="white"
            fontWeight="bold"
            style={{ cursor: "pointer", userSelect: "none" }}
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand(nodeId);
            }}
          >
            {isExpanded ? "−" : "+"}
          </text>
          {/* Children count indicator */}
          <text
            x="85"
            y="-25"
            textAnchor="middle"
            fontSize="10"
            fill="#6b7280"
            fontWeight="500"
          >
            {childrenCount}
          </text>
        </g>
      )}

      {/* Profile image */}
      <foreignObject x="-30" y="-45" width="60" height="60">
        <div className="w-full h-full rounded-full overflow-hidden border-2 border-blue-200 bg-gray-100 flex items-center justify-center">
          <Avatar
            image={nodeDatum.attributes?.image || undefined}
            shape="circle"
            size="large"
            onImageError={() => {
              if (nodeDatum.attributes?.image) {
                onImageError(nodeDatum.attributes.image);
              }
            }}
          >
            {!nodeDatum.attributes?.image ||
            failedImages.has(nodeDatum.attributes.image!) ? (
              <span className="text-white font-bold text-lg">
                {(() => {
                  const nameParts = nodeDatum.name
                    .trim()
                    .split(" ")
                    .filter((part) => part.length > 0);
                  if (nameParts.length === 0) return "N/A";
                  if (nameParts.length === 1)
                    return nameParts[0][0].toUpperCase();
                  const firstInitial = nameParts[0][0].toUpperCase();
                  const lastInitial =
                    nameParts[nameParts.length - 1][0].toUpperCase();
                  return firstInitial + lastInitial;
                })()}
              </span>
            ) : null}
          </Avatar>
        </div>
      </foreignObject>

      {/* Name */}
      <text
        x="0"
        y="25"
        textAnchor="middle"
        fontSize="14"
        fontWeight="200"
        fill="#1f2937"
      >
        {nodeDatum.name.length > 20
          ? `${nodeDatum.name.substring(0, 20)}...`
          : nodeDatum.name}
      </text>

      {/* Title */}
      <text x="0" y="45" textAnchor="middle" fontSize="12" fill="#6b7280">
        {nodeDatum.attributes?.title && nodeDatum.attributes.title.length > 25
          ? `${nodeDatum.attributes.title.substring(0, 25)}...`
          : nodeDatum.attributes?.title}
      </text>
    </g>
  );
}
