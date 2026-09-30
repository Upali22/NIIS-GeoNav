import React, { useMemo } from 'react';
import { 
  MapPin, 
  DoorOpen, 
  Coffee, 
  Car, 
  Sparkles, 
  Accessibility, 
  Clock, 
  Navigation,
  Building2,
  ChevronRight
} from 'lucide-react';
import { BuildingData, NavNode, NavEdge } from '../../types';
import { findNearestFacilitiesByGraph } from '../../services/navigationEngine';

interface NearMeWidgetProps {
  currentFromBuildingId: string;
  buildings: BuildingData[];
  nodes: NavNode[];
  edges: NavEdge[];
  onNavigateToBuilding: (buildingId: string) => void;
}

export const NearMeWidget: React.FC<NearMeWidgetProps> = ({
  currentFromBuildingId,
  buildings,
  nodes,
  edges,
  onNavigateToBuilding
}) => {
  // Compute graph-based nearest categories
  const nearestItems = useMemo(() => {
    const fromNode = nodes.find(n => n.buildingId === currentFromBuildingId) || nodes[0];
    if (!fromNode) return [];

    // Helper to find nearest matching building using graph distance
    const getNearestByPredicate = (label: string, icon: any, predicate: (b: BuildingData) => boolean) => {
      const candidates = buildings.filter(b => b.id !== currentFromBuildingId && predicate(b));
      if (candidates.length === 0) return null;

      const graphResults = findNearestFacilitiesByGraph(
        fromNode.id,
        candidates.map(c => c.id),
        nodes,
        edges
      );

      if (graphResults.length === 0) return null;
      const top = graphResults[0];
      const bld = buildings.find(b => b.id === top.buildingId);
      if (!bld) return null;

      return {
        label,
        icon,
        building: bld,
        distanceMeters: top.distance,
        estimatedMinutes: top.estimatedMinutes
      };
    };

    const items = [
      getNearestByPredicate('Nearest Washroom', DoorOpen, b => b.id === 'common-washroom' || b.facilities.some(f => f.toLowerCase().includes('washroom') || f.toLowerCase().includes('restroom'))),
      getNearestByPredicate('Nearest Canteen', Coffee, b => b.category === 'dining'),
      getNearestByPredicate('Nearest Parking', Car, b => b.category === 'parking'),
      getNearestByPredicate('Nearest Academic Block', Building2, b => b.category === 'academic'),
      getNearestByPredicate('Nearest Accessible Facility', Accessibility, b => b.accessibility),
      getNearestByPredicate('Nearest Open Facility', Clock, b => b.status === 'active')
    ].filter(Boolean) as {
      label: string;
      icon: any;
      building: BuildingData;
      distanceMeters: number;
      estimatedMinutes: number;
    }[];

    return items;
  }, [currentFromBuildingId, buildings, nodes, edges]);

  if (nearestItems.length === 0) return null;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono uppercase tracking-wider text-[#00f0ff] font-bold flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          <span>NEAR ME (GRAPH DISTANCE)</span>
        </span>
        <span className="text-[9px] text-white/40">From active origin</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
        {nearestItems.slice(0, 4).map(item => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              onClick={() => onNavigateToBuilding(item.building.id)}
              className="p-2 rounded-xl glass-panel-subtle hover:bg-white/10 border border-white/5 hover:border-[#00f0ff]/40 flex items-center justify-between text-left cursor-pointer transition-all group"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="p-1 rounded-lg bg-[#00f0ff]/15 text-[#00f0ff] shrink-0 group-hover:scale-105 transition-transform">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-medium text-white/60 truncate leading-none mb-0.5">
                    {item.label}
                  </div>
                  <div className="text-xs font-bold text-white truncate leading-none">
                    {item.building.name}
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0 pl-2">
                <span className="text-[11px] font-mono font-bold text-[#E9B95F] block leading-none">
                  {item.distanceMeters} m
                </span>
                <span className="text-[9px] text-white/40 font-mono">
                  {item.estimatedMinutes} min
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
