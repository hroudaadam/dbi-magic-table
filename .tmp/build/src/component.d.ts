import * as React from "react";
export interface State {
    data: any;
}
export declare const initialState: State;
export declare class ReactCircleCard extends React.Component<{}, State> {
    state: State;
    private static updateCallback;
    constructor(props: any);
    static update(newState: State): void;
    componentWillMount(): void;
    componentWillUnmount(): void;
    private handleCellChanged;
    private getIndexOfPkCol;
    private handleSaveBtnClick;
    private transformBody;
    private renderTableBody;
    private renderTableHeader;
    render(): JSX.Element;
}
export default ReactCircleCard;
