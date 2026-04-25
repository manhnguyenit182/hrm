"use client";
import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import Tree from "react-d3-tree";
import { getOrganizationChart } from "./actions";
import { Button } from "primereact/button";
import { Expand, Minimize2 } from "lucide-react";
import OrgChartNode from "./OrgChartNode";
import {
  OrganizationData,
  buildOrganizationChart,
  filterChildrenByExpandState,
  collectAllIds,
} from "./org-chart-utils";

export default function Dashboard() {
  const [data, setData] = useState<OrganizationData | null>(null);
  const [loading, setLoading] = useState(true);
  const treeContainer = useRef<HTMLDivElement>(null);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  // Set default expanded state for CEO when data loads
  useEffect(() => {
    if (data && data.ceo && !expandedNodes.has(data.ceo.id)) {
      setExpandedNodes((prev) => new Set(prev).add(data.ceo!.id));
    }
  }, [data, expandedNodes]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const orgData = await getOrganizationChart();
        setData(orgData);
      } catch (error) {
        console.error("Error fetching organization chart:", error);
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Node expansion handlers
  const toggleNodeExpansion = useCallback((nodeId: string) => {
    setExpandedNodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  }, []);

  const expandAllNodes = useCallback(() => {
    if (!data) return;
    setExpandedNodes(collectAllIds(data));
  }, [data]);

  const collapseAllNodes = useCallback(() => {
    setExpandedNodes(new Set());
  }, []);

  const handleImageError = useCallback((imageUrl: string) => {
    setFailedImages((prev) => new Set(prev).add(imageUrl));
  }, []);

  // Memoized chart data
  const chartData = useMemo(() => {
    if (!data) return null;
    return buildOrganizationChart(data);
  }, [data]);

  const filteredChartData = useMemo(() => {
    if (!chartData) return null;
    return filterChildrenByExpandState(chartData, expandedNodes);
  }, [chartData, expandedNodes]);

  // Custom node renderer using the extracted component
  const renderCustomNode = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ({ nodeDatum }: { nodeDatum: any }) => (
      <OrgChartNode
        nodeDatum={nodeDatum}
        expandedNodes={expandedNodes}
        failedImages={failedImages}
        onToggleExpand={toggleNodeExpansion}
        onImageError={handleImageError}
      />
    ),
    [expandedNodes, failedImages, toggleNodeExpansion, handleImageError]
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Đang tải biểu đồ tổ chức...</div>
      </div>
    );
  }

  if (!filteredChartData || filteredChartData.name === "Không có dữ liệu") {
    return (
      <div className="text-center text-gray-500 mt-20">
        <div className="text-2xl mb-4">📊</div>
        <div>Không có dữ liệu biểu đồ tổ chức</div>
      </div>
    );
  }

  return (
    <div>
      <div className="p-6 flex justify-between">
        <h2 className="text-3xl font-bold mb-6 text-center ">
          Biểu đồ Tổ chức Công ty
        </h2>
        <div className="mb-4 flex justify-center gap-4">
          <Button
            onClick={expandAllNodes}
            className="!bg-[color:#7152f3] px-4 py-2 text-white rounded-lg hover:!bg-[color:#5b3ed9] transition-colors duration-200 flex items-center gap-2"
          >
            <Expand />
          </Button>
          <Button
            onClick={collapseAllNodes}
            className="!bg-[color:#7f63f4] px-4 py-2 text-white rounded-lg hover:!bg-[color:#7152f3] transition-colors duration-200 flex items-center gap-2"
          >
            <Minimize2 />
          </Button>
        </div>
      </div>

      <div
        ref={treeContainer}
        className="w-full h-[calc(100vh-240px)] border border-gray-200 rounded-lg bg-white shadow-lg"
      >
        <Tree
          data={filteredChartData}
          orientation="vertical"
          pathFunc="step"
          translate={{ x: 570, y: 100 }}
          zoom={0.8}
          nodeSize={{ x: 250, y: 150 }}
          separation={{ siblings: 1.2, nonSiblings: 1.5 }}
          renderCustomNodeElement={renderCustomNode}
          enableLegacyTransitions={true}
          transitionDuration={800}
          collapsible={false}
          initialDepth={undefined}
        />
      </div>
    </div>
  );
}
