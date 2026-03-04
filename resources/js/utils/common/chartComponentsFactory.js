/**
 * Dynamic chart component loader
 *
 * Maps backend-provided component names (jsComponent)
 * to actual dynamic imports.
 *
 * Add new charts here when creating new chart components.
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */

const chartComponentsFactory = {
    CreatePieChart: () =>
        import("@/Components/Tenant/GraphsAndTrees/CreatePieChart"),

    CreateBarChart: () =>
        import("@/Components/Tenant/GraphsAndTrees/CreateBarChart"),

    CreateCustomShapeBarChart: () =>
        import("@/Components/Tenant/GraphsAndTrees/CreateCustomShapeBarChart"),

    CreateComposedBarChart: () =>
        import("@/Components/Tenant/GraphsAndTrees/CreateComposedBarChart"),

    CreateNeedlePieChart: () =>
        import("@/Components/Tenant/GraphsAndTrees/CreateNeedlePieChart"),

    CreateFunnelSvgChart: () =>
        import("@/Components/Tenant/GraphsAndTrees/CreateFunnelSvgChart"),

    CreateScatterChart: () =>
        import("@/Components/Tenant/GraphsAndTrees/CreateScatterChart"),

    CreateBarVerticalChart: () =>
        import("@/Components/Tenant/GraphsAndTrees/CreateBarVerticalChart"),
};

export default chartComponentsFactory;
