import React from "react";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    PieChart,
    Pie,
    Cell,
    Legend,
} from "recharts";

export default function CreateAiDashboardCharts({ ai_response_data = {} }) {
    // Fallback demo data if no props passed
    const ai_response = ai_response_data?.ai_response || {
        prioritized_action_list: [
            {
                task_summary: "Call John from ABC to review proposal status",
                priority_score: 90,
            },
            {
                task_summary:
                    "Email Aisha from FoodTech with pricing breakdown",
                priority_score: 80,
            },
            {
                task_summary:
                    "Follow-up with Rahim from GreenWorks to remind about demo scheduling",
                priority_score: 75,
            },
            {
                task_summary:
                    "Call Zara from SkyLine to discuss upsell opportunities",
                priority_score: 70,
            },
            {
                task_summary:
                    "Email Omar from GigaSoft regarding renewal terms update",
                priority_score: 65,
            },
        ],
        lead_risk_alerts: [
            { lead_name: "Omar", alerts: 1 },
            { lead_name: "Rahim", alerts: 1 },
            { lead_name: "Harun", alerts: 1 },
        ],
        overdue_tasks: [
            "Follow-up with Jane from MediaBay",
            "Call Harun from BuildPro",
        ],
        quick_wins: ["Email Anik", "Call Kabir"],
        workload_insights: {
            meetings_count: 1,
            calls_count: 4,
            followups_count: 2,
            emails_count: 3,
        },
    };

    // --------------------------------------
    // DATA PREPARATION
    // --------------------------------------

    const priorityScoreData =
        ai_response?.prioritized_action_list?.map((item) => ({
            task: item.task_summary,
            score: item.priority_score,
        })) || [];

    const riskAlertsData =
        ai_response?.lead_risk_alerts?.map((item) => ({
            lead: item.lead_name,
            alerts: item.alerts || 1,
        })) || [];

    const workload = ai_response?.workload_insights || {};

    const workloadData = [
        { type: "Meetings", count: workload.meetings_count || 0 },
        { type: "Calls", count: workload.calls_count || 0 },
        { type: "Follow-ups", count: workload.followups_count || 0 },
        { type: "Emails", count: workload.emails_count || 0 },
    ];

    const taskComparisonData = [
        {
            label: "Overdue Tasks",
            count: ai_response.overdue_tasks?.length || 0,
        },
        { label: "Quick Wins", count: ai_response.quick_wins?.length || 0 },
    ];

    const COLORS = ["#3f51b5", "#ff9800", "#4caf50", "#e91e63", "#009688"];

    // --------------------------------------
    // RENDER
    // --------------------------------------

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1️⃣ Priority Score Bar Chart */}
            <div className="p-4 shadow rounded bg-base-100">
                <h3 className="font-bold text-lg mb-3">
                    Priority Score by Task
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={priorityScoreData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="task" hide />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="score">
                            {priorityScoreData.map((_, i) => (
                                <Cell
                                    key={i}
                                    fill={COLORS[i % COLORS.length]}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* 2️⃣ Lead Risk Alerts Pie Chart */}
            <div className="p-4 shadow rounded bg-base-100">
                <h3 className="font-bold text-lg mb-3">Lead Risk Alerts</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={riskAlertsData}
                            dataKey="alerts"
                            nameKey="lead"
                            outerRadius={100}
                            label
                        >
                            {riskAlertsData.map((_, i) => (
                                <Cell
                                    key={i}
                                    fill={COLORS[i % COLORS.length]}
                                />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* 3️⃣ Workload Summary */}
            <div className="p-4 shadow rounded bg-base-100">
                <h3 className="font-bold text-lg mb-3">Workload Insights</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={workloadData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="type" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count">
                            {workloadData.map((_, i) => (
                                <Cell
                                    key={i}
                                    fill={COLORS[i % COLORS.length]}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* 4️⃣ Overdue vs Quick Wins */}
            <div className="p-4 shadow rounded bg-base-100">
                <h3 className="font-bold text-lg mb-3">
                    Overdue vs Quick Wins
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={taskComparisonData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="label" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count">
                            {taskComparisonData.map((_, i) => (
                                <Cell
                                    key={i}
                                    fill={COLORS[i % COLORS.length]}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
