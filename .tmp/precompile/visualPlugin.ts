import { Visual } from "../../src/visual";
import powerbiVisualsApi from "powerbi-visuals-api"
import IVisualPlugin = powerbiVisualsApi.visuals.plugins.IVisualPlugin
import VisualConstructorOptions = powerbiVisualsApi.extensibility.visual.VisualConstructorOptions
var powerbiKey: any = "powerbi";
var powerbi: any = window[powerbiKey];

var DBI_magicTableE4A5FEA73E9F42BCB6D6B1E16E59EF33_DEBUG: IVisualPlugin = {
    name: 'DBI_magicTableE4A5FEA73E9F42BCB6D6B1E16E59EF33_DEBUG',
    displayName: 'DBI_magicTable',
    class: 'Visual',
    apiVersion: '2.6.0',
    create: (options: VisualConstructorOptions) => {
        if (Visual) {
            return new Visual(options);
        }

        throw 'Visual instance not found';
    },
    custom: true
};

if (typeof powerbi !== "undefined") {
    powerbi.visuals = powerbi.visuals || {};
    powerbi.visuals.plugins = powerbi.visuals.plugins || {};
    powerbi.visuals.plugins["DBI_magicTableE4A5FEA73E9F42BCB6D6B1E16E59EF33_DEBUG"] = DBI_magicTableE4A5FEA73E9F42BCB6D6B1E16E59EF33_DEBUG;
}

export default DBI_magicTableE4A5FEA73E9F42BCB6D6B1E16E59EF33_DEBUG;