"use strict";
import powerbi from "powerbi-visuals-api";

import DataView = powerbi.DataView;
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;

import * as React from "react";
import * as ReactDOM from "react-dom";
import { ReactCircleCard, initialState } from "./component";
import IViewport = powerbi.IViewport;

import "./../style/visual.less";

export class Visual implements IVisual {
    private target: HTMLElement;
    private reactRoot: React.ComponentElement<any, any>;
    private viewport: IViewport;

    constructor(options: VisualConstructorOptions) {
        this.reactRoot = React.createElement(ReactCircleCard, {});
        this.target = options.element;

        ReactDOM.render(this.reactRoot, this.target);
    }

    public update(options: VisualUpdateOptions) {

        if (options.dataViews && options.dataViews[0]){
            const dataView: DataView = options.dataViews[0];
            const data = this.transformData(dataView);            
            const size = options.viewport.height - 80;

            // console.log(data);

            ReactCircleCard.update({
                data: data,
                size: size
            });
        } else {
            this.clear();
        }
    }

    private transformData(dataView) {
        let columnsRaw = dataView.table.columns;
        let columns = [];
        for (let i = 0; i < columnsRaw.length; i++) {
            const column = columnsRaw[i];
            columns.push(column.displayName);     
        }

        return {
            columns: columns,
            rows: dataView.table.rows
        }
    }

    private clear() {
        // ReactCircleCard.update(initialState);
    }
}