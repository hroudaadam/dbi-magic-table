import { values } from "d3";
import * as React from "react";

export interface State {
    data,
    size,
    apiUrl
}

export const initialState: State = {
    data: {
        columns: [],
        rows: []
    },
    size: 200,
    apiUrl: ""
}

export class ReactCircleCard extends React.Component<{}, State>{

    public state: State = initialState;
    private static updateCallback: (data: object) => void = null;

    constructor(props: any) {
        super(props);
        this.state = initialState;
        this.handleSaveBtnClick = this.handleSaveBtnClick.bind(this);
    }

    public static update(newState: State) {
        if (typeof ReactCircleCard.updateCallback === 'function') {
            ReactCircleCard.updateCallback(newState);
        }
    }

    public componentWillMount() {
        ReactCircleCard.updateCallback = (newState: State): void => { this.setState(newState); };
        this.transformBody();
    }

    public componentWillUnmount() {
        ReactCircleCard.updateCallback = null;
    }

    private handleCellChanged(eventContext, event) {
        let value = event.target.value;
        let { rowI, colI } = eventContext;

        let rows = this.state.data.rows;
        rows[rowI][colI] = value;

        this.setState((prevState => ({
            data: {
                columns: prevState.data.columns,
                rows: prevState.data.rows
            },
            size: prevState.size,
            apiUrl: prevState.apiUrl
        })));
    }

    private getIndexOfPkCol() {
        var cols: Array<String> = this.state.data.columns;
        return cols.findIndex(col => col === "ID");
    }

    private handleSaveBtnClick(event) {
        if (this.getIndexOfPkCol() < 0) {
            return;
        }

        // var url = "https://prod-140.westeurope.logic.azure.com:443/workflows/101633d73f5447d2b60a837670fdbadc/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=3B_Oq59FZuJVXG8nq3k4pHLgTn64p6i7FlUwTTNQIsw";
        var url = this.state.apiUrl;
        var body = this.transformBody();

        fetch(url, {
            method: "POST",
            body: JSON.stringify(body)
        })
            .then((resp) => {
                resp.text();
            })
            .then((text) => {
                console.log("response: " + text);
            })
            .catch((err) => {
                console.error("error: " + err);
            })
    }

    private transformBody() {
        var newBody = [];
        const rows = this.state.data.rows;
        const cols = this.state.data.columns;

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            let newObjectRow = {};

            for (let j = 0; j < cols.length; j++) {
                const col = cols[j];
                newObjectRow[col] = row[j];
            }
            newBody.push(newObjectRow);
        }
        return newBody;
    }

    private renderTableBody() {
        const colsCount = this.state.data.columns.length;
        let tableBodyJsx = [];
        const pkColIndex = this.getIndexOfPkCol();

        for (let i = 0; i < this.state.data.rows.length; i++) {

            const row = this.state.data.rows[i];
            let rowsJsx = [];

            for (let j = 0; j < colsCount; j++) {
                if (pkColIndex != j) {
                    var value = row[j];

                    const eventContext = { rowI: i, colI: j };

                    rowsJsx.push(
                        <td >
                            <input className="input-cell" type="text" value={value} onChange={this.handleCellChanged.bind(this, eventContext)} />
                        </td>
                    );
                }

            }

            tableBodyJsx.push(
                <tr key={"row-" + i}>
                    {rowsJsx}
                </tr>
            );
        }
        return tableBodyJsx;
    }

    private renderTableHeader() {
        let tableHeaderJsx = [];
        const cols = this.state.data.columns;
        const pkColIndex = this.getIndexOfPkCol();

        for (let i = 0; i < cols.length; i++) {

            if (pkColIndex != i) {
                const column = cols[i];

                tableHeaderJsx.push(
                    <th>{column}</th>
                )
            }

        }
        return tableHeaderJsx;
    }


    render() {
        const sizeStyle = { height: this.state.size };

        if (this.state.data.columns.length > 0) {
            return (
                <div>
                    <div className="flex--justify-right mb-2">
                        <button className="button" onClick={this.handleSaveBtnClick}>Save changes</button>
                    </div>
                    <div className="table-scroll" style={sizeStyle}>
                        <table>
                            <thead>
                                <tr>
                                    {this.renderTableHeader()}
                                </tr>
                            </thead>
                            <tbody>
                                {this.renderTableBody()}
                            </tbody>
                        </table>

                    </div>
                </div>
            )
        }
        else {
            return (
                <div className="error-block">
                    <span>Nejsou k dispozici žádná data</span>
                </div>
            )
        }

    }
}

export default ReactCircleCard;