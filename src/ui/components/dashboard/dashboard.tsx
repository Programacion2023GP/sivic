import React, { useState, useMemo, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { 
  FiDownload, FiFilter, FiBarChart2, FiList, FiGrid, FiTable, 
  FiPieChart, FiSettings, FiRefreshCw, FiPlus, FiTrash2, FiSave,
  FiEye, FiEyeOff, FiChevronDown, FiChevronUp, FiInfo
} from 'react-icons/fi';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, ComposedChart
} from 'recharts';

type DataRow = Record<string, any>;
type Aggregation = 'count' | 'sum' | 'average' | 'max' | 'min';
type ChartType = 'bar' | 'line' | 'pie' | 'area';

interface PivotConfig { 
  rows: string[]; 
  columns: string[]; 
  values: string[]; 
  aggregation: Aggregation; 
}

interface ChartConfig { 
  type: ChartType; 
  xAxis: string; 
  yAxis: string; 
  showGrid: boolean;
  stacked: boolean;
}

interface SavedView {
  id: string;
  name: string;
  pivot: PivotConfig;
  chart: ChartConfig;
  timestamp: Date;
}

const COLORS = [
  '#FF4C4C', '#FF9900', '#FFD700', '#00C853', '#00B0FF', '#6200EA',
  '#FF4081', '#F50057', '#2962FF', '#00BFA5', '#FF6D00', '#D50000'
];

// Función de agregación mejorada para contar categorías
const aggregate = (data: DataRow[], field: string, operation: Aggregation) => {
  if (operation === 'count') {
    return data.length;
  }
  
  // Para otras operaciones, intentar convertir a número
  const numbers = data.map(d => Number(d[field])).filter(n => !isNaN(n));
  if (!numbers.length) return 0;
  
  switch (operation) {
    case 'sum': return numbers.reduce((a,b)=>a+b,0);
    case 'average': return numbers.reduce((a,b)=>a+b,0)/numbers.length;
    case 'max': return Math.max(...numbers);
    case 'min': return Math.min(...numbers);
    default: return data.length;
  }
};

