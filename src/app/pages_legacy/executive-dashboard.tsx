import { TrendingUp, DollarSign, Shield, Target, ArrowUpRight, CheckCircle2, AlertTriangle, TrendingDown } from "lucide-react";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";

// Risk tier distribution
const riskTierData = [
  { name: "Tier 1: Critical", value: 5, color: "#d4183d" },
  { name: "Tier 2: High", value: 18, color: "#F2994A" },
  { name: "Tier 3: Medium", value: 35, color: "#8A70D6" },
  { name: "Tier 4: Low", value: 42, color: "#27AE60" },
];

// Financial trend data
const financialTrendData = [
  { month: "Oct", baseline: 1200, predicted: 1180, savings: 20 },
  { month: "Nov", baseline: 1350, predicted: 1300, savings: 50 },
  { month: "Dec", baseline: 1500, predicted: 1400, savings: 100 },
  { month: "Jan", baseline: 1600, predicted: 1450, savings: 150 },
  { month: "Feb", baseline: 1800, predicted: 1600, savings: 200 },
  { month: "Mar", baseline: 2000, predicted: 1750, savings: 250 },
  { month: "Apr", baseline: 2100, predicted: 1800, savings: 300 },
];

// Strategic recommendations
const strategicActions = [
  {
    id: 1,
    title: "Premium Adjustment - Cluster X",
    description: "Increase premium by 15% for high-risk cardiac surgery cluster to balance claim costs",
    impact: "High",
    savings: "$2.4M annually",
    confidence: 94,
    category: "Pricing Strategy"
  },
  {
    id: 2,
    title: "Hospital Network Optimization",
    description: "Renegotiate rates with 3 hospitals showing consistent over-treatment patterns",
    impact: "Medium",
    savings: "$1.8M annually",
    confidence: 87,
    category: "Provider Management"
  },
  {
    id: 3,
    title: "Pre-authorization Enhancement",
    description: "Implement stricter pre-auth for procedures exceeding $5,000 threshold",
    impact: "High",
    savings: "$3.1M annually",
    confidence: 91,
    category: "Risk Mitigation"
  },
  {
    id: 4,
    title: "Fraud Investigation Priority",
    description: "Initiate investigation on 4 high-anomaly claims flagged by AI system",
    impact: "Critical",
    savings: "$450K immediate",
    confidence: 98,
    category: "Fraud Prevention"
  },
];

