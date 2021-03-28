"use strict";
import 'core-js/stable';
// import './../style/css/bootstrap.min.css';
import powerbi from 'powerbi-visuals-api';
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
import VisualObjectInstance = powerbi.VisualObjectInstance;
import DataView = powerbi.DataView;
import VisualObjectInstanceEnumerationObject = powerbi.VisualObjectInstanceEnumerationObject;
import { VisualSettings } from "./settings";

import * as React from "react";
import * as ReactDOM from "react-dom";
import { ReactCircleCard, initialState } from "./component";
import IViewport = powerbi.IViewport;

import "./../style/visual.less";
import 'fontsource-roboto';

export class Visual implements IVisual {
    private target: HTMLElement;
    private reactRoot: React.ComponentElement<any, any>;
    private settings: VisualSettings;

    constructor(options: VisualConstructorOptions) {
        this.reactRoot = React.createElement(ReactCircleCard, {});
        this.target = options.element;

        ReactDOM.render(this.reactRoot, this.target);
    }

    public update(options: VisualUpdateOptions) {
        this.settings = Visual.parseSettings(options && options.dataViews && options.dataViews[0]);

        if (options.dataViews && options.dataViews[0]) {
            const formattedDataview = this.transformDataview(options.dataViews[0]);
            const size = options.viewport.height - 40;

            let apiUrl: String = "https://prod-140.westeurope.logic.azure.com:443/workflows/101633d73f5447d2b60a837670fdbadc/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=3B_Oq59FZuJVXG8nq3k4pHLgTn64p6i7FlUwTTNQIsw";
            let fontSize: Number = 12;
            if (options.dataViews[0].metadata.objects) {
                if (options.dataViews[0].metadata.objects.apiTest.apiUrl) {
                    apiUrl = options.dataViews[0].metadata.objects.apiTest.apiUrl.toString();
                }
                if (options.dataViews[0].metadata.objects.apiTest.fontSize) {
                    fontSize = parseInt(options.dataViews[0].metadata.objects.apiTest.fontSize.toString());
                }
            }

            ReactCircleCard.update({
                rows: formattedDataview.rows,
                cols: formattedDataview.cols,
                colsTypes: formattedDataview.colsTypes,

                pkCol: formattedDataview.pkCol,
                pkColIndex: formattedDataview.pkColIndex,

                delCol: formattedDataview.delCol,
                delColIndex: formattedDataview.delColIndex,

                size: size,
                fontSize: fontSize,
                delButtVis: false,

                apiUrl: apiUrl,

                editedRows: [],
            });
        } else {
            ReactCircleCard.update(initialState);
        }
    }

    private static parseSettings(dataView: DataView): VisualSettings {
        return <VisualSettings>VisualSettings.parse(dataView);
    }

    public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] | VisualObjectInstanceEnumerationObject {
        return VisualSettings.enumerateObjectInstances(this.settings || VisualSettings.getDefault(), options);
    }

    private transformDataview(dataView) {
        let colsRaw = dataView.table.columns;
        let rowsRaw = dataView.table.rows;
        const delCol = "DEL";
        let cols = [];

        // column transformation
        for (let i = 0; i < colsRaw.length; i++) {
            const column = colsRaw[i];
            cols.push(column.displayName);
        }        

        // helper column for delete
        cols.push(delCol);
        let delColIndex = cols.length - 1;

        // get name of column with PK
        let pkColFound = colsRaw.find(col => col.roles.id);
        let pkCol = pkColFound.displayName;

        // get index of column with PK
        let pkColIndex = cols.findIndex(col => col === pkCol);

        // get data type of columns
        let colsTypes = [];
        for (let i = 0; i < colsRaw.length; i++) {
            const col = colsRaw[i];
            if (col.type.dateTime) {
                colsTypes.push("D");
            }
            else {
                colsTypes.push("*");
            }
        }
        // helper column data type for delete
        colsTypes.push("*");

        // transform rows
        let rows = [];
        for (let i = 0; i < rowsRaw.length; i++) {
            const row = rowsRaw[i];
            let newRowObject = {};

            for (let j = 0; j < cols.length; j++) {
                const col = cols[j];
                // if value is datetime then parse
                if (colsTypes[j] === "D") {
                    newRowObject[col] = this.formatDate(row[j]);
                }
                // else normal value
                else {
                    newRowObject[col] = row[j];
                }
            }
            // helper column for delete - bool if the row was deleted
            newRowObject[delCol] = false;

            rows.push(newRowObject);
        }

        // sort rows - ID
        rows.sort(function(a, b) { 
            return b[pkCol] - a[pkCol];
          });

        return {
            rows: rows,
            cols: cols,
            colsTypes: colsTypes,

            pkCol: pkCol,
            pkColIndex: pkColIndex,

            delCol: delCol,
            delColIndex: delColIndex,
        }
    }

    private formatDate(rawDate) {
        let date = new Date(rawDate);
        date.setDate(date.getDate() + 1);

        let strDay = (date.getUTCDate() < 10 ? "0" : "") + date.getUTCDate();
        let strMonth = ((date.getUTCMonth() + 1) < 10 ? "0" : "") + (date.getUTCMonth() + 1);
        let strYear = date.getUTCFullYear();
        let strDate = strDay + "/" + strMonth + "/" + strYear

        return strDate;
    }
}