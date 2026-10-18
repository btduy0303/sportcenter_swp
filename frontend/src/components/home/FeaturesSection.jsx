import React, { useState } from 'react';
import { featuresData } from '../../data/sportCenterData';

export default function FeaturesSection({ onSelectFeature }) {
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'Tất cả chức năng' },
    { id: 'members', label: 'Hội viên & Điểm danh' },
    { id: 'schedule', label: 'Lớp học & Ca tập' },
    { id: 'finance', label: 'Thu phí & Hóa đơn' },
  ];

  const filteredFeatures = activeCategory === 'all' 
    ? featuresData 
    : featuresData.filter((f) => f.category === activeCategory);

  return (
    <section id="features" className="py-16 bg-[#080d1a] relative border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Các phân hệ nghiệp vụ chính trong hệ thống
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Được thiết kế đáp ứng đầy đủ yêu cầu quản lý vận hành của một trung tâm thể thao thực tế
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredFeatures.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="bg-[#0f172a] rounded-2xl border border-slate-800 p-5 flex flex-col justify-between hover:border-slate-700 transition"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white mb-2">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-3 mt-4 border-t border-slate-800 flex flex-wrap gap-1.5">
                  {item.tags.map((tag, tIdx) => (
                    <span
                      key={tIdx}
                      className="text-[10px] px-2 py-0.5 rounded bg-slate-800/80 text-slate-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