export default function ExecutiveDashboardPage() {
  const handleApprovePolicy = () => {
    alert("Policy implementation approved!\n\nThe following actions will be executed:\n• Premium adjustments\n• Provider negotiations\n• Enhanced pre-authorization\n• Fraud investigations");
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Executive Command (Hilir)</h1>
            <p className="text-muted-foreground">Strategic insights and policy implementation</p>
          </div>
        </div>
        <Badge className="bg-primary/10 text-primary border-primary/20">
          Role: Strategic Manager
        </Badge>
      </div>

      {/* Top KPIs */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <Card className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl">
          <div className="flex items-start justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <ArrowUpRight className="w-5 h-5 text-destructive" />
          </div>
          <p className="text-sm text-muted-foreground mb-1">Total Claims Increase</p>
          <p className="text-3xl font-bold text-foreground mb-1">+25.5%</p>
          <p className="text-xs text-destructive">vs. last quarter</p>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100 rounded-xl">
          <div className="flex items-start justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-success flex items-center justify-center shadow-lg">
              <TrendingDown className="w-6 h-6 text-white" />
            </div>
            <TrendingDown className="w-5 h-5 text-success" />
          </div>
          <p className="text-sm text-muted-foreground mb-1">Predicted Savings</p>
          <p className="text-3xl font-bold text-foreground mb-1">$7.7M</p>
          <p className="text-xs text-success">with AI optimization</p>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-xl">
          <div className="flex items-start justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-warning flex items-center justify-center shadow-lg">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <AlertTriangle className="w-5 h-5 text-warning" />
          </div>
          <p className="text-sm text-muted-foreground mb-1">High-Risk Claims</p>
          <p className="text-3xl font-bold text-foreground mb-1">23%</p>
          <p className="text-xs text-warning">require action</p>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 rounded-xl">
          <div className="flex items-start justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <CheckCircle2 className="w-5 h-5 text-success" />
          </div>
          <p className="text-sm text-muted-foreground mb-1">Model Confidence</p>
          <p className="text-3xl font-bold text-foreground mb-1">96.8%</p>
          <p className="text-xs text-success">validated accuracy</p>
        </Card>
      </div>

      {/* Risk Percentile Summary & Financial Impact */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Risk Tier Distribution */}
        <Card className="p-6 bg-white rounded-xl border border-border">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">Risk Percentile Summary</h3>
            <p className="text-sm text-muted-foreground">Claim distribution across risk tiers</p>
          </div>

          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={riskTierData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {riskTierData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #E5E7EB',
                  borderRadius: '12px',
                  padding: '12px'
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="bg-destructive/10 p-3 rounded-lg border border-destructive/20">
              <div className="text-xs text-muted-foreground">Tier 1: Critical</div>
              <div className="text-xl font-bold text-destructive">5%</div>
            </div>
            <div className="bg-warning/10 p-3 rounded-lg border border-warning/20">
              <div className="text-xs text-muted-foreground">Tier 2: High</div>
              <div className="text-xl font-bold text-warning">18%</div>
            </div>
          </div>
        </Card>

        {/* Financial Impact */}
        <Card className="p-6 bg-white rounded-xl border border-border">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">Financial Impact Projection</h3>
            <p className="text-sm text-muted-foreground">Cost optimization with AI recommendations</p>
          </div>

          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={financialTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorBaseline" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#d4183d" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#d4183d" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#27AE60" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#27AE60" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="month" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #E5E7EB',
                  borderRadius: '12px',
                  padding: '12px'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="baseline" 
                stroke="#d4183d" 
                fillOpacity={1} 
                fill="url(#colorBaseline)" 
                name="Baseline Cost"
              />
              <Area 
                type="monotone" 
                dataKey="predicted" 
                stroke="#27AE60" 
                fillOpacity={1} 
                fill="url(#colorPredicted)"
                name="With AI Optimization"
              />
            </AreaChart>
          </ResponsiveContainer>

          <div className="bg-gradient-to-r from-success/10 to-success/5 p-4 rounded-lg border border-success/20 mt-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Projected Annual Savings</div>
                <div className="text-2xl font-bold text-success">$7,740,000</div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-success flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Strategic Action Cards */}
      <Card className="p-6 bg-white rounded-xl border border-border mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Strategic Action Recommendations
            </h3>
            <p className="text-sm text-muted-foreground">AI-generated initiatives for risk mitigation</p>
          </div>
          <Badge className="bg-primary/10 text-primary border-primary/20">
            4 Recommendations
          </Badge>
        </div>

        <div className="grid gap-4">
          {strategicActions.map((action) => (
            <div
              key={action.id}
              className="p-5 rounded-xl border-2 border-border hover:border-primary/50 bg-gradient-to-r from-white to-secondary/20 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-base">{action.title}</h4>
                    <Badge 
                      className={`text-xs ${
                        action.impact === 'Critical' 
                          ? 'bg-destructive text-white' 
                          : action.impact === 'High'
                          ? 'bg-warning text-white'
                          : 'bg-primary/10 text-primary'
                      }`}
                    >
                      {action.impact} Impact
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{action.description}</p>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-success" />
                      <span className="text-sm font-medium text-success">{action.savings}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">{action.confidence}% Confidence</span>
                    </div>
                    <Badge variant="outline" className="text-xs">{action.category}</Badge>
                  </div>
                </div>

                <div className="ml-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/10 to-purple-50 flex items-center justify-center border border-primary/20">
                    <div className="text-center">
                      <div className="text-xl font-bold text-primary">{action.confidence}</div>
                      <div className="text-[10px] text-muted-foreground">Score</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Policy Approval Section */}
      <Card className="p-8 bg-gradient-to-br from-primary/5 via-purple-50 to-indigo-50 rounded-xl border-2 border-primary/30">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-xl">
              <CheckCircle2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-1">Ready for Policy Implementation</h3>
              <p className="text-sm text-muted-foreground max-w-2xl">
                All strategic recommendations have been validated and are ready for official approval. 
                This will trigger automated workflows across pricing, provider management, and fraud prevention systems.
              </p>
              <div className="flex gap-2 mt-3">
                <Badge className="bg-success text-white">Data Validated ✓</Badge>
                <Badge className="bg-success text-white">Risk Assessed ✓</Badge>
                <Badge className="bg-success text-white">Impact Calculated ✓</Badge>
              </div>
            </div>
          </div>

          <Button
            onClick={handleApprovePolicy}
            className="bg-gradient-to-r from-primary to-purple-600 hover:from-purple-600 hover:to-primary text-white px-8 h-14 rounded-xl shadow-xl shadow-primary/30 transition-all text-base whitespace-nowrap"
          >
            <CheckCircle2 className="w-5 h-5 mr-2" />
            Approve & Implement Policy
          </Button>
        </div>
      </Card>
    </div>
  );
}
