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

export class Visual implements IVisual {
    private target: HTMLElement;
    private reactRoot: React.ComponentElement<any, any>;
    private viewport: IViewport;
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
            const size = options.viewport.height - 50;

            // apiUrl object inic. hodnoty
            var apiUrl: String = "";
            if (options.dataViews[0].metadata.objects) {
                if (options.dataViews[0].metadata.objects.apiTest.apiUrl) {
                    apiUrl = options.dataViews[0].metadata.objects.apiTest.apiUrl.toString();
                }
            }

            ReactCircleCard.update({
                data: formattedDataview.data,
                cols: formattedDataview.cols,
                colsTypes: formattedDataview.colsTypes,
                pkCol: formattedDataview.pkCol,
                size: size,
                apiUrl: apiUrl,
                showModal: false,
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
        let rows = dataView.table.rows;

        // transofrmace sloupců
        let cols = [];
        for (let i = 0; i < colsRaw.length; i++) {
            const column = colsRaw[i];
            cols.push(column.displayName);
        }

        // získání názvu sloupce s ID
        let pkCol = null;
        for (let i = 0; i < colsRaw.length; i++) {
            const col = colsRaw[i];
            if (col.roles.id) {
                pkCol = col.displayName;
                break;
            }
        }

        // získání datových typů sloupců
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

        // transofrmace řádků
        let data = [];
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            let newRowObject = {};

            for (let j = 0; j < cols.length; j++) {
                const col = cols[j];
                // pokud je hodnota typu DateTime, pak zparsovat
                if (colsTypes[j] === "D") {
                    newRowObject[col] = this.formatDate(row[j]);
                }
                // jinak pracovat jako s normální hodnotou
                else {
                    newRowObject[col] = row[j];
                }
            }
            data.push(newRowObject);
        }

        return {
            cols: cols,
            data: data,
            pkCol: pkCol,
            colsTypes: colsTypes
        }
    }

    private formatDate(rawDate) {
        var date = new Date(rawDate);
        date.setDate(date.getDate() + 1);

        var strDay = (date.getUTCDate() < 10 ? "0" : "") + date.getUTCDate();
        var strMonth = ((date.getUTCMonth() + 1) < 10 ? "0" : "") + (date.getUTCMonth() + 1);
        var strYear = date.getUTCFullYear();
        var strDate = strDay + "/" + strMonth + "/" + strYear

        return strDate;
    }
}