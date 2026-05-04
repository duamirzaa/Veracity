export interface RiskFeature {
  feature_name: string
  shap_value: number
  feature_value: number
  impact: 'positive' | 'negative'
  abs_shap_value?: number
  mitigation_advice?: string
}

export interface Metrics {
  loc: number
  'v(g)': number
  'ev(g)': number
  'iv(g)': number
  n: number
  v: number
  l: number
  d: number
  i: number
  e: number
  b: number
  t: number
  locode: number
  locomment: number
  loblank: number
  locodeandcomment: number
  uniq_op: number
  uniq_opnd: number
  total_op: number
  total_opnd: number
  branchcount: number
  cbo: number
  rfc: number
  v_density: number
  cyclomatic_loc: number
  halstead_difficulty: number
  [key: string]: number // For dynamic metric access
}

export interface Prediction {
  id: number
  project_id: number
  defect_probability: number
  risk_level: 'low' | 'medium' | 'high' | 'critical'
  top_risk_features: RiskFeature[]
  code_snippet: string
  file_path: string
  metrics: Metrics
  created_at: string
  mitigation_advice?: {
    message?: string
    recommendations?: string[]
    [key: string]: any
  }
}

// CORRECT - title is a string ✅
export interface Report {
  title: string        // ← just this change
  report_type: string
  report_format: 'json' | 'xml' | 'pdf'
  generated_at: string
  created_at?: string
  id?: number
}