interface DashboardProps { 
  data: DataRow[];
  onDataUpdate?: (newData: DataRow[]) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ data, onDataUpdate }) => {
  const [pivot, setPivot] = useState<PivotConfig>({
    rows: [], 
    columns: [], 
    values: [], 
    aggregation: 'count' // Por defecto contar en lugar de sumar
  });
  
  const [chart, setChart] = useState<ChartConfig>({
    type: 'bar', 
    xAxis: '', 
    yAxis: '', 
    showGrid: true,
    stacked: false
  });
  
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'table'|'chart'|'both'>('both');
  const [activePanel, setActivePanel] = useState<'pivot' | 'chart' | 'data'>('pivot');
  const [savedViews, setSavedViews] = useState<SavedView[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfig, setShowConfig] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    pivot: true,
    chart: true,
    data: true
  });

  const fields = useMemo(() => data.length ? Object.keys(data[0]) : [], [data]);
  
  // Detectar campos que podrían ser numéricos
  const numericFields = useMemo(() => {
    if (!data.length) return [];
    
    return fields.filter(field => {
      // Muestrear algunos valores para determinar si es numérico
      const sampleValues = data.slice(0, 20).map(row => row[field]);
      return sampleValues.some(value => {
        const num = Number(value);
        return !isNaN(num) && value !== null && value !== undefined && value !== '';
      });
    });
  }, [fields, data]);

  // Todos los campos pueden usarse para contar
  const allFieldsForCounting = useMemo(() => fields, [fields]);

  const filteredData = useMemo(() => {
    if (!search) return data;
    return data.filter(row => 
      Object.values(row).some(value => 
        String(value).toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [data, search]);

  const pivotData = useMemo(() => {
    if (!pivot.rows.length && !pivot.columns.length) {
      // Si no hay configuración pivot, mostrar datos originales con conteos
      return filteredData;
    }
    
    const result: DataRow[] = [];
    const groups = new Map<string, Map<string, DataRow[]>>();
    
    // Agrupar datos
    filteredData.forEach(row => {
      const rowKey = pivot.rows.map(r => row[r] ?? 'N/A').join('|');
      const colKey = pivot.columns.map(c => row[c] ?? 'N/A').join('|') || 'total';
      
      if (!groups.has(rowKey)) groups.set(rowKey, new Map());
      const colMap = groups.get(rowKey)!;
      
      if (!colMap.has(colKey)) colMap.set(colKey, []);
      colMap.get(colKey)!.push(row);
    });
    
    // Procesar grupos
    groups.forEach((colMap, rowKey) => {
      const newRow: DataRow = {};
      
      // Agregar campos de fila
      pivot.rows.forEach((r, i) => {
        newRow[r] = rowKey.split('|')[i];
      });
      
      // Procesar cada columna en el grupo
      colMap.forEach((rows, colKey) => {
        if (pivot.values.length === 0) {
          // Si no hay valores seleccionados, contar registros
          const countKey = colKey === 'total' ? 'Total Registros' : `${colKey} - Count`;
          newRow[countKey] = rows.length;
        } else {
          // Procesar cada valor seleccionado
          pivot.values.forEach(val => {
            const displayName = pivot.values.length > 1 ? val : 'Valor';
            const key = colKey === 'total' 
              ? `Total ${displayName}` 
              : `${colKey} - ${displayName}`;
            
            newRow[key] = aggregate(rows, val, pivot.aggregation);
          });
        }
      });
      
      result.push(newRow);
    });
    
    return result;
  }, [filteredData, pivot]);

 const chartData = useMemo(() => {
  if (!chart.xAxis) return [];

  // Agrupar y agregar
  const grouped: Record<string, Record<string, number>> = {};

  // Elegimos la fuente de datos:
  const sourceData = chart.yAxis ? pivotData : filteredData;

  sourceData.forEach(row => {
    const xValue = String(row[chart.xAxis] ?? 'N/A');

    if (!grouped[xValue]) grouped[xValue] = {};

    if (chart.yAxis) {
      // Si hay Y, usamos ese valor directamente
      grouped[xValue][chart.yAxis] = Number(row[chart.yAxis] ?? 0);
    } else {
      // Si no hay Y, contamos ocurrencias
      grouped[xValue]['value'] = (grouped[xValue]['value'] || 0) + 1;
    }
  });

  // Convertir a array para recharts
  return Object.entries(grouped).map(([name, values], index) => ({
    name,
    ...values,
    color: COLORS[index % COLORS.length]
  }));

}, [filteredData, pivotData, chart]);


  const exportExcel = useCallback(() => {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(pivotData), 'Dashboard Data');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data), 'Raw Data');
    XLSX.writeFile(wb, `dashboard-${new Date().toISOString().split('T')[0]}.xlsx`);
  }, [pivotData, data]);

  const saveCurrentView = useCallback(() => {
    const name = prompt('Nombre para esta vista guardada:');
    if (!name) return;
    
    const newView: SavedView = {
      id: Date.now().toString(),
      name,
      pivot: { ...pivot },
      chart: { ...chart },
      timestamp: new Date()
    };
    
    setSavedViews(prev => [...prev, newView]);
  }, [pivot, chart]);

  const loadSavedView = useCallback((view: SavedView) => {
    setPivot(view.pivot);
    setChart(view.chart);
  }, []);

  const deleteSavedView = useCallback((id: string) => {
    setSavedViews(prev => prev.filter(view => view.id !== id));
  }, []);

  const toggleSection = useCallback((section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  }, []);

  const clearAllFilters = useCallback(() => {
    setPivot({ rows: [], columns: [], values: [], aggregation: 'count' });
    setChart({ type: 'bar', xAxis: '', yAxis: '', showGrid: true, stacked: false });
    setSearch('');
  }, []);

  const renderChart = () => {
    if (!chartData.length || !chart.xAxis) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
          <FiBarChart2 className="text-4xl mb-4 text-gray-300" />
          <p className="text-center mb-2">Selecciona al menos el eje X para visualizar</p>
          <p className="text-sm text-gray-400">El sistema contará automáticamente las ocurrencias</p>
        </div>
      );
    }

    const commonProps = {
      data: chartData,
      margin: { top: 20, right: 30, left: 20, bottom: 20 }
    };

    const yAxisKey = chart.yAxis || 'value';

    return (
      <ResponsiveContainer width="100%" height="100%">
        {chart.type === 'bar' && (
          <BarChart {...commonProps}>
            {chart.showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                borderRadius: '8px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                border: 'none'
              }} 
            />
            <Legend />
            <Bar 
              dataKey={yAxisKey} 
              fill="#0BC5EA" 
              radius={[4, 4, 0, 0]}
              name={chart.yAxis || 'Conteo'}
            />
          </BarChart>
        )}
        
        {chart.type === 'line' && (
          <LineChart {...commonProps}>
            {chart.showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                borderRadius: '8px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                border: 'none'
              }} 
            />
            <Legend />
            <Line 
              dataKey={yAxisKey} 
              stroke="#0BC5EA" 
              strokeWidth={3}
              dot={{ fill: '#0BC5EA', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: '#0BC5EA' }}
              name={chart.yAxis || 'Conteo'}
            />
          </LineChart>
        )}
        
        {chart.type === 'pie' && (
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={true}
              label={({ name, percent }) => `${name}: ${(percent as number * 100).toFixed(1)}%`}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => [value.toLocaleString(), chart.yAxis || 'Conteo']}
              contentStyle={{ 
                backgroundColor: 'white', 
                borderRadius: '8px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                border: 'none'
              }} 
            />
            <Legend />
          </PieChart>
        )}
        
        {chart.type === 'area' && (
          <AreaChart {...commonProps}>
            {chart.showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                borderRadius: '8px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                border: 'none'
              }} 
            />
            <Legend />
            <Area 
              type="monotone" 
              dataKey={yAxisKey} 
              stroke="#0BC5EA" 
              fill="url(#colorGradient)" 
              fillOpacity={0.6}
              strokeWidth={2}
              name={chart.yAxis || 'Conteo'}
            />
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0BC5EA" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#0BC5EA" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
          </AreaChart>
        )}
      </ResponsiveContainer>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-4 md:p-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-xl p-2 mb-2 border border-blue-100/50">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <div className="relative flex-1 lg:flex-none lg:w-80">
              <input 
                type="text" 
                placeholder="Buscar en los datos..." 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
                className="w-full px-4 py-3 pl-11 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400 transition-all bg-white/80"
              />
              <FiFilter className="absolute left-4 top-3.5 text-gray-400" />
              <div className="absolute right-3 top-3">
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                  {filteredData.length} registros
                </span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={clearAllFilters}
                className="flex items-center gap-2 px-4 py-3 text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
              >
                <FiRefreshCw className="text-lg" />
                Limpiar
              </button>
              <button 
                onClick={exportExcel} 
                className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-xl hover:from-emerald-600 hover:to-cyan-600 transition-all shadow-lg hover:shadow-xl"
              >
                <FiDownload className="text-lg" /> 
                Exportar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col xl:flex-row gap-6">
        {/* Sidebar - Configuration */}
        {showConfig && (
          <div className="xl:w-80 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-6 border border-blue-100/50">
              {/* Tabs */}
              <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-xl">
                {(['pivot', 'chart'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActivePanel(tab)}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                      activePanel === tab 
                        ? 'bg-white text-cyan-700 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    {tab === 'pivot' && 'Pivot'}
                    {tab === 'chart' && 'Gráfico'}
                  </button>
                ))}
              </div>

              {/* Pivot Configuration */}
              {activePanel === 'pivot' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-800">Configuración Pivot</h3>
                    <button 
                      onClick={() => toggleSection('pivot')}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {expandedSections.pivot ? <FiChevronUp /> : <FiChevronDown />}
                    </button>
                  </div>
                  
                  {expandedSections.pivot && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Agrupar por (Filas)
                        </label>
                        <select 
                          multiple 
                          value={pivot.rows} 
                          onChange={e => setPivot({...pivot, rows: Array.from(e.target.selectedOptions, o => o.value)})} 
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400 h-32 bg-white/80"
                        >
                          {fields.map(f => <option key={f} value={f}>{f}</option>)}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">Ctrl+Click para múltiples selecciones</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Campos para Contar/Calcular (Opcional)
                        </label>
                        <select 
                          multiple 
                          value={pivot.values} 
                          onChange={e => setPivot({...pivot, values: Array.from(e.target.selectedOptions, o => o.value)})} 
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400 h-24 bg-white/80"
                        >
                          <option value="">-- Solo contar registros --</option>
                          {numericFields.map(f => <option key={f} value={f}>{f} (numérico)</option>)}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">Dejar vacío para contar registros</p>
                      </div>
                      
                      {/* <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Operación</label>
                        <select 
                          value={pivot.aggregation} 
                          onChange={e => setPivot({...pivot, aggregation: e.target.value as Aggregation})} 
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400 bg-white/80"
                        >
                          <option value="count">Contar registros</option>
                          <option value="sum">Suma</option>
                          <option value="average">Promedio</option>
                          <option value="max">Máximo</option>
                          <option value="min">Mínimo</option>
                        </select>
                      </div> */}

                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-start gap-2">
                          <FiInfo className="text-blue-500 mt-0.5 flex-shrink-0" />
                          <div className="text-xs text-blue-700">
                            <strong>Ejemplo:</strong> Selecciona "Localidad" para agrupar y deja valores vacío para contar trámites por localidad.
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Chart Configuration */}
              {activePanel === 'chart' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-800">Configuración Gráfico</h3>
                    <button 
                      onClick={() => toggleSection('chart')}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {expandedSections.chart ? <FiChevronUp /> : <FiChevronDown />}
                    </button>
                  </div>
                  
                  {expandedSections.chart && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Gráfico</label>
                        <select 
                          value={chart.type} 
                          onChange={e => setChart({...chart, type: e.target.value as ChartType})} 
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400 bg-white/80"
                        >
                          <option value="bar">Barras</option>
                          <option value="line">Líneas</option>
                          <option value="area">Área</option>
                          <option value="pie">Torta</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Eje X (Categorías) *
                        </label>
                        <select 
                          value={chart.xAxis} 
                          onChange={e => setChart({...chart, xAxis: e.target.value})} 
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400 bg-white/80"
                        >
                          <option value="">Seleccionar campo...</option>
                          {fields.map(f => <option key={f} value={f}>{f}</option>)}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">* Requerido</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Eje Y (Valores - Opcional)
                        </label>
                        <select 
                          value={chart.yAxis} 
                          onChange={e => setChart({...chart, yAxis: e.target.value})} 
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400 bg-white/80"
                        >
                          <option value="">-- Contar automáticamente --</option>
                          {numericFields.map(f => <option key={f} value={f}>{f}</option>)}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">Dejar vacío para contar ocurrencias del eje X</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 min-w-0">
          {/* Controls Bar */}
          <div className="bg-white rounded-2xl shadow-xl p-4 mb-6 border border-blue-100/50">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
              <div className="flex gap-2">
                <button 
                  onClick={() => setShowConfig(!showConfig)}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
                >
                  <FiSettings />
                  {showConfig ? 'Ocultar Panel' : 'Mostrar Panel'}
                </button>
                
                <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
                  <button 
                    onClick={() => setView('table')} 
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      view === 'table' ? 'bg-white shadow-sm text-cyan-700' : 'text-gray-600'
                    }`}
                  >
                    <FiTable />
                    Tabla
                  </button>
                  <button 
                    onClick={() => setView('both')} 
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      view === 'both' ? 'bg-white shadow-sm text-cyan-700' : 'text-gray-600'
                    }`}
                  >
                    <FiGrid />
                    Ambos
                  </button>
                  <button 
                    onClick={() => setView('chart')} 
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      view === 'chart' ? 'bg-white shadow-sm text-cyan-700' : 'text-gray-600'
                    }`}
                  >
                    <FiPieChart />
                    Gráfico
                  </button>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>📊 {pivotData.length} filas procesadas</span>
                <span>•</span>
                <span>⚙️ {pivot.rows.length + pivot.values.length} campos activos</span>
              </div>
            </div>
          </div>

          {/* Visualization Area */}
          <div className="grid gap-6">
            {/* Chart */}
            {(view === 'chart' || view === 'both') && (
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-blue-100/50">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800">
                    Visualización {chart.type && `- ${chart.type.charAt(0).toUpperCase() + chart.type.slice(1)}`}
                  </h2>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    {chart.xAxis && <span>X: {chart.xAxis}</span>}
                    {chart.yAxis ? <span>Y: {chart.yAxis}</span> : <span>Y: Conteo automático</span>}
                  </div>
                </div>
                <div className="h-96">
                  {renderChart()}
                </div>
              </div>
            )}

            {/* Table */}
            {(view === 'table' || view === 'both') && (
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-blue-100/50">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">
                      {pivot.rows.length > 0 ? 'Datos Agrupados' : 'Datos Originales'}
                    </h2>
                    <span className="text-sm text-gray-500">
                      Mostrando {Math.min(pivotData.length, 100)} de {pivotData.length} filas
                    </span>
                  </div>
                </div>
                <div className="overflow-auto max-h-96">
                  <table className="w-full">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        {pivotData.length > 0 && Object.keys(pivotData[0]).map(f => (
                          <th 
                            key={f} 
                            className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200 bg-gray-50/95 backdrop-blur-sm"
                          >
                            {f}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {pivotData.slice(0, 100).map((row, i) => (
                        <tr 
                          key={i} 
                          className="hover:bg-cyan-50/30 transition-colors group"
                        >
                          {Object.keys(row).map(f => (
                            <td 
                              key={f} 
                              className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap group-hover:bg-cyan-50/50 transition-colors"
                            >
                              {typeof row[f] === 'number' ? row[f].toLocaleString() : row[f]}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {pivotData.length > 100 && (
                  <div className="p-4 bg-amber-50 border-t border-amber-200">
                    <p className="text-sm text-amber-800 text-center">
                      Mostrando las primeras 100 filas. Use la exportación para ver todos los datos.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;