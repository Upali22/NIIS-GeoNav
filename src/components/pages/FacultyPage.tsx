import React, { useState } from 'react';
import { FacultyMember, BuildingData } from '../../types';
import { GraduationCap, Mail, MapPin, Award, Building, Sparkles } from 'lucide-react';

interface FacultyPageProps {
  faculty: FacultyMember[];
  buildings: BuildingData[];
  onNavigateToOffice?: (officeLocation: string) => void;
}

export const FacultyPage: React.FC<FacultyPageProps> = ({
  faculty,
  buildings,
  onNavigateToOffice
}) => {
  const [selectedDept, setSelectedDept] = useState<string>('all');

  const departments = ['all', ...Array.from(new Set(faculty.map(f => f.department)))];

  const filtered = selectedDept === 'all' 
    ? faculty 
    : faculty.filter(f => f.department === selectedDept);

  const leadership = filtered.filter(f => f.category === 'leadership');
  const teachers = filtered.filter(f => f.category !== 'leadership');

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF3FA4]/10 border border-[#FF3FA4]/30 text-[#FF72BD] text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Academic Leadership & Mentors</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight font-display">
          Faculty & Guiding Pillars
        </h1>
        <p className="text-sm text-white/60 mt-2">
          Distinguished academic leaders, researchers, and educators guiding the NIIS community at Bhubaneswar.
        </p>
      </div>

      {/* Department Filter Tabs */}
      <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-3 mb-8 scrollbar-none px-1">
        {departments.map(dept => (
          <button
            key={dept}
            onClick={() => setSelectedDept(dept)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedDept === dept
                ? 'bg-[#FF3FA4] text-white shadow-lg shadow-[#FF3FA4]/30'
                : 'glass-panel text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            {dept === 'all' ? 'All Pillars & Faculty' : dept}
          </button>
        ))}
      </div>

      {/* Leadership Section */}
      {leadership.length > 0 && (
        <div className="mb-12">
          <h2 className="text-xl font-black text-white tracking-tight font-display mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-[#E9B95F]" />
            <span>Guiding Pillars & Executive Leadership</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {leadership.map(member => (
              <div 
                key={member.id}
                className="glass-panel rounded-3xl p-6 border border-white/15 shadow-2xl flex flex-col sm:flex-row gap-5 items-start"
              >
                <img
                  src={member.photo}
                  alt={member.name}
                  referrerPolicy="no-referrer"
                  className="w-28 h-32 sm:w-32 sm:h-36 rounded-2xl object-cover shrink-0 border border-white/20 shadow-xl"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80';
                  }}
                />

                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-[#E9B95F] uppercase font-mono tracking-wider">
                    {member.designation}
                  </div>
                  <h3 className="text-lg font-black text-white mt-1 font-display">
                    {member.name}
                  </h3>
                  <p className="text-[11px] text-[#00f0ff] font-medium mt-0.5">
                    {member.department}
                  </p>
                  <p className="text-xs text-white/70 leading-relaxed mt-2 line-clamp-3">
                    {member.bio}
                  </p>

                  <div className="mt-3 pt-3 border-t border-white/10 space-y-1 text-[11px] text-white/50">
                    <div className="flex items-center gap-1.5 truncate">
                      <GraduationCap className="w-3.5 h-3.5 text-[#E9B95F]" />
                      <span className="truncate">{member.qualification}</span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-[#FF3FA4]" />
                      <span>{member.office}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Teachers / Faculty Section */}
      <div>
        <h2 className="text-xl font-black text-white tracking-tight font-display mb-4 flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-[#FF3FA4]" />
          <span>Department Faculty Members</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {teachers.map(member => (
            <div 
              key={member.id}
              className="glass-panel rounded-3xl p-5 border border-white/10 hover:border-white/25 shadow-xl transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start gap-4 mb-3">
                  <img
                    src={member.photo}
                    alt={member.name}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 rounded-2xl object-cover shrink-0 border border-white/20"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80';
                    }}
                  />
                  <div className="min-w-0">
                    <h3 className="text-sm font-black text-white font-display truncate">{member.name}</h3>
                    <div className="text-[11px] text-[#E9B95F] truncate">{member.designation}</div>
                    <div className="text-[10px] text-white/50 truncate">{member.department}</div>
                  </div>
                </div>

                <p className="text-xs text-white/70 line-clamp-2 leading-relaxed mb-3">
                  {member.bio}
                </p>
              </div>

              <div className="pt-3 border-t border-white/10 space-y-1 text-[10px] text-white/50 font-mono">
                <div className="flex items-center gap-1.5 truncate">
                  <MapPin className="w-3.5 h-3.5 text-[#FF3FA4]" />
                  <span className="truncate">{member.office}</span>
                </div>
                {member.email && (
                  <div className="flex items-center gap-1.5 truncate">
                    <Mail className="w-3.5 h-3.5 text-[#00f0ff]" />
                    <span className="truncate">{member.email}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
