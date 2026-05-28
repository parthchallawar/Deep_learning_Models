import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter,
  ZAxis
} from 'recharts';
import { ARCH_COLORS } from '../utils/colors';

const ComparisonCharts = ({ selectedModels = [] }) => {
  if (selectedModels.length === 0) {
    return (
      <div className="h-60 border border-dashed border-border-card rounded-2xl flex flex-col items-center justify-center text-text-muted font-mono text-xs">
        <span>No Models Selected for Comparison</span>
        <span>Select checkboxes in sidebar and click Compare</span>
      </div>
    );
  }

  // 1. Grouped Bar Chart Data
  const barData = selectedModels.map(m => ({
    name: m.exp_id,
    Accuracy: parseFloat((m.accuracy * 100).toFixed(1)),
    F1: parseFloat((m.f1 * 100).toFixed(1)),
    'AUC-ROC': parseFloat((m.auc_roc * 100).toFixed(1)),
  }));

  // 2. Radar Chart Data (Max 4 models for clean overlapping fills)
  const radarModels = selectedModels.slice(0, 4);
  const radarMetrics = [
    { label: 'Accuracy', key: 'accuracy' },
    { label: 'Precision', key: 'precision' },
    { label: 'Recall', key: 'recall' },
    { label: 'F1 Score', key: 'f1' },
    { label: 'AUC-ROC', key: 'auc_roc' },
    { label: 'Specificity', key: 'specificity' },
  ];

  const radarData = radarMetrics.map(metric => {
    const dataRow = { subject: metric.label };
    radarModels.forEach(m => {
      dataRow[m.exp_id] = parseFloat((m[metric.key] * 100).toFixed(1));
    });
    return dataRow;
  });

  // 3. Scatter Plot Data
  const scatterData = selectedModels.map(m => ({
    x: m.model_size_mb,
    y: parseFloat((m.accuracy * 100).toFixed(1)),
    z: m.params,
    name: m.exp_id,
    arch: m.arch,
  }));

  // 4. Box Plot Mock/Distribution Chart
  // We calculate standard stats for each architecture type selected or global
  const archs = ['DNN', 'CNN', 'TL'];
  const distributionData = archs.map(a => {
    const accs = selectedModels.filter(m => m.arch === a).map(m => m.accuracy * 100);
    if (accs.length === 0) return null;
    const min = Math.min(...accs);
    const max = Math.max(...accs);
    const mean = accs.reduce((s, x) => s + x, 0) / accs.length;
    return {
      arch: a,
      Min: parseFloat(min.toFixed(1)),
      Mean: parseFloat(mean.toFixed(1)),
      Max: parseFloat(max.toFixed(1)),
    };
  }).filter(Boolean);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full">
      {/* Chart 1: Grouped Bar Chart */}
      <div className="bg-bg-card border border-border-card rounded-2xl p-5 flex flex-col gap-3">
        <div>
          <h4 className="font-black text-sm text-text-primary">Key Metrics Overview</h4>
          <p className="text-[10px] text-text-muted font-mono uppercase tracking-wider">Grouped Model Comparison (%)</p>
        </div>
        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ left: -15, right: 0, top: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={10} fontFamily="monospace" tickLine={false} />
              <YAxis stroke="#64748b" fontSize={10} fontFamily="monospace" tickLine={false} domain={[0, 100]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#111827', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '11px', color: '#f1f5f9' }}
              />
              <Legend verticalAlign="top" height={36} iconSize={8} iconType="circle" />
              <Bar dataKey="Accuracy" fill="#7c3aed" radius={[4, 4, 0, 0]} />
              <Bar dataKey="F1" fill="#ec4899" radius={[4, 4, 0, 0]} />
              <Bar dataKey="AUC-ROC" fill="#06b6d4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Radar Spider Chart */}
      <div className="bg-bg-card border border-border-card rounded-2xl p-5 flex flex-col gap-3">
        <div>
          <h4 className="font-black text-sm text-text-primary">6-Axis Metric Radar</h4>
          <p className="text-[10px] text-text-muted font-mono uppercase tracking-wider">
            Translucent Overlay Profile (Max 4 Models)
          </p>
        </div>
        <div className="w-full h-72 flex justify-center items-center">
          {radarModels.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} margin={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <PolarGrid stroke="#1e293b" />
                <PolarAngleAxis dataKey="subject" stroke="#64748b" fontSize={10} fontFamily="monospace" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#64748b" fontSize={8} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '11px', color: '#f1f5f9' }}
                />
                <Legend verticalAlign="top" height={36} iconSize={8} iconType="circle" />
                {radarModels.map((m, idx) => {
                  const colors = ['#7c3aed', '#06b6d4', '#ec4899', '#10b981'];
                  return (
                    <Radar
                      key={m.exp_id}
                      name={m.exp_id}
                      dataKey={m.exp_id}
                      stroke={colors[idx % colors.length]}
                      fill={colors[idx % colors.length]}
                      fillOpacity={0.2}
                    />
                  );
                })}
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <span className="text-xs text-text-muted font-mono">No data</span>
          )}
        </div>
      </div>

      {/* Chart 3: Scatter Plot (Accuracy vs Model Size) */}
      <div className="bg-bg-card border border-border-card rounded-2xl p-5 flex flex-col gap-3">
        <div>
          <h4 className="font-black text-sm text-text-primary">Accuracy vs. Model Footprint</h4>
          <p className="text-[10px] text-text-muted font-mono uppercase tracking-wider">
            Bubble size = parameter count | Color = arch
          </p>
        </div>
        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: -20 }}>
              <CartesianGrid stroke="#1e293b" />
              <XAxis
                type="number"
                dataKey="x"
                name="Model Size"
                unit=" MB"
                stroke="#64748b"
                fontSize={10}
                fontFamily="monospace"
                tickLine={false}
              />
              <YAxis
                type="number"
                dataKey="y"
                name="Accuracy"
                unit="%"
                stroke="#64748b"
                fontSize={10}
                fontFamily="monospace"
                tickLine={false}
                domain={[0, 100]}
              />
              <ZAxis type="number" dataKey="z" range={[80, 800]} name="Parameters" />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-bg-primary border border-border-card rounded-xl p-3 text-[11px] font-mono shadow-2xl">
                        <p className="font-bold text-accent-cyan mb-1">{data.name}</p>
                        <p className="text-text-muted">Size: <span className="text-text-primary font-bold">{data.x} MB</span></p>
                        <p className="text-text-muted">Accuracy: <span className="text-accent-pink font-bold">{data.y}%</span></p>
                        <p className="text-text-muted">Params: <span className="text-accent-purple font-bold">{(data.z / 1000000).toFixed(2)}M</span></p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend verticalAlign="top" height={36} iconSize={8} iconType="circle" />
              <Scatter name="DNN" data={scatterData.filter(d => d.arch === 'DNN')} fill={ARCH_COLORS.DNN} />
              <Scatter name="CNN" data={scatterData.filter(d => d.arch === 'CNN')} fill={ARCH_COLORS.CNN} />
              <Scatter name="Transfer Learning" data={scatterData.filter(d => d.arch === 'TL')} fill={ARCH_COLORS.TL} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 4: Box Plot / Distribution Distribution stats */}
      <div className="bg-bg-card border border-border-card rounded-2xl p-5 flex flex-col gap-3">
        <div>
          <h4 className="font-black text-sm text-text-primary">Accuracy Distribution Range</h4>
          <p className="text-[10px] text-text-muted font-mono uppercase tracking-wider">
            Min, Mean, & Max Range per Architecture Type (%)
          </p>
        </div>
        <div className="w-full h-72">
          {distributionData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distributionData} margin={{ left: -15, right: 0, top: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="arch" stroke="#64748b" fontSize={10} fontFamily="monospace" tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} fontFamily="monospace" tickLine={false} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '11px', color: '#f1f5f9' }}
                />
                <Legend verticalAlign="top" height={36} iconSize={8} iconType="circle" />
                <Bar dataKey="Min" fill="#ec4899" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Mean" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Max" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-text-muted text-xs font-mono">
              Insufficient diverse architectures selected.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComparisonCharts;
